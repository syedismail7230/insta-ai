import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testToken() {
  const token = "IGAGHgyr7f7FZABZAGI2aWFmM3dELUV1bzJzNHRRMHZAGRTYxWHZAPalZAXeHZA5RS1DanM0UWIzUEpkOEVHY1UwUTc2YUY1Y244UktIYTBVZAGxCR3ZAGeDNKalEtby1KWlFjbHVsUXBXMnZAGMF9nU1NucGFrM0N3TWpBWHRpV004R3JfNAZDZD";
  console.log("Testing newly generated Instagram token...");

  // Test 1: graph.instagram.com /me
  const r1 = await fetch(`https://graph.instagram.com/v21.0/me?fields=id,username,name&access_token=${token}`);
  console.log("1. graph.instagram.com /me:", await r1.json());

  // Test 2: graph.facebook.com /me
  const r2 = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
  console.log("2. graph.facebook.com /me:", await r2.json());
}

testToken();
