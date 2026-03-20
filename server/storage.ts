import { db } from "./db.js";
import { moves, type Move, type CreateMoveRequest, type AnalysisResponse } from "../shared/schema.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  createMove(move: CreateMoveRequest, analysis: AnalysisResponse): Promise<Move>;
  getMove(id: number): Promise<Move | undefined>;
  completeMove(id: number): Promise<Move | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createMove(request: CreateMoveRequest, analysis: AnalysisResponse): Promise<Move> {
    if (!db) throw new Error("Database not initialized");
    const [move] = await db.insert(moves).values({
      brainDump: request.brainDump,
      coreProblem: analysis.coreProblem,
      controlFactors: JSON.stringify(analysis.controlFactors),
      nextMove: analysis.nextMove,
    }).returning();
    return move;
  }

  async getMove(id: number): Promise<Move | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [move] = await db.select().from(moves).where(eq(moves.id, id));
    return move;
  }

  async completeMove(id: number): Promise<Move | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [move] = await db.update(moves)
      .set({ isCompleted: true })
      .where(eq(moves.id, id))
      .returning();
    return move;
  }
}

export class MemStorage implements IStorage {
  private moves: Map<number, Move>;
  private currentId: number;

  constructor() {
    this.moves = new Map();
    this.currentId = 1;
  }

  async createMove(request: CreateMoveRequest, analysis: AnalysisResponse): Promise<Move> {
    const id = this.currentId++;
    const move: Move = {
      id,
      brainDump: request.brainDump,
      coreProblem: analysis.coreProblem,
      controlFactors: JSON.stringify(analysis.controlFactors),
      nextMove: analysis.nextMove,
      isCompleted: false,
      calendarLink: null,
      theme: "dark",
      createdAt: new Date(),
    };
    this.moves.set(id, move);
    return move;
  }

  async getMove(id: number): Promise<Move | undefined> {
    return this.moves.get(id);
  }

  async completeMove(id: number): Promise<Move | undefined> {
    const move = this.moves.get(id);
    if (!move) return undefined;
    const updated = { ...move, isCompleted: true };
    this.moves.set(id, updated);
    return updated;
  }
}

export const storage = db ? new DatabaseStorage() : new MemStorage();
