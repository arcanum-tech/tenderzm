"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Construction", "IT", "Goods", "Consulting", "Services"];

export default function SubscribePage() {
  const router = useRouter();
  const CACHE_KEY = "tenderzm_subscribe";
  const [form, setForm] = useState({ name: "", phone: "", email: "", company_name: "", categories: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auth guard
    const sessionRaw = localStorage.getItem("tenderzm_session");
    if (!sessionRaw) { router.replace("/login?redirect=/subscribe"); return; }
    try {
      const { user } = JSON.parse(sessionRaw);
      setForm(prev => ({ ...prev, name: prev.name || user.name || "", phone: prev.phone || user.phone || "" }));
    } catch {}
    // Restore draft
    try { const s = sessionStorage.getItem(CACHE_KEY); if (s) { const d = JSON.parse(s); if (d) setForm(prev => ({ ...prev, ...d })); } } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  function toggleCat(c: string) {
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(c) ? p.categories.filter((x) => x !== c) : [...p.categories, c],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }

    // redirect to payment for PRO
    const callbackUrl = encodeURIComponent(`https://tenderzm.vercel.app/api/subscription-callback?subscriber_id=${data.id}&status=success`);
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    window.location.href = `https://arcanum-payments.vercel.app/pay?app=tenderzm&product=TenderZM+PRO&amount=200&callback=${callbackUrl}`;
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50";

  if (done) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#eef2ff" }}>
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-indigo-100 max-w-sm">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-black text-gray-900 text-lg mb-1">You&apos;re subscribed!</p>
        <p className="text-xs text-gray-500 mb-4">You&apos;ll get SMS alerts for new tenders in your selected categories.</p>
        <Link href="/" className="block text-white font-black py-3 rounded-xl text-sm"
          style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>Browse Tenders →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#eef2ff" }}>
      <header style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }} className="text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-indigo-200 hover:text-white text-sm">← Back</Link>
          <h1 className="text-lg font-black">TenderZM 📋</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-black text-gray-900 mb-1">Subscribe to PRO Alerts</h2>
        <p className="text-sm text-gray-500 mb-6">ZMW 200/month · SMS alerts when new tenders match your categories</p>

        <form onSubmit={submit} className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-800">Your Details</h3>
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" required className={inp} />
            <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (e.g. 0976123456)" required className={inp} />
            <input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email (optional)" type="email" className={inp} />
            <input value={form.company_name} onChange={(e) => setForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Company name (optional)" className={inp} />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
            <h3 className="font-black text-gray-800 mb-1">Alert Categories</h3>
            <p className="text-xs text-gray-400 mb-3">Select which tender categories to get alerts for</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => toggleCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${form.categories.includes(c) ? "text-white border-transparent" : "border-gray-200 text-gray-500"}`}
                  style={form.categories.includes(c) ? { background: "linear-gradient(135deg,#3730a3,#312e81)" } : {}}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full text-white font-black py-4 rounded-xl text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>
            {loading ? "Processing..." : "Pay ZMW 200 & Subscribe →"}
          </button>
        </form>
      </main>
    </div>
  );
}
