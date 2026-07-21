import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("⚠️ DATABASE_URL environment variable is missing.");
}

const sql = neon(connectionString || "postgresql://user:pass@localhost/db");
export const db = drizzle(sql, { schema });
