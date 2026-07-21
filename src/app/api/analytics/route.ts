import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages, knowledgeBase, pendingQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allCustomers = await db.select().from(customers);
    const allMessages = await db.select().from(messages);
    const allPqs = await db.select().from(pendingQuestions);
    const allKbs = await db.select().from(knowledgeBase);

    const totalCustomers = allCustomers.length;
    const qualifiedLeads = allCustomers.filter((c) => c.stage === "qualified" || c.stage === "proposal" || c.stage === "closed_won" || c.leadScore >= 70).length;
    const closedWonCount = allCustomers.filter((c) => c.stage === "closed_won").length;
    const pendingCount = allPqs.filter((q) => q.status === "pending").length;

    // Real-time Stage Breakdown
    const stageCounts = {
      lead: allCustomers.filter((c) => c.stage === "lead").length,
      qualified: allCustomers.filter((c) => c.stage === "qualified").length,
      proposal: allCustomers.filter((c) => c.stage === "proposal").length,
      closed_won: allCustomers.filter((c) => c.stage === "closed_won").length,
      closed_lost: allCustomers.filter((c) => c.stage === "closed_lost").length,
    };

    const aiMessages = allMessages.filter((m) => m.senderType === "ai").length;
    const totalDMs = allMessages.length;
    const automatedResolutionRate = totalDMs > 0 ? Math.round((aiMessages / totalDMs) * 100) : 100;
    const bookingRate = totalCustomers > 0 ? Math.round((qualifiedLeads / totalCustomers) * 100) : 0;

    return NextResponse.json({
      totalCustomers,
      qualifiedLeads,
      closedWonCount,
      pendingCount,
      totalMessages: totalDMs,
      activeKbCount: allKbs.length,
      automatedResolutionRate,
      bookingRate,
      stageCounts,
    });
  } catch (error) {
    console.error("Error computing real-time analytics:", error);
    return NextResponse.json({ error: "Failed to compute real-time analytics" }, { status: 500 });
  }
}
