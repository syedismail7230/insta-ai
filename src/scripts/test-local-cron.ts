async function testLocalCron() {
  console.log("Triggering local dev server cron endpoint http://localhost:3000/api/cron/auto-reply ...");
  try {
    const res = await fetch("http://localhost:3000/api/cron/auto-reply");
    const data = await res.json();
    console.log("Local Cron Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Local cron call failed. Ensure npm run dev is running locally:", err);
  }
}

testLocalCron();
