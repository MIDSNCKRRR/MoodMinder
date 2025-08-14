// ===== PROPER DATABASE INTEGRATION FUNCTIONS =====
// These functions query real data from PostgreSQL and calculate analytics

import { db } from "./db";
import { journalEntries, users } from "../shared/schema";
import { eq, gte, and, desc } from "drizzle-orm";
import type { JournalEntry } from "../shared/schema";

// Get a test user ID (you can modify this to use session user later)
async function getTestUserId(): Promise<string> {
  const testUser = await db.select().from(users).where(eq(users.email, "testuser@example.com")).limit(1);
  if (testUser.length === 0) {
    throw new Error("Test user not found. Run 'npm run db:seed' first.");
  }
  return testUser[0].id;
}

export async function getWeeklyEmotionData() {
  const userId = await getTestUserId();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyEntries = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.createdAt, weekAgo)
      )
    )
    .orderBy(journalEntries.createdAt);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyData = new Array(7).fill(0);
  const dailyCounts = new Array(7).fill(0);

  weeklyEntries.forEach((entry) => {
    const dayIndex = entry.createdAt.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Adjust Sunday to be index 6
    dailyData[adjustedIndex] += entry.emotionLevel;
    dailyCounts[adjustedIndex]++;
  });

  // Calculate averages, default to 3 if no data
  const averages = dailyData.map((sum, index) =>
    dailyCounts[index] > 0 ? sum / dailyCounts[index] : 3,
  );

  return { data: averages, labels: dayLabels };
}

export async function getSensoryExpansionData() {
  const userId = await getTestUserId();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyEntries = await db
    .select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.userId, userId),
        gte(journalEntries.createdAt, weekAgo)
      )
    )
    .orderBy(journalEntries.createdAt);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyScores = new Array(7).fill(0);
  const dailyCounts = new Array(7).fill(0);

  weeklyEntries.forEach((entry) => {
    const dayIndex = entry.createdAt.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    // Calculate components for sensory expansion score
    const relaxationScore = calculateRelaxationScore(entry);
    const selfAcceptanceScore = calculateSelfAcceptanceScore(entry);
    const reframingSuccessRate = calculateReframingSuccessRate(entry);

    // Formula: (이완감 × 0.4) + (자기 수용 × 0.3) + (감정 재서사 성공률 × 0.3)
    const sensoryExpansionScore = 
      (relaxationScore * 0.4) + 
      (selfAcceptanceScore * 0.3) + 
      (reframingSuccessRate * 0.3);

    dailyScores[adjustedIndex] += sensoryExpansionScore;
    dailyCounts[adjustedIndex]++;
  });

  // Calculate averages, default to 3 if no data
  const averages = dailyScores.map((sum, index) =>
    dailyCounts[index] > 0 ? sum / dailyCounts[index] : 3,
  );

  return { data: averages, labels: dayLabels };
}

export async function getEmotionStats() {
  const userId = await getTestUserId();
  
  const allEntries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));

  if (allEntries.length === 0) {
    return {
      averageEmotion: 0,
      totalEntries: 0,
      weeklyAverage: 0,
      monthlyStreak: 0,
    };
  }

  const totalEntries = allEntries.length;
  const averageEmotion = allEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / totalEntries;

  // Calculate weekly average (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyEntries = allEntries.filter(entry => entry.createdAt >= weekAgo);
  const weeklyAverage = weeklyEntries.length > 0 
    ? weeklyEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / weeklyEntries.length 
    : 0;

  // Calculate monthly streak (days with entries in the last 30 days)
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthlyEntries = allEntries.filter(entry => entry.createdAt >= monthAgo);
  const uniqueDays = new Set(monthlyEntries.map(entry => entry.createdAt.toDateString()));
  const monthlyStreak = uniqueDays.size;

  return {
    averageEmotion: Math.round(averageEmotion * 10) / 10,
    totalEntries,
    weeklyAverage: Math.round(weeklyAverage * 10) / 10,
    monthlyStreak,
  };
}

export async function getBodyMappingInsights() {
  const userId = await getTestUserId();
  
  const allEntries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId));

  const areaCounts: Record<string, number> = {};

  allEntries.forEach((entry) => {
    if (entry.bodyMapping && typeof entry.bodyMapping === "object") {
      Object.keys(entry.bodyMapping).forEach((area) => {
        // Skip non-body areas like matchingScore
        if (area !== 'matchingScore') {
          areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
      });
    }
  });

  return areaCounts;
}

export async function getEmotionPatterns() {
  const userId = await getTestUserId();
  
  const allEntries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId));

  if (allEntries.length === 0) return [];

  // Calculate morning vs overall average
  const morningEntries = allEntries.filter((entry) => {
    const hour = entry.createdAt.getHours();
    return hour >= 6 && hour < 12;
  });

  const morningAvg = morningEntries.length > 0
    ? morningEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / morningEntries.length
    : 0;

  const overallAvg = allEntries.reduce((sum, entry) => sum + entry.emotionLevel, 0) / allEntries.length;
  const morningBoost = morningAvg > overallAvg;

  // Calculate most frequent emotion
  const emotionCounts = allEntries.reduce(
    (acc, entry) => {
      acc[entry.emotionType] = (acc[entry.emotionType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostFrequentEmotion = Object.entries(emotionCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  // Calculate average session time (estimate based on content length)
  const avgSessionTime = Math.round(
    allEntries.reduce((sum, entry) => {
      const contentLength = entry.content?.length || 0;
      // Rough estimate: 100 chars = 1 minute
      return sum + Math.max(2, Math.min(8, contentLength / 100));
    }, 0) / allEntries.length
  );

  return [
    {
      text: morningBoost
        ? `Mornings show ${Math.round(((morningAvg - overallAvg) * 100) / overallAvg)}% higher emotional balance`
        : "Evening reflections tend to be more balanced",
      color: "bg-sage-400",
    },
    {
      text: `Average journaling session: ${avgSessionTime} minutes`,
      color: "bg-lavender-400",
    },
    {
      text: mostFrequentEmotion
        ? `Most frequent emotion: ${mostFrequentEmotion[0]} (${Math.round((mostFrequentEmotion[1] / allEntries.length) * 100)}%)`
        : "Building emotional awareness through journaling",
      color: "bg-coral-400",
    },
  ];
}

// Helper functions matching the report.tsx calculations
function calculateRelaxationScore(entry: JournalEntry): number {
  let baseScore = entry.emotionLevel;
  
  if (entry.bodyMapping && typeof entry.bodyMapping === 'object') {
    const bodyAreas = Object.keys(entry.bodyMapping);
    const tenseIndicators = ['head', 'shoulders', 'chest', 'stomach'];
    const tenseAreaCount = bodyAreas.filter(area => 
      tenseIndicators.some(indicator => area.toLowerCase().includes(indicator))
    ).length;
    
    baseScore = Math.max(1, baseScore - (tenseAreaCount * 0.5));
  }
  
  return Math.min(5, baseScore);
}

function calculateSelfAcceptanceScore(entry: JournalEntry): number {
  let baseScore = 3;
  
  if (entry.journalType === 'identity') {
    baseScore = 4;
    
    if (entry.bodyMapping && typeof entry.bodyMapping === 'object' && 
        'matchingScore' in entry.bodyMapping) {
      const matchingScore = entry.bodyMapping.matchingScore as number;
      baseScore = matchingScore;
    }
  }
  
  if (entry.emotionLevel >= 4) {
    baseScore = Math.min(5, baseScore + 0.5);
  } else if (entry.emotionLevel <= 2) {
    baseScore = Math.max(1, baseScore - 0.5);
  }
  
  return baseScore;
}

function calculateReframingSuccessRate(entry: JournalEntry): number {
  let baseScore = 3;
  
  if (entry.journalType === 'reframing') {
    baseScore = entry.emotionLevel;
    
    if (entry.content && entry.content.length > 100) {
      baseScore = Math.min(5, baseScore + 0.5);
    }
  }
  
  if (entry.bodyMapping && typeof entry.bodyMapping === 'object') {
    const bodyAreaCount = Object.keys(entry.bodyMapping).length;
    if (bodyAreaCount > 2) {
      baseScore = Math.min(5, baseScore + 0.3);
    }
  }
  
  return baseScore;
}