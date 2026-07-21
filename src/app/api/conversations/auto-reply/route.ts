import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages, pendingQuestions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { processCustomerDM } from "@/lib/ai/router";
import { sendInstagramDM } from "@/lib/channels/instagram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    // 1. Fetch Customer Record
    const custRows = await db.select().from(customers).where(eq(customers.id, customerId));
    const customer = custRows[0];
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 2. Fetch Conversation
    const convRows = await db.select().from(conversations).where(eq(conversations.customerId, customerId));
    const conv = convRows[0];
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // 3. Fetch Latest Customer Message
    const msgList = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(desc(messages.createdAt))
      .limit(10);

    const latestCustomerMsg = msgList.find((m) => m.senderType === "customer") || msgList[0];
    const queryText = latestCustomerMsg ? latestCustomerMsg.content : "Hello";

    console.log(`🤖 Triggering Manual AI Auto-Reply for customer @${customer.username}: "${queryText}"`);

    // 4. Execute AI Engine
    const aiResult = await processCustomerDM(queryText, {
      name: customer.fullName || customer.username || undefined,
      budget: customer.budget || undefined,
      timeline: customer.timeline || undefined,
      stage: customer.stage,
    });

    // 5. Send DM to Instagram
    const sent = await sendInstagramDM(customer.instagramId, aiResult.answer);

    // 6. Record AI Message in DB
    const [insertedMsg] = await db.insert(messages).values({
      id: `msg_ai_manual_${Date.now()}`,
      conversationId: conv.id,
      senderType: "ai",
      senderId: "zawr_ai",
      content: aiResult.answer,
    }).returning();

    // 7. If off-KB, add to pending_questions queue
    if (!aiResult.isAnsweredFromKb) {
      await db.insert(pendingQuestions).values({
        id: `pq_auto_${Date.now()}`,
        customerId: customer.id,
        question: queryText,
        context: `Triggered AI reply for query: "${queryText}"`,
        suggestedAnswer: aiResult.answer,
        status: "pending",
      }).onConflictDoNothing();
    }

    return NextResponse.json({
      success: true,
      sent,
      aiAnswer: aiResult.answer,
      confidence: aiResult.confidence,
      isAnsweredFromKb: aiResult.isAnsweredFromKb,
      messageRecord: insertedMsg,
    });
  } catch (error) {
    console.error("Error triggering AI auto-reply:", error);
    return NextResponse.json({ error: "Failed to process AI auto-reply" }, { status: 500 });
  }
}
