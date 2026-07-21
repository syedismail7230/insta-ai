import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testIgNode() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const igBusinessId = "17841413970700607";

  console.log(`📡 Querying direct Instagram Business Node (${igBusinessId})...`);

  const url = `https://graph.facebook.com/v21.0/${igBusinessId}/conversations?fields=id,updated_time,participants&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Direct IG Node Response:", JSON.stringify(data, null, 2));
}

testIgNode();
