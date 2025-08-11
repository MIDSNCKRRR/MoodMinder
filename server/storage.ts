import { 
  type JournalEntry, 
  type InsertJournalEntry,
  type DailyReflection,
  type InsertDailyReflection,
  type CrisisEvent,
  type InsertCrisisEvent
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Journal Entries
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  
  // Daily Reflections
  createDailyReflection(reflection: InsertDailyReflection): Promise<DailyReflection>;
  getTodayReflection(): Promise<DailyReflection | undefined>;
  getDailyReflections(): Promise<DailyReflection[]>;
  
  // Crisis Events
  createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent>;
  getCrisisEvents(): Promise<CrisisEvent[]>;
  
  // Analytics
  getEmotionStats(): Promise<{
    averageEmotion: number;
    totalEntries: number;
    weeklyAverage: number;
    monthlyStreak: number;
  }>;
}

export class MemStorage implements IStorage {
  private journalEntries: Map<string, JournalEntry>;
  private dailyReflections: Map<string, DailyReflection>;
  private crisisEvents: Map<string, CrisisEvent>;

  constructor() {
    this.journalEntries = new Map();
    this.dailyReflections = new Map();
    this.crisisEvents = new Map();
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      journalType: insertEntry.journalType || "emotion",
      createdAt: new Date(),
      bodyMapping: insertEntry.bodyMapping || {},
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createDailyReflection(insertReflection: InsertDailyReflection): Promise<DailyReflection> {
    const id = randomUUID();
    const reflection: DailyReflection = {
      ...insertReflection,
      id,
      date: new Date(),
      answer: insertReflection.answer || null,
    };
    this.dailyReflections.set(id, reflection);
    return reflection;
  }

  async getTodayReflection(): Promise<DailyReflection | undefined> {
    const today = new Date().toDateString();
    return Array.from(this.dailyReflections.values()).find(
      reflection => reflection.date.toDateString() === today
    );
  }

  async getDailyReflections(): Promise<DailyReflection[]> {
    return Array.from(this.dailyReflections.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  async createCrisisEvent(insertEvent: InsertCrisisEvent): Promise<CrisisEvent> {
    const id = randomUUID();
    const event: CrisisEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
      resolved: 0,
    };
    this.crisisEvents.set(id, event);
    return event;
  }

  async getCrisisEvents(): Promise<CrisisEvent[]> {
    return Array.from(this.crisisEvents.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getEmotionStats(): Promise<{
    averageEmotion: number;
    totalEntries: number;
    weeklyAverage: number;
    monthlyStreak: number;
  }> {
    const entries = Array.from(this.journalEntries.values());
    const totalEntries = entries.length;
    
    if (totalEntries === 0) {
      return {
        averageEmotion: 0,
        totalEntries: 0,
        weeklyAverage: 0,
        monthlyStreak: 0,
      };
    }

    const averageEmotion = entries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / totalEntries;
    
    // Calculate weekly average (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEntries = entries.filter(entry => entry.createdAt >= weekAgo);
    const weeklyAverage = weeklyEntries.length > 0 
      ? weeklyEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / weeklyEntries.length 
      : 0;

    // Calculate monthly streak (days with entries in the last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyEntries = entries.filter(entry => entry.createdAt >= monthAgo);
    const uniqueDays = new Set(monthlyEntries.map(entry => entry.createdAt.toDateString()));
    const monthlyStreak = uniqueDays.size;

    return {
      averageEmotion: Math.round(averageEmotion * 10) / 10,
      totalEntries,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      monthlyStreak,
    };
  }
}

export const storage = new MemStorage();
