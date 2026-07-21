import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testDirect() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  console.log("Testing token directly on Instagram Business Node 17841413970700607...");

  const url = `https://graph.facebook.com/v21.0/17841413970700607?fields=id,username,name,website&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Direct Node Response:", JSON.stringify(data, null, 2));
}

testDirect();
