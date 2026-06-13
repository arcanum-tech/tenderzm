import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subscriberId = searchParams.get("subscriber_id");
  const status = searchParams.get("status");
  if (!subscriberId) return NextResponse.json({ error: "Missing subscriber_id" }, { status: 400 });

  if (status === "success") {
    const expires = new Date(); expires.setMonth(expires.getMonth() + 1);
    await supabaseAdmin.from("tender_subscribers").update({ subscription_tier: "pro", subscription_expires_at: expires.toISOString() }).eq("id", subscriberId);
  }
  return NextResponse.redirect(new URL(`/?subscribed=1`, req.url));
}
