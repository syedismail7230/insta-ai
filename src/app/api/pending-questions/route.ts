import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingQuestions, knowledgeBase, customers, conversations, messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { sendInstagramDM } from "@/lib/channels/instagram";

// GET: Fetch all pending questions
export async function GET() {
  try {
    const list = await db
      .select({
        id: pendingQuestions.id,
        customerId: pendingQuestions.customerId,
        question: pendingQuestions.question,
        context: pendingQuestions.context,
        suggestedAnswer: pendingQuestions.suggestedAnswer,
        approvedAnswer: pendingQuestions.approvedAnswer,
        status: pendingQuestions.status,
        createdAt: pendingQuestions.createdAt,
        customerName: customers.fullName,
        customerUsername: customers.username,
        instagramId: customers.instagramId,
      })
      .from(pendingQuestions)
      .leftJoin(customers, eq(pendingQuestions.customerId, customers.id))
      .orderBy(desc(pendingQuestions.createdAt));

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching pending questions:", error);
    return NextResponse.json({ error: "Failed to fetch pending questions" }, { status: 500 });
  }
}

// POST: Approve & Send DM + Permanently Learn into Knowledge Base
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, answer, category } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action parameter" }, { status: 400 });
    }

    const pqRows = await db.select().from(pendingQuestions).where(eq(pendingQuestions.id, id));
    const pq = pqRows[0];
    if (!pq) {
      return NextResponse.json({ error: "Pending question not found" }, { status: 404 });
    }

    if (action === "approve") {
      const finalAnswer = answer || pq.suggestedAnswer || "Thank you for reaching out!";

      // 1. Update pending question record
      await db
        .update(pendingQuestions)
        .set({
          status: "approved",
          approvedAnswer: finalAnswer,
          resolvedAt: new Date(),
        })
        .where(eq(pendingQuestions.id, id));

      // 2. Fetch customer details
      const custRows = await db.select().from(customers).where(eq(customers.id, pq.customerId));
      const customer = custRows[0];

      if (customer && customer.instagramId) {
        // Send DM on Instagram
        await sendInstagramDM(customer.instagramId, finalAnswer);

        // Record message in conversation history
        const convRows = await db.select().from(conversations).where(eq(conversations.customerId, customer.id));
        if (convRows[0]) {
          await db.insert(messages).values({
            id: `msg_approved_${Date.now()}`,
            conversationId: convRows[0].id,
            senderType: "human",
            senderId: "admin",
            content: `[Approved Answer] ${finalAnswer}`,
          });
        }
      }

      // 3. PERMANENTLY ingest Q&A into Knowledge Base
      const kbId = `kb_auto_${Date.now()}`;
      await db.insert(knowledgeBase).values({
        id: kbId,
        category: category || "faq",
        title: `Auto-Learned: ${pq.question.slice(0, 40)}...`,
        question: pq.question,
        answer: finalAnswer,
        tags: "auto_learned,pending_question",
        isActive: true,
      });

      console.log(`✅ Approved Pending Question ${id}, sent DM, and permanently saved to Knowledge Base (${kbId})`);

      return NextResponse.json({ success: true, message: "Question approved, DM sent, and saved to Knowledge Base!" });
    } else if (action === "reject") {
      await db
        .update(pendingQuestions)
        .set({
          status: "rejected",
          resolvedAt: new Date(),
        })
        .where(eq(pendingQuestions.id, id));

      return NextResponse.json({ success: true, message: "Question rejected." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating pending question:", error);
    return NextResponse.json({ error: "Failed to update pending question" }, { status: 500 });
  }
}
