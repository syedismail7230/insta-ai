import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, conversations, messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(customers).orderBy(desc(customers.lastContactAt));
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isHumanTakeover, stage, leadScore, budget, timeline, notes } = body;

    if (!id) return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });

    const updateData: any = {};
    if (isHumanTakeover !== undefined) updateData.isHumanTakeover = isHumanTakeover;
    if (stage !== undefined) updateData.stage = stage;
    if (leadScore !== undefined) updateData.leadScore = leadScore;
    if (budget !== undefined) updateData.budget = budget;
    if (timeline !== undefined) updateData.timeline = timeline;
    if (notes !== undefined) updateData.notes = notes;

    const [updated] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
