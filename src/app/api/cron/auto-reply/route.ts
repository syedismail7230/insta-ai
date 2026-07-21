import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export const dynamic = "force-dynamic";
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

    // Detect whether token is Instagram Graph API token (starts with IGAG) or Facebook Page Access Token
    const isIgToken = token.startsWith("IGAG");
    const baseDomain = isIgToken ? "graph.instagram.com" : "graph.facebook.com";

    console.log(`⏰ 24/7 Autonomous Cron Job: Fetching via ${baseDomain}...`);

    // Fetch active Page/User details dynamically to filter out self from participants
    let myId = "";
    let myUsername = "";
    try {
      const meRes = await fetch(`https://${baseDomain}/v21.0/me?fields=id,username&access_token=${token}`);
      const meData = await meRes.json();
      myId = meData.id || "";
      myUsername = meData.username || "";
    } catch (err) {
      console.error("Failed to fetch /me details:", err);
    }

    const myUsernames = new Set(["zawr_industries", myUsername?.toLowerCase()].filter(Boolean));
    const myIds = new Set(["17841413970700607", "27796712339961368", myId].filter(Boolean));

    // 1. Fetch recent threads (increased limit to 30 to process all unread chats)
    const url = `https://${baseDomain}/v21.0/me/conversations?platform=instagram&limit=30&access_token=${token}`;
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
      const detailUrl = `https://${baseDomain}/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`;
      const detailRes = await fetch(detailUrl);
      const detail = await detailRes.json();

      const participants = detail.participants?.data || [];
      const customerParticipant = participants.find((p: any) => {
        const usernameLower = p.username?.toLowerCase();
        return !myUsernames.has(usernameLower) && !myIds.has(p.id);
      }) || participants[0];

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

      const latestMsg = msgList[0];
      const isFromCustomer = latestMsg.from?.id === instagramId || latestMsg.from?.username === username;

      if (isFromCustomer && latestMsg.message) {
        const msgId = `msg_${latestMsg.id}`;

        // Stage 1: Log incoming message if not already present in the database
        const existingMsg = await db.select().from(messages).where(eq(messages.id, msgId));
        if (existingMsg.length === 0) {
          await db.insert(messages).values({
            id: msgId,
            conversationId: convId,
            senderType: "customer",
            senderId: instagramId,
            content: latestMsg.message,
            createdAt: new Date(latestMsg.created_time),
          });
        }

        // Stage 2: Check if the latest message logged in the database is from the customer (unreplied)
        const lastDbMsgs = await db.select().from(messages)
          .where(eq(messages.conversationId, convId))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const isLastMsgFromCustomer = lastDbMsgs.length === 0 || lastDbMsgs[0]?.senderType === "customer";

        if (isLastMsgFromCustomer) {
          // Execute AI Engine
          console.log(`🤖 24/7 Auto-Replying to @${username}: "${latestMsg.message}"`);
          const aiResult = await processCustomerDM(latestMsg.message, {
            name: customer.fullName || customer.username || undefined,
            budget: customer.budget || undefined,
            timeline: customer.timeline || undefined,
            stage: customer.stage,
          });

          // Update Customer Memory & Lead Score from AI extracted memory
          if (aiResult.extractedMemory) {
            const memory = aiResult.extractedMemory as NonNullable<typeof aiResult.extractedMemory>;
            const updateData: any = {};
            if (memory.budget) updateData.budget = memory.budget;
            if (memory.timeline) updateData.timeline = memory.timeline;
            if (memory.requirements) updateData.requirements = memory.requirements;
            if (memory.email) updateData.email = memory.email;
            if (memory.phone) updateData.phone = memory.phone;

            // Auto boost lead score if budget/timeline captured
            if (updateData.budget || updateData.timeline) {
              updateData.leadScore = Math.min(100, (customer.leadScore || 20) + 30);
              updateData.stage = "qualified";
            }

            if (Object.keys(updateData).length > 0) {
              await db.update(customers).set(updateData).where(eq(customers.id, customer.id));
            }
          }

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
      } else if (!isFromCustomer) {
        // AI Follow-up Engine
        const lastMsgTime = new Date(latestMsg.created_time).getTime();
        const hoursPassed = (Date.now() - lastMsgTime) / (1000 * 60 * 60);

        // Follow up if last message was sent between 2 hours ago and 6 days ago (within HUMAN_AGENT tag window)
        if (hoursPassed >= 2 && hoursPassed <= 144) {
          const secondMsg = msgList[1];
          const isSecondMsgFromCustomer = secondMsg && (secondMsg.from?.id === instagramId || secondMsg.from?.username === username);

          // Only follow up if the last message was from AI and the one before was from the customer (prevents double follow-up)
          if (isSecondMsgFromCustomer) {
            console.log(`✉️ Generating 24/7 AI Follow-up DM for @${username}...`);
            const followUpPrompt = `System follow-up trigger: The customer @${username} has not responded to our last message. Please generate a concise, polite follow-up DM (max 2 sentences) checking if they have any questions or need help with custom software or AI solutions.`;
            const aiResult = await processCustomerDM(followUpPrompt, {
              name: customer.fullName || customer.username || undefined,
              budget: customer.budget || undefined,
              timeline: customer.timeline || undefined,
              stage: customer.stage,
            });

            if (aiResult.answer) {
              const sent = await sendInstagramDM(instagramId, aiResult.answer);
              if (sent) {
                await db.insert(messages).values({
                  id: `msg_followup_${Date.now()}`,
                  conversationId: convId,
                  senderType: "ai",
                  senderId: "zawr_ai",
                  content: aiResult.answer,
                });
                autoRepliedCount++;
              }
            }
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
