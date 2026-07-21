import crypto from "crypto";

export interface InstagramMessageEvent {
  senderId: string;
  recipientId: string;
  timestamp: number;
  messageId: string;
  text: string;
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signatureHeader) return true;

  try {
    const parts = signatureHeader.split("=");
    if (parts.length !== 2 || parts[0] !== "sha256") return false;

    const signature = parts[1];
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export async function sendInstagramDM(recipientId: string, text: string): Promise<boolean> {
  const pageToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!pageToken) {
    console.error("⚠️ INSTAGRAM_PAGE_ACCESS_TOKEN is missing. Cannot send real DM.");
    return false;
  }

  // Attempt 1: Standard Response via /me/messages (Within 24h window)
  const meUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${pageToken}`;
  const payload = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: "RESPONSE"
  };

  try {
    const res = await fetch(meUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Instagram DM sent successfully via /me/messages:", data);
      return true;
    }

    const errJson = await res.json();
    console.warn("⚠️ Standard DM send failed, retrying with HUMAN_AGENT tag:", JSON.stringify(errJson));

    // Attempt 2: Retry with HUMAN_AGENT tag (Applies up to 7 days)
    const humanAgentPayload = {
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "MESSAGE_TAG",
      tag: "HUMAN_AGENT"
    };
    const retryRes = await fetch(meUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(humanAgentPayload)
    });

    if (retryRes.ok) {
      const retryData = await retryRes.json();
      console.log("✅ Instagram DM sent with HUMAN_AGENT tag:", retryData);
      return true;
    }

    // Attempt 3: Retry with ACCOUNT_UPDATE tag
    const accountUpdatePayload = {
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "MESSAGE_TAG",
      tag: "ACCOUNT_UPDATE"
    };
    const tag3Res = await fetch(meUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountUpdatePayload)
    });

    if (tag3Res.ok) {
      const tag3Data = await tag3Res.json();
      console.log("✅ Instagram DM sent with ACCOUNT_UPDATE tag:", tag3Data);
      return true;
    }

    // Attempt 4: Direct Instagram Node Retry (17841413970700607)
    const igNodeUrl = `https://graph.facebook.com/v21.0/17841413970700607/messages?access_token=${pageToken}`;
    const igRes = await fetch(igNodeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (igRes.ok) {
      const igData = await igRes.json();
      console.log("✅ Instagram DM sent via IG Business Node:", igData);
      return true;
    }

    const igErr = await igRes.json();
    console.error("❌ All Instagram DM send attempts failed (Thread older than allowed Meta window):", JSON.stringify(igErr));
    return false;
  } catch (error) {
    console.error("❌ Exception sending Instagram DM:", error);
    return false;
  }
}

export function parseInstagramWebhookPayload(body: Record<string, unknown>): InstagramMessageEvent[] {
  const events: InstagramMessageEvent[] = [];

  if (body.object === "instagram" || body.object === "page") {
    const entries = (body.entry as Array<Record<string, unknown>>) || [];
    entries.forEach((entry) => {
      // 1. Handle messaging array
      const messagingList = entry.messaging as Array<Record<string, unknown>>;
      if (Array.isArray(messagingList)) {
        messagingList.forEach((messagingItem) => {
          const msgObj = messagingItem.message as Record<string, unknown>;
          if (msgObj && typeof msgObj.text === "string" && !msgObj.is_echo) {
            const senderObj = messagingItem.sender as Record<string, unknown>;
            const recipientObj = messagingItem.recipient as Record<string, unknown>;
            const senderId = (senderObj?.id as string) || "unknown_sender";

            if (senderId !== "17841413970700607" && senderId !== "115679509983218") {
              events.push({
                senderId,
                recipientId: (recipientObj?.id as string) || (entry.id as string) || "unknown_recipient",
                timestamp: (messagingItem.timestamp as number) || Date.now(),
                messageId: (msgObj.mid as string) || `mid_${Date.now()}`,
                text: msgObj.text
              });
            }
          }
        });
      }

      // 2. Handle changes array (Instagram Graph API webhook format)
      const changesList = entry.changes as Array<Record<string, unknown>>;
      if (Array.isArray(changesList)) {
        changesList.forEach((changeItem) => {
          const valueObj = changeItem.value as Record<string, unknown>;
          if (valueObj) {
            const msgObj = (valueObj.message || valueObj.messages?.[0]) as Record<string, unknown>;
            const text = (msgObj?.text || valueObj.text) as string;

            if (text && !msgObj?.is_echo) {
              const senderObj = (valueObj.from || valueObj.sender) as Record<string, unknown>;
              const recipientObj = (valueObj.to || valueObj.recipient) as Record<string, unknown>;
              const senderId = (senderObj?.id as string) || "unknown_sender";

              if (senderId !== "17841413970700607" && senderId !== "115679509983218") {
                events.push({
                  senderId,
                  recipientId: (recipientObj?.id as string) || (entry.id as string) || "unknown_recipient",
                  timestamp: (valueObj.timestamp as number) || Date.now(),
                  messageId: (msgObj?.id as string) || `mid_${Date.now()}`,
                  text
                });
              }
            }
          }
        });
      }
    });
  }

  return events;
}
