import {
  type Delegate,
  type InsertDelegate,
  type Secretariat,
  type InsertSecretariat,
  type Committee,
  type InsertCommittee,
  type ExecutiveBoard,
  type InsertExecutiveBoard,
  type Task,
  type InsertTask,
  type Logistics,
  type InsertLogistics,
  type Marketing,
  type InsertMarketing,
  type Sponsorship,
  type InsertSponsorship,
  type Update,
  type InsertUpdate,
  type DelegateEvaluation,
  type InsertDelegateEvaluation,
  type Portfolio,
  type InsertPortfolio,
  type AppSettings,
  type InsertAppSettings,
  type MarkingCriteria,
  type InsertMarkingCriteria,
  type AwardType,
  type InsertAwardType,
  type DelegateAward,
  type InsertDelegateAward,
} from "@shared/schema";
import { randomUUID } from "crypto";

function normalizeNullable<T>(data: T): T {
  const result = { ...data } as any;
  for (const key in result) {
    if (result[key] === undefined) {
      result[key] = null;
    }
  }
  return result as T;
}

export interface IStorage {
  getPortfolios(): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: string): Promise<boolean>;

  getDelegates(): Promise<Delegate[]>;
  getDelegate(id: string): Promise<Delegate | undefined>;
  createDelegate(delegate: InsertDelegate): Promise<Delegate>;
  updateDelegate(id: string, delegate: Partial<InsertDelegate>): Promise<Delegate | undefined>;
  deleteDelegate(id: string): Promise<boolean>;

  getSecretariat(): Promise<Secretariat[]>;
  createSecretariat(member: InsertSecretariat): Promise<Secretariat>;
  updateSecretariat(id: string, member: Partial<InsertSecretariat>): Promise<Secretariat | undefined>;
  deleteSecretariat(id: string): Promise<boolean>;

  getCommittees(): Promise<Committee[]>;
  createCommittee(committee: InsertCommittee): Promise<Committee>;
  updateCommittee(id: string, committee: Partial<InsertCommittee>): Promise<Committee | undefined>;
  deleteCommittee(id: string): Promise<boolean>;

  getExecutiveBoard(): Promise<ExecutiveBoard[]>;
  createExecutiveBoard(member: InsertExecutiveBoard): Promise<ExecutiveBoard>;
  updateExecutiveBoard(id: string, member: Partial<InsertExecutiveBoard>): Promise<ExecutiveBoard | undefined>;
  deleteExecutiveBoard(id: string): Promise<boolean>;

  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  getLogistics(): Promise<Logistics[]>;
  createLogistics(item: InsertLogistics): Promise<Logistics>;
  updateLogistics(id: string, item: Partial<InsertLogistics>): Promise<Logistics | undefined>;
  deleteLogistics(id: string): Promise<boolean>;

  getMarketing(): Promise<Marketing[]>;
  createMarketing(campaign: InsertMarketing): Promise<Marketing>;
  updateMarketing(id: string, campaign: Partial<InsertMarketing>): Promise<Marketing | undefined>;
  deleteMarketing(id: string): Promise<boolean>;

  getSponsorships(): Promise<Sponsorship[]>;
  createSponsorship(sponsor: InsertSponsorship): Promise<Sponsorship>;
  updateSponsorship(id: string, sponsor: Partial<InsertSponsorship>): Promise<Sponsorship | undefined>;
  deleteSponsorship(id: string): Promise<boolean>;

  getUpdates(): Promise<Update[]>;
  createUpdate(update: InsertUpdate): Promise<Update>;
  updateUpdate(id: string, update: Partial<InsertUpdate>): Promise<Update | undefined>;
  deleteUpdate(id: string): Promise<boolean>;

  getEvaluations(): Promise<DelegateEvaluation[]>;
  createEvaluation(evaluation: InsertDelegateEvaluation): Promise<DelegateEvaluation>;
  updateEvaluation(id: string, evaluation: Partial<InsertDelegateEvaluation>): Promise<DelegateEvaluation | undefined>;
  deleteEvaluation(id: string): Promise<boolean>;

  getAppSettings(): Promise<AppSettings | undefined>;
  updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;

  getMarkingCriteria(): Promise<MarkingCriteria[]>;
  createMarkingCriteria(criteria: InsertMarkingCriteria): Promise<MarkingCriteria>;
  updateMarkingCriteria(id: string, criteria: Partial<InsertMarkingCriteria>): Promise<MarkingCriteria | undefined>;
  deleteMarkingCriteria(id: string): Promise<boolean>;

  getAwardTypes(): Promise<AwardType[]>;
  createAwardType(awardType: InsertAwardType): Promise<AwardType>;
  updateAwardType(id: string, awardType: Partial<InsertAwardType>): Promise<AwardType | undefined>;
  deleteAwardType(id: string): Promise<boolean>;

  getDelegateAwards(): Promise<DelegateAward[]>;
  getDelegateAwardsByCommittee(committeeId: string): Promise<DelegateAward[]>;
  createDelegateAward(award: InsertDelegateAward): Promise<DelegateAward>;
  updateDelegateAward(id: string, award: Partial<InsertDelegateAward>): Promise<DelegateAward | undefined>;
  deleteDelegateAward(id: string): Promise<boolean>;
  autoAssignAwards(committeeId: string, committeeName: string, assignedBy: string): Promise<DelegateAward[]>;
}

export class MemStorage implements IStorage {
  private portfolios: Map<string, Portfolio>;
  private delegates: Map<string, Delegate>;
  private secretariat: Map<string, Secretariat>;
  private committees: Map<string, Committee>;
  private executiveBoard: Map<string, ExecutiveBoard>;
  private tasks: Map<string, Task>;
  private logistics: Map<string, Logistics>;
  private marketing: Map<string, Marketing>;
  private sponsorships: Map<string, Sponsorship>;
  private updates: Map<string, Update>;
  private evaluations: Map<string, DelegateEvaluation>;
  private appSettings: AppSettings | undefined;
  private markingCriteria: Map<string, MarkingCriteria>;
  private awardTypes: Map<string, AwardType>;
  private delegateAwards: Map<string, DelegateAward>;

  constructor() {
    this.portfolios = new Map();
    this.delegates = new Map();
    this.secretariat = new Map();
    this.committees = new Map();
    this.executiveBoard = new Map();
    this.tasks = new Map();
    this.logistics = new Map();
    this.marketing = new Map();
    this.sponsorships = new Map();
    this.updates = new Map();
    this.evaluations = new Map();
    this.appSettings = undefined;
    this.markingCriteria = new Map();
    this.awardTypes = new Map();
    this.delegateAwards = new Map();

    this.seedData();
  }

  private seedData() {
    const defaultPortfolios: Portfolio[] = [
      { id: randomUUID(), name: "United States", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "China", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Russia", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "United Kingdom", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "France", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Germany", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "India", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Japan", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Brazil", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Canada", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Australia", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "South Africa", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Saudi Arabia", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "Mexico", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "South Korea", type: "Country", isAvailable: 1 },
      { id: randomUUID(), name: "WHO", type: "NGO", isAvailable: 1 },
      { id: randomUUID(), name: "UNESCO", type: "NGO", isAvailable: 1 },
      { id: randomUUID(), name: "UNICEF", type: "NGO", isAvailable: 1 },
      { id: randomUUID(), name: "Red Cross", type: "NGO", isAvailable: 1 },
      { id: randomUUID(), name: "Amnesty International", type: "NGO", isAvailable: 1 },
      { id: randomUUID(), name: "Greenpeace", type: "NGO", isAvailable: 1 },
    ];
    
    defaultPortfolios.forEach(p => this.portfolios.set(p.id, p));

    this.appSettings = {
      id: randomUUID(),
      currency: "USD",
      currencySymbol: "$",
    };

    const samplePortfolio = defaultPortfolios[0];
    const sampleDelegate: Delegate = {
      id: randomUUID(),
      name: "Alex Thompson",
      school: "International High School",
      committeeId: "",
      committee: "UNSC",
      portfolioId: samplePortfolio.id,
      portfolio: samplePortfolio.name,
      email: "alex.thompson@example.com",
      phone: "+1 555-0123",
      status: "confirmed",
      performanceScore: 0,
      notes: "First-time delegate, very enthusiastic",
    };
    this.delegates.set(sampleDelegate.id, sampleDelegate);

    const sampleCommittee: Committee = {
      id: randomUUID(),
      name: "United Nations Security Council",
      topic: "Peace and Security in the Middle East",
      agenda: "Discussing regional conflicts and peacekeeping operations",
      chairperson: "Sarah Johnson",
      viceChairperson: "Michael Chen",
      rapporteur: "Emma Williams",
      sessionCount: 3,
      status: "active",
      portfolios: null,
    };
    this.committees.set(sampleCommittee.id, sampleCommittee);

    const sampleTask: Task = {
      id: randomUUID(),
      title: "Finalize venue booking",
      description: "Confirm the main conference hall and breakout rooms",
      assignee: "David Martinez",
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: "Logistics",
    };
    this.tasks.set(sampleTask.id, sampleTask);

    const sampleUpdate: Update = {
      id: randomUUID(),
      title: "Registration Extended",
      content: "Due to popular demand, we've extended the delegate registration deadline by one week. New deadline is March 15, 2025.",
      category: "announcement",
      author: "Secretary General",
      timestamp: new Date(),
    };
    this.updates.set(sampleUpdate.id, sampleUpdate);

    const defaultMarkingCriteria: MarkingCriteria[] = [
      { id: randomUUID(), name: "Research & Preparation", maxPoints: 100, description: "Quality of research and preparation for the topic", orderIndex: 0 },
      { id: randomUUID(), name: "Communication Skills", maxPoints: 100, description: "Effectiveness in verbal and written communication", orderIndex: 1 },
      { id: randomUUID(), name: "Diplomacy & Negotiation", maxPoints: 100, description: "Ability to negotiate and build consensus", orderIndex: 2 },
      { id: randomUUID(), name: "Participation & Engagement", maxPoints: 100, description: "Active participation in debates and discussions", orderIndex: 3 },
    ];
    defaultMarkingCriteria.forEach(c => this.markingCriteria.set(c.id, c));

    const defaultAwardTypes: AwardType[] = [
      { id: randomUUID(), name: "Best Delegate", description: "Awarded to the top performing delegate", orderIndex: 0, isActive: 1 },
      { id: randomUUID(), name: "High Commendation", description: "Awarded to exceptional delegates", orderIndex: 1, isActive: 1 },
      { id: randomUUID(), name: "Special Mention", description: "Recognition for notable performance", orderIndex: 2, isActive: 1 },
      { id: randomUUID(), name: "Verbal Mention", description: "Honorable verbal recognition", orderIndex: 3, isActive: 1 },
      { id: randomUUID(), name: "Honorary Mention", description: "Honorary recognition", orderIndex: 4, isActive: 1 },
    ];
    defaultAwardTypes.forEach(a => this.awardTypes.set(a.id, a));
  }

  async getDelegates(): Promise<Delegate[]> {
    return Array.from(this.delegates.values());
  }

  async getDelegate(id: string): Promise<Delegate | undefined> {
    return this.delegates.get(id);
  }

  async createDelegate(insertDelegate: InsertDelegate): Promise<Delegate> {
    const id = randomUUID();
    const delegate: Delegate = normalizeNullable({ ...insertDelegate, id });
    this.delegates.set(id, delegate);
    return delegate;
  }

  async updateDelegate(id: string, data: Partial<InsertDelegate>): Promise<Delegate | undefined> {
    const existing = this.delegates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.delegates.set(id, updated);
    return updated;
  }

  async deleteDelegate(id: string): Promise<boolean> {
    return this.delegates.delete(id);
  }

  async getSecretariat(): Promise<Secretariat[]> {
    return Array.from(this.secretariat.values());
  }

  async createSecretariat(insertMember: InsertSecretariat): Promise<Secretariat> {
    const id = randomUUID();
    const member: Secretariat = normalizeNullable({ ...insertMember, id });
    this.secretariat.set(id, member);
    return member;
  }

  async updateSecretariat(id: string, data: Partial<InsertSecretariat>): Promise<Secretariat | undefined> {
    const existing = this.secretariat.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.secretariat.set(id, updated);
    return updated;
  }

  async deleteSecretariat(id: string): Promise<boolean> {
    return this.secretariat.delete(id);
  }

  async getCommittees(): Promise<Committee[]> {
    return Array.from(this.committees.values());
  }

  async createCommittee(insertCommittee: InsertCommittee): Promise<Committee> {
    const id = randomUUID();
    const committee: Committee = normalizeNullable({ ...insertCommittee, id });
    this.committees.set(id, committee);
    return committee;
  }

  async updateCommittee(id: string, data: Partial<InsertCommittee>): Promise<Committee | undefined> {
    const existing = this.committees.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.committees.set(id, updated);
    return updated;
  }

  async deleteCommittee(id: string): Promise<boolean> {
    return this.committees.delete(id);
  }

  async getExecutiveBoard(): Promise<ExecutiveBoard[]> {
    return Array.from(this.executiveBoard.values());
  }

  async createExecutiveBoard(insertMember: InsertExecutiveBoard): Promise<ExecutiveBoard> {
    const id = randomUUID();
    const member: ExecutiveBoard = normalizeNullable({ ...insertMember, id });
    this.executiveBoard.set(id, member);
    return member;
  }

  async updateExecutiveBoard(id: string, data: Partial<InsertExecutiveBoard>): Promise<ExecutiveBoard | undefined> {
    const existing = this.executiveBoard.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.executiveBoard.set(id, updated);
    return updated;
  }

  async deleteExecutiveBoard(id: string): Promise<boolean> {
    return this.executiveBoard.delete(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return 0;
    });
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = normalizeNullable({ ...insertTask, id });
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getLogistics(): Promise<Logistics[]> {
    return Array.from(this.logistics.values());
  }

  async createLogistics(insertItem: InsertLogistics): Promise<Logistics> {
    const id = randomUUID();
    const item: Logistics = normalizeNullable({ ...insertItem, id });
    this.logistics.set(id, item);
    return item;
  }

  async updateLogistics(id: string, data: Partial<InsertLogistics>): Promise<Logistics | undefined> {
    const existing = this.logistics.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.logistics.set(id, updated);
    return updated;
  }

  async deleteLogistics(id: string): Promise<boolean> {
    return this.logistics.delete(id);
  }

  async getMarketing(): Promise<Marketing[]> {
    return Array.from(this.marketing.values()).sort((a, b) => {
      if (a.startDate && b.startDate) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0;
    });
  }

  async createMarketing(insertCampaign: InsertMarketing): Promise<Marketing> {
    const id = randomUUID();
    const campaign: Marketing = normalizeNullable({ ...insertCampaign, id });
    this.marketing.set(id, campaign);
    return campaign;
  }

  async updateMarketing(id: string, data: Partial<InsertMarketing>): Promise<Marketing | undefined> {
    const existing = this.marketing.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.marketing.set(id, updated);
    return updated;
  }

  async deleteMarketing(id: string): Promise<boolean> {
    return this.marketing.delete(id);
  }

  async getSponsorships(): Promise<Sponsorship[]> {
    return Array.from(this.sponsorships.values()).sort((a, b) => b.amount - a.amount);
  }

  async createSponsorship(insertSponsor: InsertSponsorship): Promise<Sponsorship> {
    const id = randomUUID();
    const sponsor: Sponsorship = normalizeNullable({ ...insertSponsor, id });
    this.sponsorships.set(id, sponsor);
    return sponsor;
  }

  async updateSponsorship(id: string, data: Partial<InsertSponsorship>): Promise<Sponsorship | undefined> {
    const existing = this.sponsorships.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.sponsorships.set(id, updated);
    return updated;
  }

  async deleteSponsorship(id: string): Promise<boolean> {
    return this.sponsorships.delete(id);
  }

  async getUpdates(): Promise<Update[]> {
    return Array.from(this.updates.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async createUpdate(insertUpdate: InsertUpdate): Promise<Update> {
    const id = randomUUID();
    const update: Update = { ...insertUpdate, id, timestamp: new Date() };
    this.updates.set(id, update);
    return update;
  }

  async updateUpdate(id: string, data: Partial<InsertUpdate>): Promise<Update | undefined> {
    const existing = this.updates.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.updates.set(id, updated);
    return updated;
  }

  async deleteUpdate(id: string): Promise<boolean> {
    return this.updates.delete(id);
  }

  async getEvaluations(): Promise<DelegateEvaluation[]> {
    return Array.from(this.evaluations.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async createEvaluation(insertEvaluation: InsertDelegateEvaluation): Promise<DelegateEvaluation> {
    const id = randomUUID();
    const evaluation: DelegateEvaluation = normalizeNullable({ ...insertEvaluation, id, timestamp: new Date() });
    this.evaluations.set(id, evaluation);
    return evaluation;
  }

  async updateEvaluation(id: string, data: Partial<InsertDelegateEvaluation>): Promise<DelegateEvaluation | undefined> {
    const existing = this.evaluations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.evaluations.set(id, updated);
    return updated;
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    return this.evaluations.delete(id);
  }

  async getPortfolios(): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "Country" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    const portfolio: Portfolio = normalizeNullable({ ...insertPortfolio, id });
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const existing = this.portfolios.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.portfolios.set(id, updated);
    return updated;
  }

  async deletePortfolio(id: string): Promise<boolean> {
    return this.portfolios.delete(id);
  }

  async getAppSettings(): Promise<AppSettings | undefined> {
    return this.appSettings;
  }

  async updateAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings> {
    if (!this.appSettings) {
      this.appSettings = {
        id: randomUUID(),
        currency: settings.currency || "USD",
        currencySymbol: settings.currencySymbol || "$",
      };
    } else {
      this.appSettings = { ...this.appSettings, ...settings };
    }
    return this.appSettings;
  }

  async getMarkingCriteria(): Promise<MarkingCriteria[]> {
    return Array.from(this.markingCriteria.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createMarkingCriteria(insertCriteria: InsertMarkingCriteria): Promise<MarkingCriteria> {
    const id = randomUUID();
    const criteria: MarkingCriteria = normalizeNullable({ ...insertCriteria, id });
    this.markingCriteria.set(id, criteria);
    return criteria;
  }

  async updateMarkingCriteria(id: string, data: Partial<InsertMarkingCriteria>): Promise<MarkingCriteria | undefined> {
    const existing = this.markingCriteria.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.markingCriteria.set(id, updated);
    return updated;
  }

  async deleteMarkingCriteria(id: string): Promise<boolean> {
    return this.markingCriteria.delete(id);
  }

  async getAwardTypes(): Promise<AwardType[]> {
    return Array.from(this.awardTypes.values()).sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createAwardType(insertAwardType: InsertAwardType): Promise<AwardType> {
    const id = randomUUID();
    const awardType: AwardType = normalizeNullable({ ...insertAwardType, id });
    this.awardTypes.set(id, awardType);
    return awardType;
  }

  async updateAwardType(id: string, data: Partial<InsertAwardType>): Promise<AwardType | undefined> {
    const existing = this.awardTypes.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.awardTypes.set(id, updated);
    return updated;
  }

  async deleteAwardType(id: string): Promise<boolean> {
    return this.awardTypes.delete(id);
  }

  async getDelegateAwards(): Promise<DelegateAward[]> {
    return Array.from(this.delegateAwards.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  async getDelegateAwardsByCommittee(committeeId: string): Promise<DelegateAward[]> {
    return Array.from(this.delegateAwards.values())
      .filter(award => award.committeeId === committeeId)
      .sort((a, b) => {
        const awardTypes = Array.from(this.awardTypes.values());
        const aTypeOrder = awardTypes.find(at => at.id === a.awardTypeId)?.orderIndex ?? 999;
        const bTypeOrder = awardTypes.find(at => at.id === b.awardTypeId)?.orderIndex ?? 999;
        return aTypeOrder - bTypeOrder;
      });
  }

  async createDelegateAward(insertAward: InsertDelegateAward): Promise<DelegateAward> {
    const id = randomUUID();
    const award: DelegateAward = normalizeNullable({ ...insertAward, id, timestamp: new Date() });
    this.delegateAwards.set(id, award);
    return award;
  }

  async updateDelegateAward(id: string, data: Partial<InsertDelegateAward>): Promise<DelegateAward | undefined> {
    const existing = this.delegateAwards.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.delegateAwards.set(id, updated);
    return updated;
  }

  async deleteDelegateAward(id: string): Promise<boolean> {
    return this.delegateAwards.delete(id);
  }

  async autoAssignAwards(committeeId: string, committeeName: string, assignedBy: string): Promise<DelegateAward[]> {
    const evaluations = Array.from(this.evaluations.values())
      .filter(evaluation => evaluation.committee === committeeName)
      .sort((a, b) => b.totalScore - a.totalScore);

    const activeAwardTypes = Array.from(this.awardTypes.values())
      .filter(at => at.isActive === 1)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const existingAwards = await this.getDelegateAwardsByCommittee(committeeId);
    existingAwards.forEach(award => this.delegateAwards.delete(award.id));

    const newAwards: DelegateAward[] = [];
    const assignedDelegates = new Set<string>();

    activeAwardTypes.forEach((awardType, index) => {
      if (index < evaluations.length && !assignedDelegates.has(evaluations[index].delegateId)) {
        const evaluation = evaluations[index];
        const award: DelegateAward = normalizeNullable({
          id: randomUUID(),
          committeeId,
          committeeName,
          awardTypeId: awardType.id,
          awardTypeName: awardType.name,
          delegateId: evaluation.delegateId,
          delegateName: evaluation.delegateName,
          isAutoAssigned: 1,
          assignedBy,
          timestamp: new Date(),
        });
        this.delegateAwards.set(award.id, award);
        newAwards.push(award);
        assignedDelegates.add(evaluation.delegateId);
      }
    });

    return newAwards;
  }
}

export const storage = new MemStorage();
