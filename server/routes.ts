import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertPortfolioSchema,
  insertDelegateSchema,
  insertSecretariatSchema,
  insertCommitteeSchema,
  insertExecutiveBoardSchema,
  insertTaskSchema,
  insertLogisticsSchema,
  insertMarketingSchema,
  insertSponsorshipSchema,
  insertUpdateSchema,
  insertDelegateEvaluationSchema,
  insertAppSettingsSchema,
  insertMarkingCriteriaSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/portfolios", async (_req, res) => {
    const portfolios = await storage.getPortfolios();
    res.json(portfolios);
  });

  app.post("/api/portfolios", async (req, res) => {
    try {
      const data = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(data);
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  app.patch("/api/portfolios/:id", async (req, res) => {
    try {
      const data = insertPortfolioSchema.partial().parse(req.body);
      const portfolio = await storage.updatePortfolio(req.params.id, data);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/portfolios/:id", async (req, res) => {
    const success = await storage.deletePortfolio(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.status(204).send();
  });

  app.get("/api/app-settings", async (_req, res) => {
    const settings = await storage.getAppSettings();
    res.json(settings);
  });

  app.patch("/api/app-settings", async (req, res) => {
    try {
      const data = insertAppSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAppSettings(data);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  app.get("/api/delegates", async (_req, res) => {
    const delegates = await storage.getDelegates();
    res.json(delegates);
  });

  app.get("/api/delegates/:id", async (req, res) => {
    const delegate = await storage.getDelegate(req.params.id);
    if (!delegate) {
      return res.status(404).json({ error: "Delegate not found" });
    }
    res.json(delegate);
  });

  app.post("/api/delegates", async (req, res) => {
    try {
      const data = insertDelegateSchema.parse(req.body);
      const delegate = await storage.createDelegate(data);
      res.status(201).json(delegate);
    } catch (error) {
      res.status(400).json({ error: "Invalid delegate data" });
    }
  });

  app.patch("/api/delegates/:id", async (req, res) => {
    try {
      const data = insertDelegateSchema.partial().parse(req.body);
      const delegate = await storage.updateDelegate(req.params.id, data);
      if (!delegate) {
        return res.status(404).json({ error: "Delegate not found" });
      }
      res.json(delegate);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/delegates/:id", async (req, res) => {
    const success = await storage.deleteDelegate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Delegate not found" });
    }
    res.status(204).send();
  });

  app.get("/api/secretariat", async (_req, res) => {
    const secretariat = await storage.getSecretariat();
    res.json(secretariat);
  });

  app.post("/api/secretariat", async (req, res) => {
    try {
      const data = insertSecretariatSchema.parse(req.body);
      const member = await storage.createSecretariat(data);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid secretariat data" });
    }
  });

  app.patch("/api/secretariat/:id", async (req, res) => {
    try {
      const data = insertSecretariatSchema.partial().parse(req.body);
      const member = await storage.updateSecretariat(req.params.id, data);
      if (!member) {
        return res.status(404).json({ error: "Secretariat member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/secretariat/:id", async (req, res) => {
    const success = await storage.deleteSecretariat(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Secretariat member not found" });
    }
    res.status(204).send();
  });

  app.get("/api/committees", async (_req, res) => {
    const committees = await storage.getCommittees();
    res.json(committees);
  });

  app.post("/api/committees", async (req, res) => {
    try {
      const data = insertCommitteeSchema.parse(req.body);
      const committee = await storage.createCommittee(data);
      res.status(201).json(committee);
    } catch (error) {
      res.status(400).json({ error: "Invalid committee data" });
    }
  });

  app.patch("/api/committees/:id", async (req, res) => {
    try {
      const data = insertCommitteeSchema.partial().parse(req.body);
      const committee = await storage.updateCommittee(req.params.id, data);
      if (!committee) {
        return res.status(404).json({ error: "Committee not found" });
      }
      res.json(committee);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/committees/:id", async (req, res) => {
    const success = await storage.deleteCommittee(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Committee not found" });
    }
    res.status(204).send();
  });

  app.get("/api/executive-board", async (_req, res) => {
    const board = await storage.getExecutiveBoard();
    res.json(board);
  });

  app.post("/api/executive-board", async (req, res) => {
    try {
      const data = insertExecutiveBoardSchema.parse(req.body);
      const member = await storage.createExecutiveBoard(data);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid executive board data" });
    }
  });

  app.patch("/api/executive-board/:id", async (req, res) => {
    try {
      const data = insertExecutiveBoardSchema.partial().parse(req.body);
      const member = await storage.updateExecutiveBoard(req.params.id, data);
      if (!member) {
        return res.status(404).json({ error: "Executive board member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/executive-board/:id", async (req, res) => {
    const success = await storage.deleteExecutiveBoard(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Executive board member not found" });
    }
    res.status(204).send();
  });

  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(data);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const data = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, data);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const success = await storage.deleteTask(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
  });

  app.get("/api/logistics", async (_req, res) => {
    const logistics = await storage.getLogistics();
    res.json(logistics);
  });

  app.post("/api/logistics", async (req, res) => {
    try {
      const data = insertLogisticsSchema.parse(req.body);
      const item = await storage.createLogistics(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid logistics data" });
    }
  });

  app.patch("/api/logistics/:id", async (req, res) => {
    try {
      const data = insertLogisticsSchema.partial().parse(req.body);
      const item = await storage.updateLogistics(req.params.id, data);
      if (!item) {
        return res.status(404).json({ error: "Logistics item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/logistics/:id", async (req, res) => {
    const success = await storage.deleteLogistics(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Logistics item not found" });
    }
    res.status(204).send();
  });

  app.get("/api/marketing", async (_req, res) => {
    const marketing = await storage.getMarketing();
    res.json(marketing);
  });

  app.post("/api/marketing", async (req, res) => {
    try {
      const data = insertMarketingSchema.parse(req.body);
      const campaign = await storage.createMarketing(data);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Invalid marketing data" });
    }
  });

  app.patch("/api/marketing/:id", async (req, res) => {
    try {
      const data = insertMarketingSchema.partial().parse(req.body);
      const campaign = await storage.updateMarketing(req.params.id, data);
      if (!campaign) {
        return res.status(404).json({ error: "Marketing campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/marketing/:id", async (req, res) => {
    const success = await storage.deleteMarketing(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Marketing campaign not found" });
    }
    res.status(204).send();
  });

  app.get("/api/sponsorships", async (_req, res) => {
    const sponsorships = await storage.getSponsorships();
    res.json(sponsorships);
  });

  app.post("/api/sponsorships", async (req, res) => {
    try {
      const data = insertSponsorshipSchema.parse(req.body);
      const sponsor = await storage.createSponsorship(data);
      res.status(201).json(sponsor);
    } catch (error) {
      res.status(400).json({ error: "Invalid sponsorship data" });
    }
  });

  app.patch("/api/sponsorships/:id", async (req, res) => {
    try {
      const data = insertSponsorshipSchema.partial().parse(req.body);
      const sponsor = await storage.updateSponsorship(req.params.id, data);
      if (!sponsor) {
        return res.status(404).json({ error: "Sponsorship not found" });
      }
      res.json(sponsor);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/sponsorships/:id", async (req, res) => {
    const success = await storage.deleteSponsorship(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Sponsorship not found" });
    }
    res.status(204).send();
  });

  app.get("/api/updates", async (_req, res) => {
    const updates = await storage.getUpdates();
    res.json(updates);
  });

  app.post("/api/updates", async (req, res) => {
    try {
      const data = insertUpdateSchema.parse(req.body);
      const update = await storage.createUpdate(data);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.patch("/api/updates/:id", async (req, res) => {
    try {
      const data = insertUpdateSchema.partial().parse(req.body);
      const update = await storage.updateUpdate(req.params.id, data);
      if (!update) {
        return res.status(404).json({ error: "Update not found" });
      }
      res.json(update);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/updates/:id", async (req, res) => {
    const success = await storage.deleteUpdate(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Update not found" });
    }
    res.status(204).send();
  });

  app.get("/api/evaluations", async (_req, res) => {
    const evaluations = await storage.getEvaluations();
    res.json(evaluations);
  });

  app.post("/api/evaluations", async (req, res) => {
    try {
      const data = insertDelegateEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEvaluation(data);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(400).json({ error: "Invalid evaluation data" });
    }
  });

  app.patch("/api/evaluations/:id", async (req, res) => {
    try {
      const data = insertDelegateEvaluationSchema.partial().parse(req.body);
      const evaluation = await storage.updateEvaluation(req.params.id, data);
      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      res.json(evaluation);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    const success = await storage.deleteEvaluation(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Evaluation not found" });
    }
    res.status(204).send();
  });

  app.get("/api/marking-criteria", async (_req, res) => {
    const criteria = await storage.getMarkingCriteria();
    res.json(criteria);
  });

  app.post("/api/marking-criteria", async (req, res) => {
    try {
      const data = insertMarkingCriteriaSchema.parse(req.body);
      const criteria = await storage.createMarkingCriteria(data);
      res.status(201).json(criteria);
    } catch (error) {
      res.status(400).json({ error: "Invalid criteria data" });
    }
  });

  app.patch("/api/marking-criteria/:id", async (req, res) => {
    try {
      const data = insertMarkingCriteriaSchema.partial().parse(req.body);
      const criteria = await storage.updateMarkingCriteria(req.params.id, data);
      if (!criteria) {
        return res.status(404).json({ error: "Criteria not found" });
      }
      res.json(criteria);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/marking-criteria/:id", async (req, res) => {
    const success = await storage.deleteMarkingCriteria(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Criteria not found" });
    }
    res.status(204).send();
  });

  const httpServer = createServer(app);

  return httpServer;
}
