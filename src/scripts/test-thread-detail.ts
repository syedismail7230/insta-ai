import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testThreadDetail() {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const threadId = "aWdfZAG06MTpJR01lc3NhZA2VUaHJlYWQ6MTc4NDE0MTM5NzA3MDA2MDc6MzQwMjgyMzY2ODQxNzEwMzAxMjQ0MjU4ODQ2MTE3ODk4MDI5NzE2";

  console.log(`--- Inspecting real Instagram thread (${threadId}) ---`);
  const url = `https://graph.facebook.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  console.log("Thread detail response:", JSON.stringify(data, null, 2));
}

testThreadDetail();
