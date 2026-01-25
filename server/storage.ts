import { db } from "./db";
import { moves, type Move, type CreateMoveRequest, type AnalysisResponse } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createMove(move: CreateMoveRequest, analysis: AnalysisResponse): Promise<Move>;
  getMove(id: number): Promise<Move | undefined>;
  completeMove(id: number): Promise<Move | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createMove(request: CreateMoveRequest, analysis: AnalysisResponse): Promise<Move> {
    const [move] = await db.insert(moves).values({
      brainDump: request.brainDump,
      coreProblem: analysis.coreProblem,
      controlFactors: JSON.stringify(analysis.controlFactors),
      nextMove: analysis.nextMove,
    }).returning();
    return move;
  }

  async getMove(id: number): Promise<Move | undefined> {
    const [move] = await db.select().from(moves).where(eq(moves.id, id));
    return move;
  }

  async completeMove(id: number): Promise<Move | undefined> {
    const [move] = await db.update(moves)
      .set({ isCompleted: true })
      .where(eq(moves.id, id))
      .returning();
    return move;
  }
}

export const storage = new DatabaseStorage();
