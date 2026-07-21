import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, conversations, customers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET: Fetch real-time message stream for a customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId parameter" }, { status: 400 });
    }

    // 1. Find conversation for customer
    const convRows = await db.select().from(conversations).where(eq(conversations.customerId, customerId));
    const conv = convRows[0];

    if (!conv) {
      return NextResponse.json([]);
    }

    // 2. Fetch real messages from Neon PostgreSQL
    const msgList = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderType: messages.senderType,
        senderId: messages.senderId,
        content: messages.content,
        metadata: messages.metadata,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conv.id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json(msgList);
  } catch (error) {
    console.error("Error fetching real-time messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
