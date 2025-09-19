import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for authentication and profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  journalType: text("journal_type").notNull().default("body"), // body, identity, reframing
  emotionLevel: integer("emotion_level").notNull(), // 1-5 scale
  emotionType: text("emotion_type").notNull(), // sad, neutral, happy, etc.
  content: text("content").notNull(),
  bodyMapping: jsonb("body_mapping").default('{}'), // JSON object for body emotion mapping
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyReflections = pgTable("daily_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer"),
  date: timestamp("date").defaultNow().notNull(),
});

export const crisisEvents = pgTable("crisis_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  resolved: integer("resolved").default(0), // 0 = active, 1 = resolved
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
  dailyReflections: many(dailyReflections),
  crisisEvents: many(crisisEvents),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

export const dailyReflectionsRelations = relations(dailyReflections, ({ one }) => ({
  user: one(users, {
    fields: [dailyReflections.userId],
    references: [users.id],
  }),
}));

export const crisisEventsRelations = relations(crisisEvents, ({ one }) => ({
  user: one(users, {
    fields: [crisisEvents.userId],
    references: [users.id],
  }),
}));

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

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey(),
  nickname: varchar("nickname", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;
export type InsertCrisisEvent = z.infer<typeof insertCrisisEventSchema>;
export type CrisisEvent = typeof crisisEvents.$inferSelect;
