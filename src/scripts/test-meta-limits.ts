import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testLimits() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;

  console.log("--- Testing limit=1 ---");
  const res1 = await fetch(`https://graph.facebook.com/v21.0/me/conversations?platform=instagram&limit=1&access_token=${token}`);
  const data1 = await res1.json();
  console.log("Limit=1 response:", JSON.stringify(data1, null, 2));

  console.log("--- Testing limit=2 ---");
  const res2 = await fetch(`https://graph.facebook.com/v21.0/me/conversations?platform=instagram&limit=2&access_token=${token}`);
  const data2 = await res2.json();
  console.log("Limit=2 response:", JSON.stringify(data2, null, 2));
}

testLimits();
