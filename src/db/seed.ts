import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { aiSettings, knowledgeBase, links } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seeding Zawr Industries database...");

  // 1. AI Settings
  const existingSettings = await db.select().from(aiSettings).where(eq(aiSettings.id, "default"));
  if (existingSettings.length === 0) {
    await db.insert(aiSettings).values({
      id: "default",
      agentName: "Zawr AI Assistant",
      systemPrompt: `You are the executive AI Sales Representative for Zawr Industries, an elite software engineering & AI innovation agency.
Your core objective is to engage Instagram Direct Messages (DMs) professionally, qualify technical & business requirements, collect budget and timeline, answer queries using ONLY the provided Knowledge Base context, handle objections using only official facts, and convert leads into booked discovery calls.

STRICT RULE: Never hallucinate pricing, timelines, or services not in the Knowledge Base. If an incoming question cannot be accurately answered with 100% confidence from the Knowledge Base, politely acknowledge the inquiry, inform the user that our technical leads will follow up, and do NOT guess.`,
      tone: "consultative",
      activeProvider: "groq",
      geminiModel: "gemini-2.0-flash",
      groqModel: "llama-3.3-70b-versatile",
      openaiModel: "gpt-4o-mini",
      openrouterModel: "anthropic/claude-3.5-haiku",
      fallbackMessage: "Thanks for reaching out to Zawr Industries! That's a specialized technical query—let me double-check the exact specifications with our senior solution architect and get right back to you here in DM!",
      qualificationRules: {
        minBudget: "$5,000",
        targetRoles: ["CEO", "Founder", "CTO", "Agency Owner", "Product Manager"],
        keyQuestions: [
          "What software application or AI automation are you looking to build?",
          "What is your target timeline for launching this solution?",
          "What estimated budget range have you allocated ($5k-$15k, $15k-$50k, $50k+)?"
        ]
      }
    });
    console.log("✅ Seeded default AI Settings");
  }

  // 2. Knowledge Base (Official Truth Source)
  const existingKb = await db.select().from(knowledgeBase);
  if (existingKb.length === 0) {
    await db.insert(knowledgeBase).values([
      {
        id: "kb_1",
        category: "company",
        title: "About Zawr Industries",
        question: "What is Zawr Industries?",
        answer: "Zawr Industries is a high-impact software engineering & AI innovation studio specializing in full-stack web applications, custom AI automation agents, Instagram/WhatsApp DM sales bots, mobile apps, and scalable cloud infrastructure.",
        tags: "about,company,overview,agency",
        isActive: true,
      },
      {
        id: "kb_2",
        category: "services",
        title: "Services Offered",
        question: "What services do you offer?",
        answer: "Our core engineering services include: 1. Custom AI Sales Agents & Webhook Automation, 2. Web App Development (Next.js/React/Node/PostgreSQL), 3. Mobile Apps (iOS & Android), 4. Cloud Architecture & API Integrations, 5. Custom Business CRM & Admin Dashboards.",
        tags: "services,ai,web,mobile,crm",
        isActive: true,
      },
      {
        id: "kb_3",
        category: "pricing",
        title: "Pricing & Engagement Models",
        question: "How much do your services cost?",
        answer: "Our project engagements start at $5,000 for targeted MVP sprints. Full-scale AI automation platforms and enterprise web applications typically range between $15,000 to $50,000+. We offer clear fixed-scope milestone deliverables and monthly sprint support.",
        tags: "pricing,cost,budget,rates",
        isActive: true,
      },
      {
        id: "kb_4",
        category: "faq",
        title: "Booking a Discovery Call",
        question: "How can I book a call or get a quote?",
        answer: "You can schedule a direct 1-on-1 technical discovery call with our solutions lead using our official calendar link: https://calendly.com/zawr-industries/discovery",
        tags: "booking,call,calendly,contact",
        isActive: true,
      },
      {
        id: "kb_5",
        category: "objections",
        title: "Zawr Industries vs Freelancers",
        question: "Why choose Zawr Industries over hiring freelancers?",
        answer: "Zawr Industries delivers dedicated senior software architects, strict SLA guarantees, bulletproof security compliance, 100% full source code ownership, and continuous AI maintenance. We build production-ready applications 3x faster with zero technical debt.",
        tags: "objections,why_us,freelancer_comparison",
        isActive: true,
      }
    ]);
    console.log("✅ Seeded Knowledge Base");
  }

  // 3. Official Links
  const existingLinks = await db.select().from(links);
  if (existingLinks.length === 0) {
    await db.insert(links).values([
      {
        id: "link_1",
        title: "Zawr Discovery Call",
        url: "https://calendly.com/zawr-industries/discovery",
        shortCode: "discovery",
        category: "booking",
        description: "Schedule a 1-on-1 technical consultation call with Zawr Industries.",
        clicks: 0,
      },
      {
        id: "link_2",
        title: "Zawr Agency Portfolio",
        url: "https://zawr.com/portfolio",
        shortCode: "portfolio",
        category: "portfolio",
        description: "View our recent AI & Web Engineering case studies.",
        clicks: 0,
      }
    ]);
    console.log("✅ Seeded Links");
  }

  console.log("🚀 Pure Real-Time Database initialization completed!");
}

main().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});
