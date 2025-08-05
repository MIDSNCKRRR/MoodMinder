import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalType: text("journal_type").notNull().default("emotion"), // emotion, gratitude, reflection
  emotionLevel: integer("emotion_level").notNull(), // 1-5 scale
  emotionType: text("emotion_type").notNull(), // sad, neutral, happy, etc.
  content: text("content").notNull(),
  bodyMapping: jsonb("body_mapping").default('{}'), // JSON object for body emotion mapping
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyReflections = pgTable("daily_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer"),
  date: timestamp("date").defaultNow().notNull(),
});

export const crisisEvents = pgTable("crisis_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  resolved: integer("resolved").default(0), // 0 = active, 1 = resolved
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).omit({
  id: true,
  date: true,
});

export const insertCrisisEventSchema = createInsertSchema(crisisEvents).omit({
  id: true,
  timestamp: true,
  resolved: true,
});

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;
export type InsertCrisisEvent = z.infer<typeof insertCrisisEventSchema>;
export type CrisisEvent = typeof crisisEvents.$inferSelect;
