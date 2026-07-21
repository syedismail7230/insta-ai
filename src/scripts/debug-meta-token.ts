import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function debugToken() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  console.log("Checking Page Access Token debug permissions...");

  const url = `https://graph.facebook.com/v21.0/me?fields=id,name,category,access_token&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Meta Me Endpoint Response:", JSON.stringify(data, null, 2));
}

debugToken();
