import { db } from "../db";
import { customers, messages } from "../db/schema";
import { eq } from "drizzle-orm";

async function checkCustomerDb() {
  const instagramId = "1943734403009623";
  const customer = await db.select().from(customers).where(eq(customers.instagramId, instagramId));
  console.log("Customer DB Record:", JSON.stringify(customer, null, 2));

  if (customer[0]) {
    const msgs = await db.select().from(messages).where(eq(messages.conversationId, customer[0].id));
    console.log("Messages logged in DB:", JSON.stringify(msgs, null, 2));
  }
}
checkCustomerDb();
