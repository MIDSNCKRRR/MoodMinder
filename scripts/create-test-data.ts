import { db } from "../server/db";
import { journalEntries, users } from "../shared/schema";

// Test data generator for 7 days of journal entries
async function createTestData() {
  console.log("Creating test user and 7-day journal entries...");

  // Create a test user
  const testUser = await db.insert(users).values({
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
  }).returning();

  const userId = testUser[0].id;

  // Generate dates for the last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago to today
    return date;
  });

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Sample journal entries for each day
  const testEntries = [
    // Monday - Low start, reframing journal
    {
      journalType: "reframing",
      emotionLevel: 2,
      emotionType: "anxious",
      content: "Feeling overwhelmed with work deadlines. Trying to reframe my perspective - these challenges are opportunities to grow and prove my capabilities.",
      bodyMapping: { head: true, shoulders: true, chest: true },
      createdAt: dates[0],
    },
    // Tuesday - Slight improvement, identity journal
    {
      journalType: "identity",
      emotionLevel: 3,
      emotionType: "neutral",
      content: "Reflecting on my core values and who I want to be. I value kindness, growth, and authenticity.",
      bodyMapping: { heart: true, stomach: true, matchingScore: 3.5 },
      createdAt: dates[1],
    },
    // Wednesday - Higher emotion, emotion journal
    {
      journalType: "emotion",
      emotionLevel: 4,
      emotionType: "hopeful",
      content: "Had a great conversation with a friend today. Feeling more connected and optimistic about the future.",
      bodyMapping: { chest: true, arms: true },
      createdAt: dates[2],
    },
    // Thursday - Peak day, gratitude
    {
      journalType: "gratitude",
      emotionLevel: 5,
      emotionType: "grateful",
      content: "Grateful for my health, supportive family, and the beautiful weather today. Small moments of joy make life meaningful.",
      bodyMapping: { heart: true, whole_body: true },
      createdAt: dates[3],
    },
    // Friday - Maintaining high, identity with good matching
    {
      journalType: "identity",
      emotionLevel: 4,
      emotionType: "confident",
      content: "Completing this week's goals has reminded me that I'm capable and resilient. I identify as someone who perseveres through challenges.",
      bodyMapping: { chest: true, arms: true, matchingScore: 4.2 },
      createdAt: dates[4],
    },
    // Saturday - Slight dip, reframing
    {
      journalType: "reframing",
      emotionLevel: 3,
      emotionType: "contemplative",
      content: "Weekend reflection time. Instead of seeing rest as unproductive, I'm reframing it as necessary self-care and rejuvenation.",
      bodyMapping: { head: true, stomach: true },
      createdAt: dates[5],
    },
    // Sunday - Balanced end, emotion journal
    {
      journalType: "emotion",
      emotionLevel: 4,
      emotionType: "peaceful",
      content: "Ending the week feeling balanced and ready for new challenges. Taking time to appreciate how far I've come this week.",
      bodyMapping: { heart: true, legs: true },
      createdAt: dates[6],
    },
  ];

  // Add some additional entries to show variety within days
  const additionalEntries = [
    // Tuesday morning entry
    {
      journalType: "emotion",
      emotionLevel: 2,
      emotionType: "tired",
      content: "Woke up feeling tired. Need to focus on better sleep habits.",
      bodyMapping: { head: true, eyes: true },
      createdAt: new Date(dates[1].getTime() - 8 * 60 * 60 * 1000), // 8 hours earlier
    },
    // Wednesday evening reflection
    {
      journalType: "reframing",
      emotionLevel: 4,
      emotionType: "accomplished",
      content: "Instead of focusing on what I didn't finish today, I'm celebrating what I did accomplish. Progress over perfection.",
      bodyMapping: { chest: true, shoulders: true },
      createdAt: new Date(dates[2].getTime() + 10 * 60 * 60 * 1000), // 10 hours later
    },
    // Friday morning gratitude
    {
      journalType: "gratitude",
      emotionLevel: 4,
      emotionType: "appreciative",
      content: "Grateful for my morning coffee ritual and the quiet moments before the day begins.",
      bodyMapping: { stomach: true, hands: true },
      createdAt: new Date(dates[4].getTime() - 6 * 60 * 60 * 1000), // 6 hours earlier
    },
  ];

  // Combine all entries
  const allEntries = [...testEntries, ...additionalEntries].map(entry => ({
    ...entry,
    userId,
  }));

  // Insert all journal entries
  await db.insert(journalEntries).values(allEntries);

  console.log(`✅ Created ${allEntries.length} journal entries for user ${userId}`);
  console.log("📊 Data includes:");
  console.log("- Varying emotion levels (2-5) across the week");
  console.log("- Different journal types: emotion, reframing, identity, gratitude");
  console.log("- Body mapping data for sensory expansion scoring");
  console.log("- Multiple entries per day for some days");
  console.log("\n📈 Expected Sensory Score Analysis components:");
  console.log("- Relaxation Score: Based on emotion level and body mapping tension");
  console.log("- Self-Acceptance Score: Higher for identity journals with matching scores");
  console.log("- Reframing Success Rate: Higher for reframing journals with engagement");
  console.log("\n🗓️ Daily breakdown:");
  
  testEntries.forEach((entry, index) => {
    const relaxationScore = calculateRelaxationScore(entry);
    const selfAcceptanceScore = calculateSelfAcceptanceScore(entry);
    const reframingSuccessRate = calculateReframingSuccessRate(entry);
    const sensoryScore = (relaxationScore * 0.4) + (selfAcceptanceScore * 0.3) + (reframingSuccessRate * 0.3);
    
    console.log(`${dayNames[index]}: Emotion ${entry.emotionLevel}/5, Sensory Score ${sensoryScore.toFixed(1)}/5 (${entry.journalType})`);
  });
  
  process.exit(0);
}

// Helper functions matching the report.tsx calculations
function calculateRelaxationScore(entry: any): number {
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

function calculateSelfAcceptanceScore(entry: any): number {
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

function calculateReframingSuccessRate(entry: any): number {
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

// Run the script
createTestData().catch(console.error);