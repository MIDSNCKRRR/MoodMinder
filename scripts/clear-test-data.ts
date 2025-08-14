import { db } from "../server/db";
import { journalEntries, users, dailyReflections, crisisEvents } from "../shared/schema";
import { eq } from "drizzle-orm";

async function clearTestData() {
  console.log("🧹 Clearing test data...");

  try {
    // Find test user
    const testUsers = await db.select().from(users).where(eq(users.email, "testuser@example.com"));
    
    if (testUsers.length === 0) {
      console.log("ℹ️  No test user found.");
      process.exit(0);
    }

    const testUserId = testUsers[0].id;

    // Delete related data first (due to foreign key constraints)
    const deletedJournalEntries = await db.delete(journalEntries).where(eq(journalEntries.userId, testUserId));
    const deletedReflections = await db.delete(dailyReflections).where(eq(dailyReflections.userId, testUserId));
    const deletedCrisisEvents = await db.delete(crisisEvents).where(eq(crisisEvents.userId, testUserId));

    // Delete test user
    await db.delete(users).where(eq(users.id, testUserId));

    console.log(`✅ Cleared test data for user: ${testUsers[0].email}`);
    console.log("📊 Deleted:");
    console.log(`- ${deletedJournalEntries.rowCount || 0} journal entries`);
    console.log(`- ${deletedReflections.rowCount || 0} daily reflections`);
    console.log(`- ${deletedCrisisEvents.rowCount || 0} crisis events`);
    console.log("- 1 test user");

  } catch (error) {
    console.error("❌ Error clearing test data:", error);
    process.exit(1);
  }

  process.exit(0);
}

clearTestData().catch(console.error);