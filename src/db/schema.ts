import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: text("id").primaryKey(), // UUID or ig_user_id
  instagramId: text("instagram_id").notNull().unique(),
  username: text("username"),
  fullName: text("full_name"),
  profilePic: text("profile_pic"),
  email: text("email"),
  phone: text("phone"),
  leadScore: integer("lead_score").default(0).notNull(),
  stage: text("stage").default("lead").notNull(), // 'lead' | 'qualified' | 'proposal' | 'closed_won' | 'closed_lost'
  budget: text("budget"),
  timeline: text("timeline"),
  requirements: text("requirements"),
  notes: text("notes"),
  isHumanTakeover: boolean("is_human_takeover").default(false).notNull(),
  lastContactAt: timestamp("last_contact_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  channel: text("channel").default("instagram").notNull(), // 'instagram' | 'whatsapp' | 'messenger' | 'webchat' | 'email'
  status: text("status").default("active").notNull(), // 'active' | 'closed' | 'archived'
  lastMessage: text("last_message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderType: text("sender_type").notNull(), // 'customer' | 'ai' | 'human'
  senderId: text("sender_id"),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: text("id").primaryKey(),
  category: text("category").default("general").notNull(), // 'services' | 'pricing' | 'faq' | 'company' | 'objections'
  title: text("title").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tags: text("tags"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pendingQuestions = pgTable("pending_questions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  context: text("context"),
  suggestedAnswer: text("suggested_answer"),
  approvedAnswer: text("approved_answer"),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const aiSettings = pgTable("ai_settings", {
  id: text("id").primaryKey(), // single row settings "default"
  agentName: text("agent_name").default("Zawr AI Assistant").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  tone: text("tone").default("consultative").notNull(),
  activeProvider: text("active_provider").default("gemini").notNull(), // 'gemini' | 'groq' | 'openai' | 'openrouter'
  geminiModel: text("gemini_model").default("gemini-1.5-flash").notNull(),
  groqModel: text("groq_model").default("llama-3.3-70b-versatile").notNull(),
  openaiModel: text("openai_model").default("gpt-4o-mini").notNull(),
  openrouterModel: text("openrouter_model").default("anthropic/claude-3.5-haiku").notNull(),
  fallbackMessage: text("fallback_message").default("Thanks for reaching out! Let me check with our specialized engineering team at Zawr Industries and get back to you right away.").notNull(),
  qualificationRules: jsonb("qualification_rules"),
  geminiApiKey: text("gemini_api_key"),
  groqApiKey: text("groq_api_key"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const links = pgTable("links", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  shortCode: text("short_code").notNull(),
  category: text("category").default("general").notNull(), // 'booking' | 'portfolio' | 'pricing' | 'case_study'
  description: text("description"),
  clicks: integer("clicks").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
