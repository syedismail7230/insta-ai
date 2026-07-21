export interface AIResponse {
  answer: string;
  isAnsweredFromKb: boolean;
  confidence: number; // 0 to 1
  suggestedAction?: 'send_reply' | 'escalate_pending_question' | 'book_call';
  extractedMemory?: {
    budget?: string;
    timeline?: string;
    requirements?: string;
    email?: string;
    phone?: string;
  };
}

export interface KBItem {
  id: string;
  category: string;
  title: string;
  question: string;
  answer: string;
  tags?: string | null;
}

export function buildSystemPrompt(
  agentName: string,
  tone: string,
  baseSystemPrompt: string,
  kbItems: KBItem[],
  linksList: Array<{ title: string; url: string; category: string }>,
  customerContext?: { name?: string; budget?: string; timeline?: string; stage?: string }
): string {
  const kbContext = kbItems
    .map((item, index) => `[KB #${index + 1}] Category: ${item.category}\nQ: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");

  const linksContext = linksList
    .map((link) => `- ${link.title} (${link.category}): ${link.url}`)
    .join("\n");

  return `${baseSystemPrompt}

AGENT IDENTITY & PERSONALITY:
- Agent Name: ${agentName}
- Tone of Voice: ${tone} (Be professional, clear, empathetic, high-contrast, and concise for Instagram DMs).

OFFICIAL KNOWLEDGE BASE CONTEXT (STRICT TRUTH SOURCE):
${kbContext || "No knowledge base entries loaded."}

OFFICIAL VERIFIED LINKS (Use only these links when recommending calls, pricing, or portfolios):
${linksContext || "No links configured."}

CUSTOMER MEMORY / CONTEXT:
${customerContext ? `- Name: ${customerContext.name || 'Unknown'}\n- Budget: ${customerContext.budget || 'Not specified yet'}\n- Timeline: ${customerContext.timeline || 'Not specified yet'}\n- Sales Stage: ${customerContext.stage || 'Lead'}` : "First-time incoming customer."}

CRITICAL RULES & ZERO-HALLUCINATION GUARDRAILS:
1. You represent Zawr Industries on Instagram DMs.
2. Rely ONLY on the Knowledge Base above for facts, pricing, timelines, and services offered.
3. If an incoming user query CANNOT be answered with 100% certainty from the Knowledge Base, reply with a status flag indicating UNKNOWN, and do NOT fabricate facts, pricing, or commitments.
4. Output your final response in strict JSON format:
{
  "answer": "<The text message to send on Instagram DM>",
  "isAnsweredFromKb": <true if fully answered from KB, false if unknown/uncertain>,
  "confidence": <number between 0.0 and 1.0>,
  "suggestedAction": "<send_reply | escalate_pending_question | book_call>",
  "extractedMemory": {
    "budget": "<extracted budget if mentioned in DM, or null>",
    "timeline": "<extracted timeline if mentioned, or null>",
    "requirements": "<summary of software/AI project requirements if mentioned, or null>",
    "email": "<extracted email if mentioned, or null>",
    "phone": "<extracted phone if mentioned, or null>"
  }
}`;
}
