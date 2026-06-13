import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createHash, randomBytes } from "crypto";

const APP = "tenderzm";

function hashPin(pin: string): string {
  return createHash("sha256").update(pin + process.env.AUTH_SALT).digest("hex");
}

export async function POST(req: NextRequest) {
  const { action, phone, name, pin } = await req.json();
  if (!phone || !pin) return NextResponse.json({ error: "Phone and PIN required" }, { status: 400 });
  const cleanPhone = phone.replace(/\s/g, "");
  const pinHash = hashPin(pin);

  if (action === "register") {
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const { data: existing } = await supabaseAdmin.from("arcanum_users").select("id").eq("phone", cleanPhone).single();
    if (existing) return NextResponse.json({ error: "Phone already registered. Please log in." }, { status: 409 });
    const { data: user, error } = await supabaseAdmin.from("arcanum_users")
      .insert([{ phone: cleanPhone, name, pin_hash: pinHash }]).select("id, name, phone").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const token = randomBytes(32).toString("hex");
    await supabaseAdmin.from("arcanum_sessions").insert([{
      user_id: user.id, token, app: APP,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }]);
    return NextResponse.json({ token, user: { id: user.id, name: user.name, phone: user.phone } });
  }

  if (action === "login") {
    const { data: user } = await supabaseAdmin.from("arcanum_users")
      .select("id, name, phone, pin_hash").eq("phone", cleanPhone).single();
    if (!user) return NextResponse.json({ error: "Phone not registered. Please register first." }, { status: 404 });
    if (user.pin_hash !== pinHash) return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
    await supabaseAdmin.from("arcanum_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    const token = randomBytes(32).toString("hex");
    await supabaseAdmin.from("arcanum_sessions").insert([{
      user_id: user.id, token, app: APP,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }]);
    return NextResponse.json({ token, user: { id: user.id, name: user.name, phone: user.phone } });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });
  const { data: session } = await supabaseAdmin.from("arcanum_sessions")
    .select("user_id, expires_at, arcanum_users(id, name, phone)")
    .eq("token", token).eq("app", APP).single();
  if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (new Date(session.expires_at) < new Date()) {
    await supabaseAdmin.from("arcanum_sessions").delete().eq("token", token);
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  const user = Array.isArray(session.arcanum_users) ? session.arcanum_users[0] : session.arcanum_users;
  return NextResponse.json({ user });
}
