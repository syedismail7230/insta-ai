import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { knowledgeBase } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const items = await db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching Knowledge Base:", error);
    return NextResponse.json({ error: "Failed to fetch Knowledge Base" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, question, answer, category, tags, isActive } = body;

    if (!title || !question || !answer) {
      return NextResponse.json({ error: "Missing required fields (title, question, answer)" }, { status: 400 });
    }

    if (id) {
      // Update
      const [updated] = await db
        .update(knowledgeBase)
        .set({
          title,
          question,
          answer,
          category: category || "general",
          tags,
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
        })
        .where(eq(knowledgeBase.id, id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create
      const newId = `kb_${Date.now()}`;
      const [created] = await db
        .insert(knowledgeBase)
        .values({
          id: newId,
          title,
          question,
          answer,
          category: category || "general",
          tags,
          isActive: true,
        })
        .returning();

      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Error saving Knowledge Base item:", error);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
