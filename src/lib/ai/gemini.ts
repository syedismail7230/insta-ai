import { KBItem, buildSystemPrompt } from "./provider";

export async function generateGeminiResponse(
  userQuery: string,
  agentName: string,
  tone: string,
  systemPrompt: string,
  kbItems: KBItem[],
  linksList: Array<{ title: string; url: string; category: string }>,
  customerContext?: { name?: string; budget?: string; timeline?: string; stage?: string }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const prompt = buildSystemPrompt(agentName, tone, systemPrompt, kbItems, linksList, customerContext);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { text: `Incoming Instagram DM from Customer: "${userQuery}"\nRespond in JSON format as specified.` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Gemini API call failed with status ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Failed to parse Gemini JSON output:", text);
    return {
      answer: text,
      isAnsweredFromKb: false,
      confidence: 0.5,
      suggestedAction: "escalate_pending_question"
    };
  }
}
