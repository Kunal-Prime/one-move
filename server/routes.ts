import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { api } from "@shared/routes.js";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using Replit AI integration env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post(api.moves.create.path, async (req, res) => {
    try {
      const input = api.moves.create.input.parse(req.body);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: input.brainDump }
        ],
        response_format: { type: "json_object" },
      });

      const analysisRaw = completion.choices[0].message.content || "{}";
      const analysis = JSON.parse(analysisRaw);

      // Map snake_case to camelCase if AI deviates, and ensure structure
      const formattedAnalysis = {
        coreProblem: analysis.coreProblem || analysis.core_problem || "",
        controlFactors: analysis.controlFactors || analysis.control_factors || { control: [], noControl: [] },
        nextMove: analysis.nextMove || analysis.next_move || ""
      };

      if (!formattedAnalysis.coreProblem || !formattedAnalysis.nextMove) {
        throw new Error("Invalid AI analysis result: Missing coreProblem or nextMove");
      }

      const move = await storage.createMove(input, formattedAnalysis);
      
      // Parse JSON string back to object for response
      const response = {
        ...move,
        parsedControlFactors: JSON.parse(move.controlFactors as string)
      };

      res.status(201).json(response);
    } catch (err) {
      console.error("Move creation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to process your request" });
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
