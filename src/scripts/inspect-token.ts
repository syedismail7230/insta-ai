import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function inspectToken() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  console.log("Inspecting INSTAGRAM_PAGE_ACCESS_TOKEN...");

  const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Token Inspection Data:", JSON.stringify(data, null, 2));
}

inspectToken();
