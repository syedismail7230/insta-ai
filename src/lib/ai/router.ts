import { db } from "@/db";
import { aiSettings, knowledgeBase, links } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateGeminiResponse } from "./gemini";
import { generateGroqResponse } from "./groq";
import { generateOpenAIResponse } from "./openai";
import { generateOpenRouterResponse } from "./openrouter";
import { AIResponse } from "./provider";

export async function processCustomerDM(
  userQuery: string,
  customerContext?: { name?: string; budget?: string; timeline?: string; stage?: string }
): Promise<AIResponse> {
  // 1. Fetch AI Settings
  const settingsRows = await db.select().from(aiSettings).where(eq(aiSettings.id, "default"));
  const settings = settingsRows[0] || {
    agentName: "Zawr AI Assistant",
    systemPrompt: "You are the executive AI Sales Representative for Zawr Industries.",
    tone: "consultative",
    activeProvider: "groq",
    geminiModel: "gemini-2.0-flash",
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o-mini",
    openrouterModel: "anthropic/claude-3.5-haiku",
    fallbackMessage: "Thanks for reaching out to Zawr Industries! That's a specialized technical query—let me double-check the exact specifications with our senior solution architect and get right back to you here in DM!",
  };

  // 2. Fetch Active Knowledge Base items
  const allKbRows = await db.select().from(knowledgeBase).where(eq(knowledgeBase.isActive, true));

  // Dynamic keyword relevance matching to reduce token bloat on LLM requests
  let kbRows = allKbRows;
  if (allKbRows.length > 5) {
    const queryTokens = userQuery.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const scoredKbRows = allKbRows.map(item => {
      let score = 0;
      const content = `${item.question} ${item.answer} ${item.tags || ""}`.toLowerCase();
      for (const token of queryTokens) {
        if (content.includes(token)) {
          score += 2;
        }
      }
      return { item, score };
    });

    // Take top 5 most relevant entries, fallback to first 5 if no score matches
    kbRows = scoredKbRows
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(x => x.item);
  }

  // 3. Fetch Active Links
  const linkRows = await db.select().from(links);

  const provider = settings.activeProvider.toLowerCase();
  console.log(`🤖 Processing DM with AI Provider: ${provider}`);

  const groqKey = settings.groqApiKey || process.env.GROQ_API_KEY;
  const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;

  try {
    if (provider === "groq" && groqKey) {
      return await generateGroqResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        settings.groqModel,
        customerContext,
        groqKey
      );
    }

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      return await generateOpenAIResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        settings.openaiModel,
        customerContext
      );
    }

    if (provider === "openrouter" && process.env.OPENROUTER_API_KEY) {
      return await generateOpenRouterResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        settings.openrouterModel,
        customerContext
      );
    }

    // Default: Try Gemini
    if (geminiKey) {
      return await generateGeminiResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        customerContext,
        geminiKey
      );
    }

    // High-speed fallback to Groq if key exists
    if (groqKey) {
      return await generateGroqResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        settings.groqModel,
        customerContext,
        groqKey
      );
    }

    throw new Error("No AI API Key available");
  } catch (error) {
    console.error(`⚠️ Error with AI provider ${provider}, executing high-performance Groq fallback:`, error);
    if (groqKey) {
      try {
        return await generateGroqResponse(
          userQuery,
          settings.agentName,
          settings.tone,
          settings.systemPrompt,
          kbRows,
          linkRows,
          "llama-3.3-70b-versatile",
          customerContext,
          groqKey
        );
      } catch (groqError) {
        console.error("❌ Groq fallback failed:", groqError);
      }
    }

    return {
      answer: settings.fallbackMessage,
      isAnsweredFromKb: false,
      confidence: 0,
      suggestedAction: "escalate_pending_question"
    };
  }
}
