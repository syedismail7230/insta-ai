import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sendInstagramDM } from "../lib/channels/instagram";

async function testSend() {
  const recipientId = "4469044433164710"; // riwa_interiors ID
  console.log(`Sending test DM to recipient ID ${recipientId}...`);
  const success = await sendInstagramDM(recipientId, "Hello from Zawr AI Sales Agent! Testing real-time DM delivery.");
  console.log("Result success:", success);
}

testSend();
