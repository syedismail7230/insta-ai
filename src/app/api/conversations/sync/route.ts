import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "INSTAGRAM_PAGE_ACCESS_TOKEN is missing in server environment." }, { status: 400 });
  }

  try {
    const url = `https://graph.facebook.com/v21.0/me/conversations?platform=instagram&fields=id,updated_time,participants&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("Meta Graph API sync error:", data.error);
      return NextResponse.json({ error: data.error.message || "Meta Graph API error" }, { status: 400 });
    }

    const convList = data.data || [];
    let syncedCount = 0;

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
      }

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

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      syncedThreads: syncedCount,
      message: syncedCount > 0
        ? `Successfully synced ${syncedCount} conversation thread(s) directly from Instagram.`
        : "Connected to Instagram Graph API successfully. Zero active DM threads found on Instagram page."
    });
  } catch (error) {
    console.error("Failed to sync Instagram chats:", error);
    return NextResponse.json({ error: "Internal Server Error during Instagram sync" }, { status: 500 });
  }
}
