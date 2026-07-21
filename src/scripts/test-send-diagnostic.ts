import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function diagnoseSending() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  console.log("Diagnosing Instagram Outbound DM API endpoint...");

  // 1. Check Me Endpoint
  const pageRes = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${token}`);
  const pageData = await pageRes.json();
  console.log("1. /me endpoint:", JSON.stringify(pageData, null, 2));

  // 2. Check Conversations List to get a real IGSID (Instagram Scoped User ID)
  const convRes = await fetch(`https://graph.facebook.com/v21.0/me/conversations?platform=instagram&access_token=${token}`);
  const convData = await convRes.json();
  console.log("2. /me/conversations endpoint:", JSON.stringify(convData, null, 2));

  if (convData.data && convData.data.length > 0) {
    const threadId = convData.data[0].id;
    const threadRes = await fetch(`https://graph.facebook.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`);
    const threadData = await threadRes.json();
    console.log("3. Thread details:", JSON.stringify(threadData, null, 2));

    const participants = threadData.participants?.data || [];
    const cust = participants.find((p: any) => p.id !== "17841413970700607" && p.id !== "115679509983218");
    if (cust) {
      console.log(`4. Attempting send to customer IGSID: ${cust.id} (${cust.username || cust.name})...`);

      const meUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${token}`;
      const sendRes = await fetch(meUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: cust.id },
          message: { text: "Hello! Diagnostic test from Zawr AI Sales Agent." },
          messaging_type: "RESPONSE"
        })
      });
      const sendData = await sendRes.json();
      console.log("5. Send Result to /me/messages:", JSON.stringify(sendData, null, 2));
    }
  }
}

diagnoseSending();
