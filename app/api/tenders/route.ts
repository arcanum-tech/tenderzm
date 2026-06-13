import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat");
  const search = searchParams.get("search");

  let query = supabase.from("tenders").select("*").eq("is_active", true)
    .gte("closing_date", new Date().toISOString().split("T")[0])
    .order("is_featured", { ascending: false }).order("closing_date", { ascending: true });

  if (cat && cat !== "All") query = query.ilike("category", cat);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tenders: data });
}

export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabaseAdmin.from("tenders").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
