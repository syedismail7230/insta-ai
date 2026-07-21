async function testLiveWebhook() {
  console.log("Testing live Vercel Webhook endpoint https://insta-ai-lime.vercel.app/api/webhooks/instagram ...");

  const payload = {
    object: "instagram",
    entry: [
      {
        id: "17841413970700607",
        time: Date.now(),
        messaging: [
          {
            sender: { id: "4469044433164710" },
            recipient: { id: "17841413970700607" },
            timestamp: Date.now(),
            message: {
              mid: `mid_${Date.now()}`,
              text: "What are your pricing plans?"
            }
          }
        ]
      }
    ]
  };

  const res = await fetch("https://insta-ai-lime.vercel.app/api/webhooks/instagram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  console.log(`HTTP Status: ${res.status}`);
  console.log("Live Vercel Webhook Response:", JSON.stringify(data, null, 2));
}

testLiveWebhook();
