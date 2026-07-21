import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(aiSettings).where(eq(aiSettings.id, "default"));
    if (list.length === 0) {
      const [newSettings] = await db
        .insert(aiSettings)
        .values({
          id: "default",
          agentName: "Zawr AI Assistant",
          systemPrompt: "You are the executive AI Sales Representative for Zawr Industries.",
          tone: "consultative",
          activeProvider: "gemini",
          fallbackMessage: "Thanks for reaching out to Zawr Industries! That's a specialized technical query—let me double-check the exact specifications with our senior solution architect and get right back to you here in DM!",
        })
        .returning();
      return NextResponse.json(newSettings);
    }
    return NextResponse.json(list[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch AI Settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      agentName,
      systemPrompt,
      tone,
      activeProvider,
      geminiModel,
      groqModel,
      openaiModel,
      openrouterModel,
      fallbackMessage,
      geminiApiKey,
      groqApiKey,
    } = body;

    const [updated] = await db
      .insert(aiSettings)
      .values({
        id: "default",
        agentName: agentName || "Zawr AI Assistant",
        systemPrompt: systemPrompt || "You are the executive AI Sales Representative for Zawr Industries.",
        tone: tone || "consultative",
        activeProvider: activeProvider || "gemini",
        geminiModel: geminiModel || "gemini-1.5-flash",
        groqModel: groqModel || "llama-3.3-70b-versatile",
        openaiModel: openaiModel || "gpt-4o-mini",
        openrouterModel: openrouterModel || "anthropic/claude-3.5-haiku",
        fallbackMessage: fallbackMessage || "Thanks for reaching out! Let me check with our specialized engineering team at Zawr Industries and get right back to you shortly.",
        geminiApiKey: geminiApiKey || null,
        groqApiKey: groqApiKey || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiSettings.id,
        set: {
          agentName,
          systemPrompt,
          tone,
          activeProvider,
          geminiModel,
          groqModel,
          openaiModel,
          openrouterModel,
          fallbackMessage,
          geminiApiKey,
          groqApiKey,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating AI Settings:", error);
    return NextResponse.json({ error: "Failed to update AI Settings" }, { status: 500 });
  }
}
