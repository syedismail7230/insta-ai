import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.5-flash",
    "gemini-1.5-pro"
  ];

  for (const m of modelsToTest) {
    console.log(`Testing model: ${m}...`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello" }] }]
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ SUCCESS for model ${m}! Response:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
        break;
      } else {
        console.log(`❌ FAILED for model ${m}:`, data.error?.message);
      }
    } catch (err) {
      console.log(`❌ Error for ${m}:`, err);
    }
  }
}

testModels();
