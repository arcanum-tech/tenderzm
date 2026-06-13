"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = ["Construction", "IT", "Goods", "Consulting", "Services"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"add" | "tenders">("add");
  const [tenders, setTenders] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "", issuing_body: "", category: "Construction", tender_number: "",
    description: "", closing_date: "", value_zmw: "", location: "Lusaka",
    is_government: true, contact_email: "", contact_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/tenders", { headers: { "x-admin-password": password } });
    if (res.ok) { setAuthed(true); const d = await res.json(); setTenders(d.tenders); }
    else alert("Wrong password");
  }

  async function addTender(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg("");
    const res = await fetch("/api/tenders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ ...form, value_zmw: form.value_zmw ? parseFloat(form.value_zmw) : null }),
    });
    setLoading(false);
    if (res.ok) { setMsg("Tender added!"); const d = await fetch("/api/admin/tenders", { headers: { "x-admin-password": password } }); const j = await d.json(); setTenders(j.tenders); }
    else setMsg("Error adding tender");
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50";

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#eef2ff" }}>
      <form onSubmit={login} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-indigo-100 space-y-4">
        <p className="text-2xl text-center">🔐</p>
        <h1 className="text-xl font-black text-center text-gray-900">TenderZM Admin</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" required className={inp} />
        <button type="submit" className="w-full text-white font-black py-3 rounded-xl text-sm"
          style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>Login</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#eef2ff" }}>
      <header style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }} className="text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-black text-lg">TenderZM Admin 📋</h1>
          <Link href="/" className="text-xs text-indigo-200">← Public Site</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-2">
          {(["add", "tenders"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${tab === t ? "text-white" : "bg-white text-gray-500 border border-indigo-100"}`}
              style={tab === t ? { background: "linear-gradient(135deg,#3730a3,#312e81)" } : {}}>
              {t === "add" ? "Add Tender" : `All Tenders (${tenders.length})`}
            </button>
          ))}
        </div>

        {tab === "add" && (
          <form onSubmit={addTender} className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <h2 className="font-black text-gray-800">Add New Tender</h2>
            <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Tender title" required className={inp} />
            <input value={form.issuing_body} onChange={(e) => setForm(p => ({ ...p, issuing_body: e.target.value }))} placeholder="Issuing body (e.g. Ministry of Health)" required className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} className={inp}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input value={form.tender_number} onChange={(e) => setForm(p => ({ ...p, tender_number: e.target.value }))} placeholder="Tender ref number" className={inp} />
            </div>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Closing Date</label>
                <input type="date" value={form.closing_date} onChange={(e) => setForm(p => ({ ...p, closing_date: e.target.value }))} required className={inp} />
              </div>
              <input value={form.value_zmw} onChange={(e) => setForm(p => ({ ...p, value_zmw: e.target.value }))} placeholder="Est. value (ZMW)" type="number" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.contact_phone} onChange={(e) => setForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="Contact phone" className={inp} />
              <input value={form.contact_email} onChange={(e) => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email" type="email" className={inp} />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_government} onChange={(e) => setForm(p => ({ ...p, is_government: e.target.checked }))} className="accent-indigo-600" />
              Government tender
            </label>
            {msg && <p className={`text-sm px-4 py-2 rounded-xl ${msg.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{msg}</p>}
            <button type="submit" disabled={loading} className="w-full text-white font-black py-3 rounded-xl text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>
              {loading ? "Adding..." : "Add Tender"}
            </button>
          </form>
        )}

        {tab === "tenders" && (
          <div className="space-y-3">
            {tenders.map((t: any) => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm flex justify-between items-start gap-3">
                <div>
                  <p className="font-black text-gray-800 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.issuing_body} · Closes {new Date(t.closing_date).toLocaleDateString("en-ZM")}</p>
                </div>
                <Link href={`/tender/${t.id}`} className="text-xs font-bold shrink-0" style={{ color: "#3730a3" }}>View →</Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
