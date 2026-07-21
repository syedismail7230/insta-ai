import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { customers, conversations, messages, pendingQuestions } from "./schema";

async function clearData() {
  console.log("🧹 Purging all existing sample/test data from Neon PostgreSQL database...");

  await db.delete(pendingQuestions);
  console.log("✅ Cleared pending_questions table");

  await db.delete(messages);
  console.log("✅ Cleared messages table");

  await db.delete(conversations);
  console.log("✅ Cleared conversations table");

  await db.delete(customers);
  console.log("✅ Cleared customers table");

  console.log("✨ Remote Neon PostgreSQL database is now 100% clean and ready for real-time production DMs!");
}

clearData().catch((err) => {
  console.error("❌ Error clearing database:", err);
  process.exit(1);
});
