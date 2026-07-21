import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../db";
import { customers, conversations, messages } from "../db/schema";
import { eq } from "drizzle-orm";

async function syncLiveInstagramChats() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("❌ INSTAGRAM_PAGE_ACCESS_TOKEN is missing in .env.local");
    process.exit(1);
  }

  console.log("🔄 Connecting to Meta Graph API to fetch live Instagram chats for Zawr Industries...");

  // 1. Fetch conversations threads from Meta Graph API
  const url = `https://graph.facebook.com/v21.0/me/conversations?platform=instagram&fields=id,updated_time,participants&access_token=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("❌ Meta Graph API returned an error:", data.error);
      return;
    }

    const convList = data.data || [];
    console.log(`📥 Retrieved ${convList.length} active conversation thread(s) directly from Meta Graph API.`);

    if (convList.length === 0) {
      console.log("ℹ️ Zero DM threads found on Instagram page right now.");
      console.log("💡 Tip: Send a message to your Instagram Page DM to test live real-time ingestion!");
      return;
    }

    for (const thread of convList) {
      const participants = thread.participants?.data || [];
      const customerParticipant = participants.find((p: any) => p.id !== "me") || participants[0];

      if (!customerParticipant) continue;

      const instagramId = customerParticipant.id;
      const username = customerParticipant.username || customerParticipant.name || `ig_user_${instagramId.slice(-6)}`;
      const fullName = customerParticipant.name || username;

      let existingCust = await db.select().from(customers).where(eq(customers.instagramId, instagramId));
      let custId = existingCust[0]?.id;

      if (!custId) {
        custId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(customers).values({
          id: custId,
          instagramId,
          username,
          fullName,
          leadScore: 50,
          stage: "lead",
          isHumanTakeover: false,
        });
        console.log(`👤 Created customer profile for @${username}`);
      }

      let existingConv = await db.select().from(conversations).where(eq(conversations.customerId, custId));
      let convId = existingConv[0]?.id;

      if (!convId) {
        convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(conversations).values({
          id: convId,
          customerId: custId,
          channel: "instagram",
          status: "active",
          lastMessage: "Instagram DM Thread",
        });
        console.log(`💬 Created conversation thread for @${username}`);
      }

      // 2. Fetch messages in thread
      const messagesUrl = `https://graph.facebook.com/v21.0/${thread.id}/messages?fields=id,message,created_time,from,to&access_token=${token}`;
      const msgRes = await fetch(messagesUrl);
      const msgData = await msgRes.json();
      const msgList = msgData.data || [];

      for (const m of msgList.reverse()) {
        if (!m.message) continue;

        const isFromMe = m.from?.id !== instagramId;
        const senderType = isFromMe ? "ai" : "customer";
        const senderId = m.from?.id || instagramId;

        await db.insert(messages).values({
          id: `msg_${m.id}`,
          conversationId: convId,
          senderType,
          senderId,
          content: m.message,
          createdAt: new Date(m.created_time),
        }).onConflictDoNothing();
      }

      console.log(`✅ Synced ${msgList.length} messages for @${username}`);
    }

    console.log("🎉 Instagram Chat sync completed successfully!");
  } catch (err) {
    console.error("❌ Error fetching live chats from Meta Graph API:", err);
  }
}

syncLiveInstagramChats();
