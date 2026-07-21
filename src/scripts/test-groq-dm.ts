import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { generateGroqResponse } from "../lib/ai/groq";
import { db } from "../db";
import { knowledgeBase, links } from "../db/schema";
import { eq } from "drizzle-orm";

async function testGroq() {
  const kbRows = await db.select().from(knowledgeBase).where(eq(knowledgeBase.isActive, true));
  const linkRows = await db.select().from(links);

  console.log("--- Testing Groq AI Response for 'What are your pricing plans?' ---");
  const res = await generateGroqResponse(
    "What are your pricing plans?",
    "Zawr AI Assistant",
    "consultative",
    "You are the executive AI Sales Representative for Zawr Industries.",
    kbRows,
    linkRows,
    "llama-3.3-70b-versatile"
  );

  console.log("Groq AI Output:", JSON.stringify(res, null, 2));
}

testGroq();
