import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testMetaEndpoints() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("Token missing");
    return;
  }

  // Test 1: me?fields=id,name,instagram_business_account
  console.log("--- Test 1: Page & IG Business Account Info ---");
  const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account&access_token=${token}`);
  const meData = await meRes.json();
  console.log("Me Data:", meData);

  const igId = meData.instagram_business_account?.id;
  if (igId) {
    console.log("--- Test 2: IG Account Conversations endpoint ---");
    const igConvRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/conversations?fields=id&limit=5&access_token=${token}`);
    const igConvData = await igConvRes.json();
    console.log("IG Account Conversations:", igConvData);
  }

  console.log("--- Test 3: Page Conversations with folder=inbox ---");
  const pageConvRes = await fetch(`https://graph.facebook.com/v21.0/me/conversations?platform=instagram&folder=inbox&limit=5&fields=id&access_token=${token}`);
  const pageConvData = await pageConvRes.json();
  console.log("Page Conv Data:", pageConvData);
}

testMetaEndpoints();
