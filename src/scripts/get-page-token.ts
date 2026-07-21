import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function fetchPageToken() {
  const userToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  console.log("Fetching Page Access Token for Zawr Industries using User Token...");

  const url = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userToken}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Accounts Result:", JSON.stringify(data, null, 2));

  if (data.data && data.data.length > 0) {
    const page = data.data.find((p: any) => p.name.includes("Zawr") || p.id === "115679509983218") || data.data[0];
    console.log(`\n✅ FOUND PAGE: ${page.name} (ID: ${page.id})`);
    console.log(`🔑 REAL PAGE ACCESS TOKEN FOR .env.local:\n${page.access_token}`);
  }
}

fetchPageToken();
