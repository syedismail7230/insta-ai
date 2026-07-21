import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testMetaToken() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!token) return;

  console.log("--- Debugging Token Scope & Graph Endpoints ---");

  // 1. debug_token
  const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${token}&access_token=${token}`;
  const dRes = await fetch(debugUrl);
  const dData = await dRes.json();
  console.log("Token Scope & Granular Permissions:", JSON.stringify(dData, null, 2));
}

testMetaToken();
