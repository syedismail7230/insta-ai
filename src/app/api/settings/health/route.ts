import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(aiSettings).where(eq(aiSettings.id, "default"));
    const settings = list[0] || {};
    
    const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
    const groqKey = settings.groqApiKey || process.env.GROQ_API_KEY;

    const health = {
      gemini: { status: "not_configured", message: "Key not configured. Falling back to env variables." },
      groq: { status: "not_configured", message: "Key not configured. Falling back to env variables." }
    };

    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }]
          }),
          signal: AbortSignal.timeout(5000)
        });
        
        if (res.status === 200) {
          health.gemini = { status: "active", message: "Key is fully active & responsive." };
        } else if (res.status === 429) {
          health.gemini = { status: "rate_limited", message: "Rate limit or 0-quota limit exceeded (429)." };
        } else {
          const body = await res.json().catch(() => ({}));
          health.gemini = { status: "error", message: body?.error?.message || `API returned status ${res.status}` };
        }
      } catch (err: any) {
        health.gemini = { status: "error", message: err.message || "Failed to reach Gemini endpoint." };
      }
    }

    if (groqKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-8b-8192", // Lightweight model for quick test
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (res.status === 200) {
          health.groq = { status: "active", message: "Key is fully active & responsive." };
        } else if (res.status === 429) {
          health.groq = { status: "rate_limited", message: "Daily token / request limit exceeded (429)." };
        } else {
          const body = await res.json().catch(() => ({}));
          health.groq = { status: "error", message: body?.error?.message || `API returned status ${res.status}` };
        }
      } catch (err: any) {
        health.groq = { status: "error", message: err.message || "Failed to reach Groq endpoint." };
      }
    }

    return NextResponse.json({ success: true, health });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
