import { KBItem, buildSystemPrompt } from "./provider";

export async function generateOpenRouterResponse(
  userQuery: string,
  agentName: string,
  tone: string,
  systemPrompt: string,
  kbItems: KBItem[],
  linksList: Array<{ title: string; url: string; category: string }>,
  modelName: string = "anthropic/claude-3.5-haiku",
  customerContext?: any
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is missing.");
  }

  const prompt = buildSystemPrompt(agentName, tone, systemPrompt, kbItems, linksList, customerContext);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://ai-social-media-nine.vercel.app",
      "X-Title": "Zawr Industries Instagram Sales Agent",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userQuery }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("OpenRouter API Error:", errorText);
    throw new Error(`OpenRouter API call failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content || "{}");
}
