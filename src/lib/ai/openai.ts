import { KBItem, buildSystemPrompt } from "./provider";

export async function generateOpenAIResponse(
  userQuery: string,
  agentName: string,
  tone: string,
  systemPrompt: string,
  kbItems: KBItem[],
  linksList: Array<{ title: string; url: string; category: string }>,
  modelName: string = "gpt-4o-mini",
  customerContext?: any
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is missing.");
  }

  const prompt = buildSystemPrompt(agentName, tone, systemPrompt, kbItems, linksList, customerContext);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
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
    console.error("OpenAI API Error:", errorText);
    throw new Error(`OpenAI API call failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content || "{}");
}
