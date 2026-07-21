import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { processCustomerDM } from "../lib/ai/router";

async function testGemini() {
  console.log("--- Testing Gemini AI Response for 'hello' ---");
  const r1 = await processCustomerDM("hello");
  console.log("Response 1 ('hello'):", JSON.stringify(r1, null, 2));

  console.log("--- Testing Gemini AI Response for 'What are your pricing plans?' ---");
  const r2 = await processCustomerDM("What are your pricing plans?");
  console.log("Response 2 ('pricing'):", JSON.stringify(r2, null, 2));
}

testGemini();
