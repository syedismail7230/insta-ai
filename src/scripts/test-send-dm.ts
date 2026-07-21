import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sendInstagramDM } from "../lib/channels/instagram";

async function testSend() {
  const recipientId = "4469044433164710"; // @riwa_interiors IG User ID
  console.log(`📡 Sending test DM to Instagram recipient (${recipientId})...`);

  const success = await sendInstagramDM(recipientId, "Hello from Zawr Industries AI Sales Agent! How can we assist you today?");
  console.log("DM Send Success Result:", success);
}

testSend();
