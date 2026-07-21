async function checkMainUrl() {
  console.log("Checking main production URL: https://insta-ai-lime.vercel.app/api/cron/auto-reply ...");
  const res = await fetch("https://insta-ai-lime.vercel.app/api/cron/auto-reply");
  console.log("Status Code:", res.status);
  try {
    const data = await res.json();
    console.log("Response JSON:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Response was not JSON. Previewing body content...");
    console.log((await res.text()).slice(0, 500));
  }
}
checkMainUrl();
