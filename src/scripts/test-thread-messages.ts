import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testMessages() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  // Let's use riwa_interiors thread ID: 4469044433164710 or the actual Meta thread ID!
  // Note: in your first sync output, syncedThreads returned 2! Let's fetch the list of conversations first!
  
  console.log("Fetching conversations...");
  const convRes = await fetch(`https://graph.facebook.com/v21.0/me/conversations?platform=instagram&access_token=${token}`);
  const convData = await convRes.json();
  console.log("Conversations list:", JSON.stringify(convData, null, 2));

  const firstThread = convData.data?.[0];
  if (!firstThread) {
    console.log("No threads found.");
    return;
  }

  const threadId = firstThread.id;
  console.log(`Fetching messages for thread ${threadId} using /messages path...`);
  const msgRes = await fetch(`https://graph.facebook.com/v21.0/${threadId}/messages?fields=id,message,created_time,from&access_token=${token}`);
  console.log("Messages response:", await msgRes.json());
  
  console.log(`Fetching thread details for thread ${threadId} using direct GET...`);
  const detailRes = await fetch(`https://graph.facebook.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`);
  console.log("Detail response:", await detailRes.json());
}

testMessages();
