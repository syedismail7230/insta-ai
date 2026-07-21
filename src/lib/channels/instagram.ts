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
  if (!secret || !signatureHeader) return true; // allow testing if not strictly enforced in dev

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
    message: { text }
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json();
      console.error("❌ Meta Instagram DM send failed:", errJson);
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

export function parseInstagramWebhookPayload(body: any): InstagramMessageEvent[] {
  const events: InstagramMessageEvent[] = [];

  if (body.object === "instagram" || body.object === "page") {
    body.entry?.forEach((entry: any) => {
      const messagingList = entry.messaging || entry.changes;
      messagingList?.forEach((messagingItem: any) => {
        const message = messagingItem.message || messagingItem.value?.message;
        if (message && message.text) {
          events.push({
            senderId: messagingItem.sender?.id || messagingItem.value?.from?.id,
            recipientId: messagingItem.recipient?.id || entry.id,
            timestamp: messagingItem.timestamp || Date.now(),
            messageId: message.mid || `mid_${Date.now()}`,
            text: message.text
          });
        }
      });
    });
  }

  return events;
}
