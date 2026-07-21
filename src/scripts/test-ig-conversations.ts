async function testIgConversations() {
  const token = "IGAGHgyr7f7FZABZAGI2aWFmM3dELUV1bzJzNHRRMHZAGRTYxWHZAPalZAXeHZA5RS1DanM0UWIzUEpkOEVHY1UwUTc2YUY1Y244UktIYTBVZAGxCR3ZAGeDNKalEtby1KWlFjbHVsUXBXMnZAGMF9nU1NucGFrM0N3TWpBWHRpV004R3JfNAZDZD";
  console.log("Testing conversations endpoint on graph.instagram.com...");
  const res = await fetch(`https://graph.instagram.com/v21.0/me/conversations?access_token=${token}`);
  console.log("Status:", res.status);
  console.log("Response:", await res.json());
}
testIgConversations();
