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

  const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${pageToken}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: "RESPONSE"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json();
      console.error("❌ Meta Instagram DM send failed:", JSON.stringify(errJson, null, 2));

      // Retry with HUMAN_AGENT tag if outside 24h standard window
      if (errJson?.error?.code === 10 || errJson?.error?.error_subcode === 2534022) {
        console.log("🔄 Retrying Instagram DM send with HUMAN_AGENT tag...");
        const retryPayload = {
          recipient: { id: recipientId },
          message: { text },
          messaging_type: "MESSAGE_TAG",
          tag: "HUMAN_AGENT"
        };
        const retryRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(retryPayload)
        });
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          console.log("✅ Instagram DM sent with HUMAN_AGENT tag:", retryData);
          return true;
        }
      }
      return false;
    }

    const data = await res.json();
    console.log("✅ Instagram DM sent successfully:", data);
    return true;
  } catch (error) {
    console.error("❌ Error sending Instagram DM:", error);
    return false;
  }
}

export function parseInstagramWebhookPayload(body: Record<string, unknown>): InstagramMessageEvent[] {
  const events: InstagramMessageEvent[] = [];

  if (body.object === "instagram" || body.object === "page") {
    const entries = (body.entry as Array<Record<string, unknown>>) || [];
    entries.forEach((entry) => {
      const messagingList = (entry.messaging || entry.changes) as Array<Record<string, unknown>>;
      messagingList?.forEach((messagingItem) => {
        const msgObj = (messagingItem.message || (messagingItem.value as Record<string, unknown>)?.message) as Record<string, unknown>;
        // Filter out echo messages (our own Page replies)
        if (msgObj && typeof msgObj.text === "string" && !msgObj.is_echo) {
          const senderObj = (messagingItem.sender || (messagingItem.value as Record<string, unknown>)?.from) as Record<string, unknown>;
          const recipientObj = messagingItem.recipient as Record<string, unknown>;
          const senderId = (senderObj?.id as string) || "unknown_sender";

          // Ignore messages sent by our own Instagram Business Page
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
    });
  }

  return events;
}
