import {
  type JournalEntry,
  type InsertJournalEntry,
  type DailyReflection,
  type InsertDailyReflection,
  type CrisisEvent,
  type InsertCrisisEvent,
  journalEntries,
  dailyReflections,
  crisisEvents,
} from "@shared/schema";
import { db } from "./db";
import { and, desc, eq, gte } from "drizzle-orm";

export interface IStorage {
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined>;

  createDailyReflection(
    reflection: InsertDailyReflection,
  ): Promise<DailyReflection>;
  getTodayReflection(userId: string): Promise<DailyReflection | undefined>;
  getDailyReflections(userId: string): Promise<DailyReflection[]>;

  createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent>;
  getCrisisEvents(userId: string): Promise<CrisisEvent[]>;

  getEmotionStats(): Promise<{
    averageEmotion: number;
    totalEntries: number;
    weeklyAverage: number;
    monthlyStreak: number;
  }>;
}

class HybridStorage implements IStorage {
  private journalCache = new Map<string, JournalEntry>();
  private reflectionCache = new Map<string, DailyReflection>();
  private crisisCache = new Map<string, CrisisEvent>();

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [row] = await db
      .insert(journalEntries)
      .values({
        ...entry,
        journalType: entry.journalType ?? "emotion",
        bodyMapping: entry.bodyMapping ?? {},
      })
      .returning();
    const normalized = this.normalizeJournal(row);
    this.journalCache.set(normalized.id, normalized);
    return normalized;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const rows = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt));
      const normalized = rows.map((row) => this.normalizeJournal(row));
      normalized.forEach((entry) => this.journalCache.set(entry.id, entry));
      return normalized;
    } catch {
      return Array.from(this.journalCache.values())
        .filter((entry) => entry.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry | undefined> {
    try {
      const [row] = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);
      if (!row || row.userId !== userId) return undefined;
      const normalized = this.normalizeJournal(row);
      this.journalCache.set(id, normalized);
      return normalized;
    } catch {
      const cached = this.journalCache.get(id);
      if (cached?.userId !== userId) return undefined;
      return cached;
    }
  }

  async createDailyReflection(
    reflection: InsertDailyReflection,
  ): Promise<DailyReflection> {
    const [row] = await db
      .insert(dailyReflections)
      .values({
        ...reflection,
        answer: reflection.answer ?? null,
      })
      .returning();
    const normalized = this.normalizeReflection(row);
    this.reflectionCache.set(normalized.id, normalized);
    return normalized;
  }

  async getTodayReflection(userId: string): Promise<DailyReflection | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [row] = await db
        .select()
        .from(dailyReflections)
        .where(
          and(
            eq(dailyReflections.userId, userId),
            gte(dailyReflections.date, today),
          ),
        )
        .orderBy(desc(dailyReflections.date))
        .limit(1);
      if (!row) return undefined;
      const normalized = this.normalizeReflection(row);
      this.reflectionCache.set(normalized.id, normalized);
      return normalized;
    } catch {
      for (const reflection of this.reflectionCache.values()) {
        if (reflection.userId === userId && reflection.date >= today) {
          return reflection;
        }
      }
      return undefined;
    }
  }

  async getDailyReflections(userId: string): Promise<DailyReflection[]> {
    try {
      const rows = await db
        .select()
        .from(dailyReflections)
        .where(eq(dailyReflections.userId, userId))
        .orderBy(desc(dailyReflections.date));
      const normalized = rows.map((row) => this.normalizeReflection(row));
      normalized.forEach((reflection) =>
        this.reflectionCache.set(reflection.id, reflection),
      );
      return normalized;
    } catch {
      return Array.from(this.reflectionCache.values())
        .filter((reflection) => reflection.userId === userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  async createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent> {
    const [row] = await db.insert(crisisEvents).values(event).returning();
    const normalized = this.normalizeCrisis(row);
    this.crisisCache.set(normalized.id, normalized);
    return normalized;
  }

  async getCrisisEvents(userId: string): Promise<CrisisEvent[]> {
    try {
      const rows = await db
        .select()
        .from(crisisEvents)
        .where(eq(crisisEvents.userId, userId))
        .orderBy(desc(crisisEvents.timestamp));
      const normalized = rows.map((row) => this.normalizeCrisis(row));
      normalized.forEach((event) => this.crisisCache.set(event.id, event));
      return normalized;
    } catch {
      return Array.from(this.crisisCache.values())
        .filter((event) => event.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  }

  async getEmotionStats(userId: string): Promise<{
    averageEmotion: number;
    totalEntries: number;
    weeklyAverage: number;
    monthlyStreak: number;
  }> {
    const entries = await this.getJournalEntries(userId);
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return { averageEmotion: 0, totalEntries: 0, weeklyAverage: 0, monthlyStreak: 0 };
    }

    const averageEmotion =
      entries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / totalEntries;

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const weeklyEntries = entries.filter((entry) => entry.createdAt >= weekAgo);
    const weeklyAverage = weeklyEntries.length
      ? weeklyEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) /
        weeklyEntries.length
      : 0;

    const monthlyEntries = entries.filter((entry) => entry.createdAt >= monthAgo);
    const uniqueDays = new Set(
      monthlyEntries.map((entry) => entry.createdAt.toDateString()),
    );
    const monthlyStreak = uniqueDays.size;

    return {
      averageEmotion: Math.round(averageEmotion * 10) / 10,
      totalEntries,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      monthlyStreak,
    };
  }

  private normalizeJournal(row: JournalEntry): JournalEntry {
    return {
      ...row,
      createdAt:
        row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      bodyMapping: row.bodyMapping ?? {},
    };
  }

  private normalizeReflection(row: DailyReflection): DailyReflection {
    return {
      ...row,
      date: row.date instanceof Date ? row.date : new Date(row.date),
      answer: row.answer ?? null,
    };
  }

  private normalizeCrisis(row: CrisisEvent): CrisisEvent {
    return {
      ...row,
      timestamp:
        row.timestamp instanceof Date ? row.timestamp : new Date(row.timestamp),
      resolved: row.resolved ?? 0,
    };
  }
}

export const storage: IStorage = new HybridStorage();
