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
} from '@shared/schema';
import { db } from './db';
import { desc, eq, gte } from 'drizzle-orm';

export class HybridStorage implements IStorage {
  private journalEntries = new Map<string, JournalEntry>();
  private dailyReflections = new Map<string, DailyReflection>();
  private crisisEvents = new Map<string, CrisisEvent>();

  async createJournalEntry(data: InsertJournalEntry): Promise<JournalEntry> {
    const [row] = await db
      .insert(journalEntries)
      .values({
        ...data,
        journalType: data.journalType ?? 'emotion',
        bodyMapping: data.bodyMapping ?? {},
      })
      .returning();

    const entry = this.normalizeJournalEntry(row);
    this.journalEntries.set(entry.id, entry);
    return entry;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const rows = await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
      const normalized = rows.map((row) => this.normalizeJournalEntry(row));
      normalized.forEach((entry) => this.journalEntries.set(entry.id, entry));
      return normalized;
    } catch (error) {
      return Array.from(this.journalEntries.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    try {
      const [row] = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);
      if (!row) return this.journalEntries.get(id);
      const entry = this.normalizeJournalEntry(row);
      this.journalEntries.set(id, entry);
      return entry;
    } catch (error) {
      return this.journalEntries.get(id);
    }
  }

  // createDailyReflection/getDailyReflections/getTodayReflection → 동일 패턴
  // createCrisisEvent/getCrisisEvents → 동일 패턴
  // getEmotionStats → DB에서 select 후 계산, 실패 시 Map 데이터로 계산

  private normalizeJournalEntry(row: JournalEntry): JournalEntry {
    return {
      ...row,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      bodyMapping: row.bodyMapping ?? {},
    };
  }

  // DailyReflection, CrisisEvent도 normalize 헬퍼 추가
}

export const storage: IStorage = new HybridStorage();
