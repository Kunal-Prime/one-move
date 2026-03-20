import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { type AnalysisResponse } from "../shared/schema.js";
import { z } from "zod";
import OpenAI from "openai";

// OpenAI client will be initialized inside the route handler to prevent top-level crashes

const SYSTEM_PROMPT = `You are OneMove.

Your task is to convert mental overload into one clear action.

You are NOT a chatbot or therapist.
Do NOT ask follow-up questions.
Do NOT provide multiple options.
Do NOT expand the scope.

You MUST respond in exactly this JSON format:
{
  "coreProblem": "One sentence only identifying the real bottleneck.",
  "controlFactors": {
    "control": ["Point 1 starting with ✅", "Point 2 starting with ✅"],
    "noControl": ["Point 1 starting with ❌", "Point 2 starting with ❌"]
  },
  "nextMove": "⚡ Exactly ONE specific action doable in <60 minutes."
}

If the user provides clarification or refinement:
- Keep the same core problem.
- Make the action clearer or easier.
- Do NOT add new actions.
- Do NOT add explanations.
- Shorter is better.

Tone: calm, neutral, direct.
End after delivering clarity.`;

export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {
  
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post(api.moves.create.path, async (req, res) => {
    try {
      console.log("POST /api/moves - request received:", req.body);
      const input = api.moves.create.input.parse(req.body);
      
      let formattedAnalysis: AnalysisResponse;

      try {
        console.log("POST /api/moves - initializing OpenAI...");
        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
          baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        });

        console.log("POST /api/moves - calling OpenAI with 8s timeout...");
        
        // Timeout promise
        const timeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("OpenAI timeout")), 8000)
        );

        const completionPromise = client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: input.brainDump }
          ],
          response_format: { type: "json_object" },
        });

        const completion = await Promise.race([completionPromise, timeout]) as any;
        
        console.log("POST /api/moves - OpenAI response received");
        const analysisRaw = completion.choices[0].message.content || "{}";
        const analysis = JSON.parse(analysisRaw);

        formattedAnalysis = {
          coreProblem: analysis.coreProblem || analysis.core_problem || "Processing thoughts...",
          controlFactors: analysis.controlFactors || analysis.control_factors || { control: [], noControl: [] },
          nextMove: analysis.nextMove || analysis.next_move || "Take a deep breath and re-submit if needed."
        };
      } catch (aiErr) {
        console.error("POST /api/moves - AI error/timeout, using fallback:", aiErr);
        formattedAnalysis = {
          coreProblem: "Service is currently experiencing high demand.",
          controlFactors: {
            control: ["✅ You can re-submit the request", "✅ You can try again in a few minutes"],
            noControl: ["❌ Instant AI processing at this moment"]
          },
          nextMove: "⚡ Please wait a minute and try again for full AI analysis."
        };
      }

      console.log("POST /api/moves - saving to storage...");
      const move = await storage.createMove(input, formattedAnalysis);
      
      const response = {
        ...move,
        parsedControlFactors: JSON.parse(move.controlFactors as string)
      };

      console.log("POST /api/moves - success:", move.id);
      res.status(201).json(response);
    } catch (err) {
      console.error("POST /api/moves - critical error:", err);
      res.status(200).json({ 
        id: 0,
        brainDump: req.body?.brainDump || "",
        coreProblem: "System is experiencing temporary difficulty.",
        nextMove: "⚡ Try refreshing the page.",
        parsedControlFactors: { control: [], noControl: [] },
        isCompleted: false
      });
    }
  });

  app.get(api.moves.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const move = await storage.getMove(id);
    if (!move) {
      return res.status(404).json({ message: "Move not found" });
    }
    const response = {
      ...move,
      parsedControlFactors: JSON.parse(move.controlFactors as string)
    };
    res.json(response);
  });

  app.patch(api.moves.complete.path, async (req, res) => {
    const id = Number(req.params.id);
    const move = await storage.completeMove(id);
    if (!move) {
      return res.status(404).json({ message: "Move not found" });
    }
    const response = {
      ...move,
      parsedControlFactors: JSON.parse(move.controlFactors as string)
    };
    res.json(response);
  });

  return httpServer;
}
