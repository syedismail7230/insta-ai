import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testIgDirectSend() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const igId = "17841413970700607";
  const recipientId = "4469044433164710"; // riwa_interiors ID

  console.log(`Testing direct send via IG Node https://graph.facebook.com/v21.0/${igId}/messages ...`);

  // Attempt 1: Standard payload via IG Node
  const url = `https://graph.facebook.com/v21.0/${igId}/messages?access_token=${token}`;
  const payload1 = {
    recipient: { id: recipientId },
    message: { text: "Hello! Direct test from Zawr AI Sales Agent." }
  };

  const res1 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload1)
  });
  const data1 = await res1.json();
  console.log("1. Response from IG Node /messages:", JSON.stringify(data1, null, 2));

  // Attempt 2: recipient as igsid
  const payload2 = {
    recipient: { ig_id: recipientId },
    message: { text: "Hello! Direct test 2 from Zawr AI Sales Agent." }
  };
  const res2 = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload2)
  });
  const data2 = await res2.json();
  console.log("2. Response with recipient.ig_id:", JSON.stringify(data2, null, 2));
}

testIgDirectSend();
