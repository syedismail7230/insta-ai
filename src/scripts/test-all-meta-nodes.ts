import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testNodes() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  console.log("Testing all Meta nodes with current token...");

  // Node 1: Instagram Business ID
  const r1 = await fetch(`https://graph.facebook.com/v21.0/17841413970700607?fields=id,name,username&access_token=${token}`);
  console.log("1. IG Account Node (17841413970700607):", await r1.json());

  // Node 2: Facebook Page ID
  const r2 = await fetch(`https://graph.facebook.com/v21.0/115679509983218?fields=id,name,access_token&access_token=${token}`);
  console.log("2. FB Page Node (115679509983218):", await r2.json());

  // Node 3: IG Conversations
  const r3 = await fetch(`https://graph.facebook.com/v21.0/17841413970700607/conversations?access_token=${token}`);
  console.log("3. IG Conversations Node:", await r3.json());
}

testNodes();
