import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkAll() {
  const token = "IGAGHgyr7f7FZABZAGI2aWFmM3dELUV1bzJzNHRRMHZAGRTYxWHZAPalZAXeHZA5RS1DanM0UWIzUEpkOEVHY1UwUTc2YUY1Y244UktIYTBVZAGxCR3ZAGeDNKalEtby1KWlFjbHVsUXBXMnZAGMF9nU1NucGFrM0N3TWpBWHRpV004R3JfNAZDZD";
  
  console.log("Fetching conversations list...");
  const res = await fetch(`https://graph.instagram.com/v21.0/me/conversations?access_token=${token}`);
  const convs = await res.json();
  const list = convs.data || [];
  console.log(`Found ${list.length} threads. Fetching details for each...`);

  for (const thread of list) {
    const threadId = thread.id;
    const detailRes = await fetch(`https://graph.instagram.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`);
    const detail = await detailRes.json();
    
    const participants = detail.participants?.data || [];
    const me = participants.find((p: any) => p.username === "zawr_industries");
    const customer = participants.find((p: any) => p.username !== "zawr_industries");

    const msgs = detail.messages?.data || [];
    if (msgs.length === 0) continue;

    const latest = msgs[0];
    const isFromCustomer = latest.from?.username !== "zawr_industries";
    
    console.log(`Thread ID: ${threadId}`);
    console.log(`- Customer: @${customer?.username || "unknown"} (ID: ${customer?.id})`);
    console.log(`- Latest Msg: "${latest.message}"`);
    console.log(`- From Customer: ${isFromCustomer}`);
    console.log("-----------------------------------------");
  }
}

checkAll();
