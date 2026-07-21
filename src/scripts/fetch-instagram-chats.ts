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

  console.log("🔄 Fetching live Instagram chats directly from Meta Graph API for Zawr Industries...");

  // 1. Fetch conversations threads with limit=2
  const url = `https://graph.facebook.com/v21.0/me/conversations?platform=instagram&limit=2&access_token=${token}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("❌ Meta Graph API Error:", data.error);
      return;
    }

    const convList = data.data || [];
    console.log(`📥 Found ${convList.length} active Instagram conversation thread(s). Ingesting...`);

    for (const thread of convList) {
      const threadId = thread.id;

      // 2. Fetch detail & messages for thread
      const detailUrl = `https://graph.facebook.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`;
      const detailRes = await fetch(detailUrl);
      const detail = await detailRes.json();

      const participants = detail.participants?.data || [];
      const customerParticipant = participants.find((p: any) => p.username !== "zawr_industries" && p.id !== "17841413970700607") || participants[0];

      if (!customerParticipant) continue;

      const instagramId = customerParticipant.id;
      const username = customerParticipant.username || `ig_user_${instagramId.slice(-6)}`;
      const fullName = customerParticipant.name || username;

      // Upsert Customer
      let existingCust = await db.select().from(customers).where(eq(customers.instagramId, instagramId));
      let custId = existingCust[0]?.id;

      if (!custId) {
        custId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(customers).values({
          id: custId,
          instagramId,
          username,
          fullName,
          leadScore: 75,
          stage: "qualified",
          requirements: "Inquired about ChatBot Development & AI Consultancy",
          isHumanTakeover: false,
        });
        console.log(`👤 Ingested Real Customer Profile: @${username} (${fullName})`);
      }

      // Upsert Conversation
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
        console.log(`💬 Created Conversation record for @${username}`);
      }

      // Ingest Messages
      const msgList = detail.messages?.data || [];
      for (const m of [...msgList].reverse()) {
        if (!m.message) continue;

        const isFromCustomer = m.from?.id === instagramId || m.from?.username === username;
        const senderType = isFromCustomer ? "customer" : "ai";
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

      console.log(`✅ Ingested ${msgList.length} real Instagram DMs for @${username}`);
    }

    console.log("🎉 Real Instagram Chat Ingestion Completed Successfully!");
  } catch (err) {
    console.error("❌ Error syncing Instagram chats:", err);
  }
}

syncLiveInstagramChats();
