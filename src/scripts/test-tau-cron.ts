async function testTauCron() {
  console.log("Triggering live Vercel tau alias: https://insta-ai-lime-tau.vercel.app/api/cron/auto-reply ...");
  const res = await fetch("https://insta-ai-lime-tau.vercel.app/api/cron/auto-reply");
  const data = await res.json();
  console.log("Live Cron Response:", JSON.stringify(data, null, 2));
}

testTauCron();
