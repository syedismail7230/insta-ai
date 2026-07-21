import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../db";
import { aiSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function setGroq() {
  await db.update(aiSettings).set({ activeProvider: "groq" }).where(eq(aiSettings.id, "default"));
  console.log("✅ Set active AI Provider to Groq (Llama 3.3 70B) in Neon PostgreSQL database!");
}

setGroq();
