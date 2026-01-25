import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const moves = pgTable("moves", {
  id: serial("id").primaryKey(),
  brainDump: text("brain_dump").notNull(),
  coreProblem: text("core_problem").notNull(),
  controlFactors: text("control_factors").notNull(), // JSON string: { control: string[], noControl: string[] }
  nextMove: text("next_move").notNull(),
  isCompleted: boolean("is_completed").default(false),
  calendarLink: text("calendar_link"),
  createdAt: timestamp("created_at").defaultNow(),
  theme: text("theme").default("dark"),
});

// === BASE SCHEMAS ===
export const insertMoveSchema = createInsertSchema(moves).omit({ 
  id: true, 
  createdAt: true,
  isCompleted: true,
  calendarLink: true
});

// === EXPLICIT API CONTRACT TYPES ===
// Base types
export type Move = typeof moves.$inferSelect;
export type InsertMove = z.infer<typeof insertMoveSchema>;

// Request types
export type CreateMoveRequest = {
  brainDump: string;
};

// Response types
export type AnalysisResponse = {
  coreProblem: string;
  controlFactors: {
    control: string[];
    noControl: string[];
  };
  nextMove: string;
};

export type MoveResponse = Move & {
  parsedControlFactors: AnalysisResponse['controlFactors'];
};
