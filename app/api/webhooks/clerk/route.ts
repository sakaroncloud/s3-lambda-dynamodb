import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}
