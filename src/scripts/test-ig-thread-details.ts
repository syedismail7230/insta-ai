async function testIgThreadDetails() {
  const token = "IGAGHgyr7f7FZABZAGI2aWFmM3dELUV1bzJzNHRRMHZAGRTYxWHZAPalZAXeHZA5RS1DanM0UWIzUEpkOEVHY1UwUTc2YUY1Y244UktIYTBVZAGxCR3ZAGeDNKalEtby1KWlFjbHVsUXBXMnZAGMF9nU1NucGFrM0N3TWpBWHRpV004R3JfNAZDZD";
  const threadId = "aWdfZAG06MzQwMjgyMzY2ODQxNzEwMzAxMjQ0MjU5NDkzOTc1ODY0MTk5ODA0";
  
  console.log(`Fetching full detail for thread ${threadId}...`);
  const url = `https://graph.instagram.com/v21.0/${threadId}?fields=participants,messages{id,message,created_time,from}&access_token=${token}`;
  const res = await fetch(url);
  console.log("Full Thread Detail:", JSON.stringify(await res.json(), null, 2));
}
testIgThreadDetails();
