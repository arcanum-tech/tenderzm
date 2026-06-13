import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { name, phone, email, company_name, categories } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "Name and phone required" }, { status: 400 });

  const normalized = phone.replace(/\s+/g, "").replace(/^\+26/, "0").replace(/^26/, "0");

  // Upsert
  const { data: existing } = await supabaseAdmin.from("tender_subscribers").select("id").eq("phone", normalized).single();
  if (existing) return NextResponse.json({ id: existing.id });

  const { data, error } = await supabaseAdmin.from("tender_subscribers").insert({
    name, phone: normalized, email, company_name, categories: categories ?? [],
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
