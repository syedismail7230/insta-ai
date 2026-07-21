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
    activeProvider: "gemini",
    geminiModel: "gemini-1.5-flash",
    groqModel: "llama-3.3-70b-versatile",
    openaiModel: "gpt-4o-mini",
    openrouterModel: "anthropic/claude-3.5-haiku",
    fallbackMessage: "Thanks for reaching out to Zawr Industries! That's a specialized technical query—let me double-check the exact specifications with our technical team and get right back to you!",
  };

  // 2. Fetch Active Knowledge Base items
  const kbRows = await db.select().from(knowledgeBase).where(eq(knowledgeBase.isActive, true));

  // 3. Fetch Active Links
  const linkRows = await db.select().from(links);

  const provider = settings.activeProvider.toLowerCase();
  console.log(`🤖 Processing DM with AI Provider: ${provider}`);

  try {
    if (provider === "groq" && process.env.GROQ_API_KEY) {
      return await generateGroqResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        settings.groqModel,
        customerContext
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

    // Default to Gemini (Free)
    return await generateGeminiResponse(
      userQuery,
      settings.agentName,
      settings.tone,
      settings.systemPrompt,
      kbRows,
      linkRows,
      customerContext
    );
  } catch (error) {
    console.error(`⚠️ Error with AI provider ${provider}, falling back to Gemini:`, error);
    // Fallback to Gemini if alternative provider fails
    try {
      return await generateGeminiResponse(
        userQuery,
        settings.agentName,
        settings.tone,
        settings.systemPrompt,
        kbRows,
        linkRows,
        customerContext
      );
    } catch (fallbackError) {
      console.error("❌ Both Primary and Fallback AI providers failed:", fallbackError);
      return {
        answer: settings.fallbackMessage,
        isAnsweredFromKb: false,
        confidence: 0,
        suggestedAction: "escalate_pending_question"
      };
    }
  }
}
