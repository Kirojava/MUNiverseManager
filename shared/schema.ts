import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  isAvailable: integer("is_available").notNull().default(1),
});

export const delegates = pgTable("delegates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  school: text("school").notNull(),
  committeeId: text("committee_id"),
  committee: text("committee").notNull(),
  portfolioId: text("portfolio_id"),
  portfolio: text("portfolio").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("registered"),
  performanceScore: integer("performance_score").default(0),
  notes: text("notes"),
});

export const secretariat = pgTable("secretariat", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  responsibilities: text("responsibilities"),
});

export const committees = pgTable("committees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  topic: text("topic").notNull(),
  agenda: text("agenda").notNull(),
  chairperson: text("chairperson"),
  viceChairperson: text("vice_chairperson"),
  rapporteur: text("rapporteur"),
  sessionCount: integer("session_count").default(0),
  status: text("status").notNull().default("planning"),
  portfolios: text("portfolios"),
});

export const executiveBoard = pgTable("executive_board", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  position: text("position").notNull(),
  name: text("name").notNull(),
  responsibilities: text("responsibilities").notNull(),
  department: text("department"),
  email: text("email").notNull(),
  reportsTo: text("reports_to"),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  assignee: text("assignee").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  category: text("category").notNull(),
});

export const logistics = pgTable("logistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("pending"),
  vendor: text("vendor"),
  cost: integer("cost"),
  notes: text("notes"),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currency: text("currency").notNull().default("USD"),
  currencySymbol: text("currency_symbol").notNull().default("$"),
});

export const marketing = pgTable("marketing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaign: text("campaign").notNull(),
  platform: text("platform").notNull(),
  reach: integer("reach").default(0),
  status: text("status").notNull().default("planning"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  bestTimeToPost: text("best_time_to_post"),
  contentType: text("content_type"),
  engagement: integer("engagement").default(0),
  notes: text("notes"),
});

export const sponsorships = pgTable("sponsorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsor: text("sponsor").notNull(),
  tier: text("tier").notNull(),
  amount: integer("amount").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  benefits: text("benefits"),
  status: text("status").notNull().default("pending"),
});

export const updates = pgTable("updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const delegateEvaluations = pgTable("delegate_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delegateId: text("delegate_id").notNull(),
  delegateName: text("delegate_name").notNull(),
  committee: text("committee").notNull(),
  researchScore: integer("research_score").notNull(),
  communicationScore: integer("communication_score").notNull(),
  diplomacyScore: integer("diplomacy_score").notNull(),
  participationScore: integer("participation_score").notNull(),
  totalScore: integer("total_score").notNull(),
  comments: text("comments"),
  evaluatedBy: text("evaluated_by").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true });
export const insertDelegateSchema = createInsertSchema(delegates).omit({ id: true });
export const insertSecretariatSchema = createInsertSchema(secretariat).omit({ id: true });
export const insertCommitteeSchema = createInsertSchema(committees).omit({ id: true });
export const insertExecutiveBoardSchema = createInsertSchema(executiveBoard).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertLogisticsSchema = createInsertSchema(logistics).omit({ id: true });
export const insertMarketingSchema = createInsertSchema(marketing).omit({ id: true });
export const insertSponsorshipSchema = createInsertSchema(sponsorships).omit({ id: true });
export const insertUpdateSchema = createInsertSchema(updates).omit({ id: true, timestamp: true });
export const insertDelegateEvaluationSchema = createInsertSchema(delegateEvaluations).omit({ id: true, timestamp: true });
export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({ id: true });

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Delegate = typeof delegates.$inferSelect;
export type InsertDelegate = z.infer<typeof insertDelegateSchema>;
export type Secretariat = typeof secretariat.$inferSelect;
export type InsertSecretariat = z.infer<typeof insertSecretariatSchema>;
export type Committee = typeof committees.$inferSelect;
export type InsertCommittee = z.infer<typeof insertCommitteeSchema>;
export type ExecutiveBoard = typeof executiveBoard.$inferSelect;
export type InsertExecutiveBoard = z.infer<typeof insertExecutiveBoardSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Logistics = typeof logistics.$inferSelect;
export type InsertLogistics = z.infer<typeof insertLogisticsSchema>;
export type Marketing = typeof marketing.$inferSelect;
export type InsertMarketing = z.infer<typeof insertMarketingSchema>;
export type Sponsorship = typeof sponsorships.$inferSelect;
export type InsertSponsorship = z.infer<typeof insertSponsorshipSchema>;
export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type DelegateEvaluation = typeof delegateEvaluations.$inferSelect;
export type InsertDelegateEvaluation = z.infer<typeof insertDelegateEvaluationSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
