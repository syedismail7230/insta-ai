async function testLiveCron() {
  console.log("Triggering live Vercel cron endpoint https://insta-ai-lime.vercel.app/api/cron/auto-reply ...");

  const res = await fetch("https://insta-ai-lime.vercel.app/api/cron/auto-reply");
  const text = await res.text();

  console.log(`HTTP Status: ${res.status}`);
  console.log("Live Vercel Cron Response:", text);
}

testLiveCron();
