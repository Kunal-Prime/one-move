import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client using Replit AI integration env vars
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.moves.create.path, async (req, res) => {
    try {
      const input = api.moves.create.input.parse(req.body);
      
      // Analyze with OpenAI
      const systemPrompt = `
        You are OneMove, an expert productivity coach. 
        Your goal is to help users overcome analysis paralysis.
        Analyze the user's brain dump and output a JSON object with:
        1. "coreProblem": A punchy, empathetic paragraph that reflects the user's emotional tone and identifies the main blocker. (Bold, white text feel).
        2. "controlFactors": An object with "control" (array of strings - what they can control, start with ✅ emoji) and "noControl" (array of strings - what they cannot control, start with ❌ emoji).
           Break these down into clear, actionable bullet points.
        3. "nextMove": A specific, actionable 60-minute move. Start with a verb and include a ⚡ emoji.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.brainDump }
        ],
        response_format: { type: "json_object" },
      });

      const analysisRaw = completion.choices[0].message.content || "{}";
      const analysis = JSON.parse(analysisRaw);

      // Validate analysis structure (basic check)
      if (!analysis.coreProblem || !analysis.controlFactors || !analysis.nextMove) {
        throw new Error("Invalid AI analysis result");
      }

      const move = await storage.createMove(input, analysis);
      
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
