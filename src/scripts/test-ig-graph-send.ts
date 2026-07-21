import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testIgSend() {
  const token = "IGAGHgyr7f7FZABZAGI2aWFmM3dELUV1bzJzNHRRMHZAGRTYxWHZAPalZAXeHZA5RS1DanM0UWIzUEpkOEVHY1UwUTc2YUY1Y244UktIYTBVZAGxCR3ZAGeDNKalEtby1KWlFjbHVsUXBXMnZAGMF9nU1NucGFrM0N3TWpBWHRpV004R3JfNAZDZD";
  const recipientId = "4469044433164710"; // riwa_interiors

  console.log("Testing outbound DM send via graph.instagram.com endpoint...");

  const url = `https://graph.instagram.com/v21.0/me/messages?access_token=${token}`;
  const payload = {
    recipient: { id: recipientId },
    message: { text: "Hello! Direct test from Instagram Graph API." }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log("Send Result from graph.instagram.com:", JSON.stringify(data, null, 2));
}

testIgSend();
