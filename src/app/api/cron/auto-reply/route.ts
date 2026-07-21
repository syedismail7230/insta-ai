import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages, pendingQuestions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { processCustomerDM } from "@/lib/ai/router";
import { sendInstagramDM } from "@/lib/channels/instagram";

// 24/7 Autonomous Background Auto-Reply Processor
export async function GET(req: NextRequest) {
  try {
    const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "INSTAGRAM_PAGE_ACCESS_TOKEN missing" }, { status: 400 });
    }

    console.log("⏰ 24/7 Autonomous Cron Job: Syncing & Auto-Replying to pending Instagram DMs...");

    // 1. Fetch recent threads from Meta Graph API
    const url = `https://graph.facebook.com/v21.0/me/conversations?platform=instagram&limit=5&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("Cron Meta Sync error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const convList = data.data || [];
    let autoRepliedCount = 0;
    let pendingCount = 0;

    for (const thread of convList) {
      const threadId = thread.id;
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
      let customer = existingCust[0];

      if (!customer) {
        const custId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const [inserted] = await db.insert(customers).values({
          id: custId,
          instagramId,
          username,
          fullName,
          leadScore: 50,
          stage: "lead",
          isHumanTakeover: false,
        }).returning();
        customer = inserted;
      }

      // Check Human Takeover
      if (customer.isHumanTakeover) {
        console.log(`⏸️ Human Takeover enabled for @${username}. Skipping 24/7 AI auto-reply.`);
        continue;
      }

      // Upsert Conversation
      let existingConv = await db.select().from(conversations).where(eq(conversations.customerId, customer.id));
      let convId = existingConv[0]?.id;

      if (!convId) {
        convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.insert(conversations).values({
          id: convId,
          customerId: customer.id,
          channel: "instagram",
          status: "active",
          lastMessage: "Instagram DM Thread",
        });
      }

      // Ingest & check latest customer message
      const msgList = detail.messages?.data || [];
      if (msgList.length === 0) continue;

      const latestMsg = msgList[0]; // Most recent message
      const isFromCustomer = latestMsg.from?.id === instagramId || latestMsg.from?.username === username;

      // If the latest message in thread is from the customer and has NOT been replied to yet
      if (isFromCustomer && latestMsg.message) {
        const msgId = `msg_${latestMsg.id}`;

        // Check if we already logged & replied to this message ID
        const existingMsg = await db.select().from(messages).where(eq(messages.id, msgId));
        if (existingMsg.length === 0) {
          // Log incoming message
          await db.insert(messages).values({
            id: msgId,
            conversationId: convId,
            senderType: "customer",
            senderId: instagramId,
            content: latestMsg.message,
            createdAt: new Date(latestMsg.created_time),
          });

          // Execute 24/7 Autonomous AI Engine
          console.log(`🤖 24/7 Auto-Replying to @${username}: "${latestMsg.message}"`);
          const aiResult = await processCustomerDM(latestMsg.message, {
            name: customer.fullName || customer.username || undefined,
            budget: customer.budget || undefined,
            timeline: customer.timeline || undefined,
            stage: customer.stage,
          });

          if (aiResult.isAnsweredFromKb && aiResult.confidence >= 0.6) {
            // Auto-reply on Instagram
            await sendInstagramDM(instagramId, aiResult.answer);

            // Log AI response
            await db.insert(messages).values({
              id: `msg_ai_cron_${Date.now()}`,
              conversationId: convId,
              senderType: "ai",
              senderId: "zawr_ai",
              content: aiResult.answer,
            });

            autoRepliedCount++;
          } else {
            // Unclear / Off-KB query: Escalate to Pending Questions
            console.log(`❓ Query unclear for @${username}. Escalating to Pending Questions Queue.`);

            await db.insert(pendingQuestions).values({
              id: `pq_cron_${Date.now()}`,
              customerId: customer.id,
              question: latestMsg.message,
              context: `24/7 Autonomous Agent encountered off-KB query from @${username}`,
              suggestedAnswer: aiResult.answer || "Technical response required.",
              status: "pending",
            }).onConflictDoNothing();

            pendingCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      autoRepliedCount,
      pendingCount,
      message: `24/7 Background Cron completed: ${autoRepliedCount} DM(s) auto-replied, ${pendingCount} escalated to Pending Questions.`
    });
  } catch (error) {
    console.error("24/7 Cron Auto-Reply error:", error);
    return NextResponse.json({ error: "Internal Server Error in 24/7 Cron" }, { status: 500 });
  }
}
