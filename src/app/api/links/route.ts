import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(links).orderBy(desc(links.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, url, shortCode, category, description } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const sc = shortCode || title.toLowerCase().replace(/[^a-z0-9]/g, "-");

    if (id) {
      const [updated] = await db
        .update(links)
        .set({ title, url, shortCode: sc, category: category || "general", description })
        .where(eq(links.id, id))
        .returning();
      return NextResponse.json(updated);
    } else {
      const [created] = await db
        .insert(links)
        .values({
          id: `link_${Date.now()}`,
          title,
          url,
          shortCode: sc,
          category: category || "general",
          description,
          clicks: 0,
        })
        .returning();
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to save link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.delete(links).where(eq(links.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
