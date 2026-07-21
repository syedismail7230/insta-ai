async function testLiveSync() {
  console.log("Triggering live Vercel sync endpoint https://insta-ai-lime.vercel.app/api/conversations/sync ...");

  const res = await fetch("https://insta-ai-lime.vercel.app/api/conversations/sync", {
    method: "POST"
  });
  const data = await res.json();

  console.log(`HTTP Status: ${res.status}`);
  console.log("Live Vercel Sync Response:", JSON.stringify(data, null, 2));
}

testLiveSync();
