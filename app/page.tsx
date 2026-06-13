import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeaderAuth from "./HeaderAuth";

const CATEGORIES = ["All", "Construction", "IT", "Goods", "Consulting", "Services"];

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ cat?: string; search?: string }> }) {
  const sp = await searchParams;
  const cat = sp.cat || "";
  const search = sp.search || "";

  let query = supabase.from("tenders").select("*")
    .eq("is_active", true)
    .gte("closing_date", new Date().toISOString().split("T")[0])
    .order("is_featured", { ascending: false })
    .order("closing_date", { ascending: true });

  if (cat && cat !== "All") query = query.ilike("category", cat);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data: tenders } = await query;

  const daysLeft = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff;
  };

  const urgencyColor = (days: number) => {
    if (days <= 3) return { bg: "#fee2e2", text: "#991b1b", label: `${days}d left` };
    if (days <= 7) return { bg: "#fef3c7", text: "#92400e", label: `${days}d left` };
    return { bg: "#e0e7ff", text: "#3730a3", label: `${days}d left` };
  };

  return (
    <div className="min-h-screen" style={{ background: "#eef2ff", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }} className="text-white px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,255,255,0.2)" }}>📋</div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">TenderZM</h1>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Zambia Tenders & Procurement 🇿🇲</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/subscribe" className="text-xs font-bold px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }}>
              Get Alerts →
            </Link>
            <HeaderAuth />
          </div>
        </div>
      </header>

      <section style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }} className="text-white px-6 pt-10 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(255,255,255,0.15)" }}>
            🏛 Government & Private Tenders
          </div>
          <h2 className="text-4xl font-black mb-3 leading-tight">
            Never miss a<br />
            <span style={{ color: "#c7d2fe" }}>bidding opportunity.</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.8)" }}>
            All active Zambian tenders in one place. Subscribe PRO to get SMS/email alerts for new tenders in your category.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs mb-6">
            {["Government Tenders", "Private Sector", "SMS Alerts", "All Categories"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.2)" }}>{t}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#tenders" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white"
              style={{ background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)" }}>
              Browse Tenders ↓
            </a>
            <Link href="/subscribe" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm"
              style={{ background: "#c7d2fe", color: "#3730a3" }}>
              Get SMS Alerts →
            </Link>
          </div>
        </div>
      </section>

      {/* Search + filter */}
      <section className="max-w-6xl mx-auto px-6 -mt-6">
        <form className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-3 border border-indigo-100">
          <input name="search" defaultValue={search} placeholder="Search tenders..."
            className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
          <select name="cat" defaultValue={cat}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="submit" className="text-white font-black px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>Search</button>
        </form>
      </section>

      {/* Tenders */}
      <section id="tenders" className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-500 mb-5">{tenders?.length ?? 0} active tenders</p>
        {!tenders?.length ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No tenders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {tenders.map((t: any) => {
              const days = daysLeft(t.closing_date);
              const urg = urgencyColor(days);
              return (
                <Link key={t.id} href={`/tender/${t.id}`}
                  className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-lg transition-all p-5 group">
                  {t.is_featured && (
                    <div className="text-xs font-black text-white px-3 py-0.5 rounded-full w-fit mb-2"
                      style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>⭐ FEATURED</div>
                  )}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-black text-gray-900 text-sm leading-snug group-hover:text-indigo-700 transition-colors">{t.title}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 capitalize"
                      style={{ background: "#e0e7ff", color: "#3730a3" }}>{t.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">🏛 {t.issuing_body} · {t.is_government ? "Government" : "Private"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: urg.bg, color: urg.text }}>
                      ⏰ {urg.label}
                    </span>
                    {t.value_zmw && (
                      <span className="text-sm font-black" style={{ color: "#3730a3" }}>ZMW {Number(t.value_zmw).toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* PRO CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="rounded-2xl p-8 text-white text-center" style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>
          <h3 className="text-xl font-black mb-2">Never miss a tender again</h3>
          <p className="text-sm mb-4" style={{ color: "#c7d2fe" }}>Get SMS alerts the moment a tender in your category is published. PRO — ZMW 200/month.</p>
          <Link href="/subscribe" className="inline-block font-black px-6 py-3 rounded-xl text-sm"
            style={{ background: "white", color: "#3730a3" }}>Subscribe to PRO Alerts →</Link>
        </div>
      </section>

      <footer className="text-center py-8 text-xs" style={{ background: "#111827", color: "#9ca3af" }}>
        <p className="text-white font-black text-base mb-1">TenderZM 📋</p>
        <p className="mb-1">Powered by <span style={{ color: "#c7d2fe" }}>ARCANUM TECH LIMITED</span> · TPIN: 2003723894 · Lusaka, Zambia</p>
        <p style={{ color: "#6b7280" }}>Always verify tender details directly with the issuing body before submitting bids.</p>
      </footer>
    </div>
  );
}
