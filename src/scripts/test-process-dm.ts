import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { processCustomerDM } from "../lib/ai/router";

async function testProcess() {
  const query = "This is your product sir";
  console.log(`Processing query: "${query}"...`);
  const result = await processCustomerDM(query, { name: "Test User" });
  console.log("Result:", JSON.stringify(result, null, 2));
}

testProcess();
