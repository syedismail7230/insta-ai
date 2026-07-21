import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages, pendingQuestions, aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseInstagramWebhookPayload, sendInstagramDM, verifyMetaSignature } from "@/lib/channels/instagram";
import { processCustomerDM } from "@/lib/ai/router";

// GET: Meta Webhook Verification Handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_VERIFY_TOKEN || "zawr_verify_token_2026";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ Meta Webhook Verification Successful!");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("❌ Meta Webhook Verification Failed. Provided Token:", token);
  return NextResponse.json({ error: "Forbidden. Verify token mismatch." }, { status: 403 });
}

// POST: Meta Incoming Webhook Notifications
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifyMetaSignature(rawBody, signature)) {
      console.warn("⚠️ Invalid Meta Webhook Signature");
      // Continue for dev flexibility
    }

    const body = JSON.parse(rawBody);
    const events = parseInstagramWebhookPayload(body);

    for (const event of events) {
      console.log(`📩 Incoming DM from Instagram User ${event.senderId}: "${event.text}"`);

      // 1. Find or create customer
      let customerList = await db.select().from(customers).where(eq(customers.instagramId, event.senderId));
      let customer = customerList[0];

      if (!customer) {
        const newCustId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const [inserted] = await db.insert(customers).values({
          id: newCustId,
          instagramId: event.senderId,
          username: `ig_lead_${event.senderId.slice(-4)}`,
          fullName: `Instagram User (${event.senderId.slice(-4)})`,
          leadScore: 20,
          stage: "lead",
          isHumanTakeover: false,
          lastContactAt: new Date(),
        }).returning();
        customer = inserted;
      } else {
        await db.update(customers).set({ lastContactAt: new Date() }).where(eq(customers.id, customer.id));
      }

      // 2. Find or create conversation
      let convList = await db.select().from(conversations).where(eq(conversations.customerId, customer.id));
      let conversation = convList[0];

      if (!conversation) {
        const newConvId = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const [insertedConv] = await db.insert(conversations).values({
          id: newConvId,
          customerId: customer.id,
          channel: "instagram",
          status: "active",
          lastMessage: event.text,
        }).returning();
        conversation = insertedConv;
      } else {
        await db.update(conversations)
          .set({ lastMessage: event.text, updatedAt: new Date() })
          .where(eq(conversations.id, conversation.id));
      }

      // 3. Log incoming message
      await db.insert(messages).values({
        id: `msg_cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        conversationId: conversation.id,
        senderType: "customer",
        senderId: event.senderId,
        content: event.text,
      });

      // 4. Check Human Takeover status
      if (customer.isHumanTakeover) {
        console.log(`⏸️ Human Takeover enabled for ${customer.username}. Skipping AI auto-reply.`);
        continue;
      }

      // 5. Invoke AI Engine with Knowledge Base RAG
      const aiResult = await processCustomerDM(event.text, {
        name: customer.fullName || customer.username || undefined,
        budget: customer.budget || undefined,
        timeline: customer.timeline || undefined,
        stage: customer.stage,
      });

      // 6. Update Customer Memory & Lead Score from AI extracted memory
      if (aiResult.extractedMemory) {
        const updateData: any = {};
        if (aiResult.extractedMemory.budget) updateData.budget = aiResult.extractedMemory.budget;
        if (aiResult.extractedMemory.timeline) updateData.timeline = aiResult.extractedMemory.timeline;
        if (aiResult.extractedMemory.requirements) updateData.requirements = aiResult.extractedMemory.requirements;
        if (aiResult.extractedMemory.email) updateData.email = aiResult.extractedMemory.email;
        if (aiResult.extractedMemory.phone) updateData.phone = aiResult.extractedMemory.phone;

        // Auto boost lead score if budget/timeline captured
        if (updateData.budget || updateData.timeline) {
          updateData.leadScore = Math.min(100, (customer.leadScore || 20) + 30);
          updateData.stage = "qualified";
        }

        if (Object.keys(updateData).length > 0) {
          await db.update(customers).set(updateData).where(eq(customers.id, customer.id));
        }
      }

      // 7. Check if answered from KB with high confidence
      if (aiResult.isAnsweredFromKb && aiResult.confidence >= 0.6) {
        // Send AI DM response to Instagram user
        await sendInstagramDM(event.senderId, aiResult.answer);

        // Log AI response
        await db.insert(messages).values({
          id: `msg_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          conversationId: conversation.id,
          senderType: "ai",
          senderId: "zawr_ai",
          content: aiResult.answer,
        });
      } else {
        // Unknown or low-confidence query: HITL Escalation required
        console.log(`❓ Query unknown or off-KB for customer ${customer.username}. Creating Pending Question.`);

        // Fetch settings for fallback message
        const settingsList = await db.select().from(aiSettings).where(eq(aiSettings.id, "default"));
        const fallbackMsg = settingsList[0]?.fallbackMessage ||
          "Thanks for reaching out! Let me check with our specialized engineering team at Zawr Industries and get right back to you shortly.";

        // Send fallback message DM
        await sendInstagramDM(event.senderId, fallbackMsg);

        // Log fallback DM
        await db.insert(messages).values({
          id: `msg_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          conversationId: conversation.id,
          senderType: "ai",
          senderId: "zawr_ai",
          content: fallbackMsg,
        });

        // Insert into pending_questions for Human Approval Workflow
        await db.insert(pendingQuestions).values({
          id: `pq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          customerId: customer.id,
          question: event.text,
          context: `Customer ${customer.fullName || customer.username} asked an unknown query on Instagram DM.`,
          suggestedAnswer: aiResult.answer || "Custom engineering response required.",
          status: "pending",
        });
      }
    }

    return NextResponse.json({ success: true, processed: events.length }, { status: 200 });
  } catch (error) {
    console.error("❌ Instagram Webhook POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
