import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendInstagramDM } from "@/lib/channels/instagram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, text } = body;

    if (!customerId || !text) {
      return NextResponse.json({ error: "Missing customerId or text" }, { status: 400 });
    }

    const custRows = await db.select().from(customers).where(eq(customers.id, customerId));
    const customer = custRows[0];
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 1. Send DM on Instagram
    const sent = await sendInstagramDM(customer.instagramId, text);

    // 2. Record message in DB
    const convRows = await db.select().from(conversations).where(eq(conversations.customerId, customerId));
    let conv = convRows[0];
    if (!conv) {
      const [newConv] = await db.insert(conversations).values({
        id: `conv_${Date.now()}`,
        customerId,
        channel: "instagram",
        status: "active",
        lastMessage: text,
      }).returning();
      conv = newConv;
    } else {
      await db.update(conversations).set({ lastMessage: text, updatedAt: new Date() }).where(eq(conversations.id, conv.id));
    }

    const [msg] = await db.insert(messages).values({
      id: `msg_human_${Date.now()}`,
      conversationId: conv.id,
      senderType: "human",
      senderId: "admin",
      content: text,
    }).returning();

    return NextResponse.json({ success: true, message: msg, instagramSent: sent });
  } catch (error) {
    console.error("Error sending manual message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
