import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertJournalEntrySchema,
  insertDailyReflectionSchema,
  insertCrisisEventSchema, 
} from "@shared/schema";
import { requireAuth } from "../src/middleware/auth";


//기존에 쓰던 REST API 엔드포인트
export async function registerRoutes(app: Express): Promise<Server> {
  // Journal Entries
  app.post("/api/journal-entries", requireAuth, async (req, res) => {
    
    try {
      console.log("incoming payload:", req.body);
      const userId = req.user!.id;
      const validatedData = insertJournalEntrySchema.parse({
        ...req.body,
        userId,
      });
       console.log("validated for DB:", validatedData);
      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ 
        error: "Invalid journal entry data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/journal-entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.user!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal-entries/:id", requireAuth, async (req, res) => {
    try {
      const entry = await storage.getJournalEntry(req.params.id, req.user!.id);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  // Daily Reflections
  app.post("/api/daily-reflections", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDailyReflectionSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const reflection = await storage.createDailyReflection(validatedData);
      res.json(reflection);
    } catch (error) {
      res.status(400).json({ error: "Invalid reflection data" });
    }
  });

  app.get("/api/daily-reflections", requireAuth, async (req, res) => {
    try {
      const reflections = await storage.getDailyReflections(req.user!.id);
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  app.get("/api/daily-reflections/today", requireAuth, async (req, res) => {
    try {
      const reflection = await storage.getTodayReflection(req.user!.id);
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's reflection" });
    }
  });

  // Crisis Events
  app.post("/api/crisis-events", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCrisisEventSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const event = await storage.createCrisisEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid crisis event data" });
    }
  });

  app.get("/api/crisis-events", requireAuth, async (req, res) => {
    try {
      const events = await storage.getCrisisEvents(req.user!.id);
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
