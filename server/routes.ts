import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema, insertDailyReflectionSchema, insertCrisisEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Journal Entries
  app.post("/api/journal-entries", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  app.get("/api/journal-entries", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal-entries/:id", async (req, res) => {
    try {
      const entry = await storage.getJournalEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  // Daily Reflections
  app.post("/api/daily-reflections", async (req, res) => {
    try {
      const validatedData = insertDailyReflectionSchema.parse(req.body);
      const reflection = await storage.createDailyReflection(validatedData);
      res.json(reflection);
    } catch (error) {
      res.status(400).json({ error: "Invalid reflection data" });
    }
  });

  app.get("/api/daily-reflections", async (req, res) => {
    try {
      const reflections = await storage.getDailyReflections();
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  app.get("/api/daily-reflections/today", async (req, res) => {
    try {
      const reflection = await storage.getTodayReflection();
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's reflection" });
    }
  });

  // Crisis Events
  app.post("/api/crisis-events", async (req, res) => {
    try {
      const validatedData = insertCrisisEventSchema.parse(req.body);
      const event = await storage.createCrisisEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid crisis event data" });
    }
  });

  app.get("/api/crisis-events", async (req, res) => {
    try {
      const events = await storage.getCrisisEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch crisis events" });
    }
  });

  // Analytics - START WITH TEST FUNCTIONS, REPLACE WITH DB FUNCTIONS LATER
  // import * as analytics from "./analytics-test";    // Use this first
  // import * as analytics from "./analytics-db";      // Replace with this later
  const analytics = await import("./analytics-test");

  app.get("/api/emotion-stats", async (req, res) => {
    try {
      const stats = await analytics.getEmotionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emotion statistics" });
    }
  });

  app.get("/api/weekly-emotion-data", async (req, res) => {
    try {
      const data = await analytics.getWeeklyEmotionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly emotion data" });
    }
  });

  app.get("/api/sensory-expansion-data", async (req, res) => {
    try {
      const data = await analytics.getSensoryExpansionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensory expansion data" });
    }
  });

  app.get("/api/body-mapping-insights", async (req, res) => {
    try {
      const data = await analytics.getBodyMappingInsights();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch body mapping insights" });
    }
  });

  app.get("/api/emotion-patterns", async (req, res) => {
    try {
      const patterns = await analytics.getEmotionPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emotion patterns" });
    }
  });

  app.get("/api/routine-execution-data", async (req, res) => {
    try {
      const data = await analytics.getRoutineExecutionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch routine execution data" });
    }
  });

  app.get("/api/self-acceptance-data", async (req, res) => {
    try {
      const data = await analytics.getSelfAcceptanceData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch self-acceptance data" });
    }
  });

  app.get("/api/recovery-tendency", async (req, res) => {
    try {
      const data = await analytics.getRecoveryTendency();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recovery tendency data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
