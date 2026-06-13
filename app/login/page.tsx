"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const BRAND = { bg: "#3730a3", dark: "#312e81", light: "#eef2ff", logo: "TenderZM 📋", key: "tenderzm_session" };

function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(BRAND.key)) router.replace(redirect);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register" && pin !== confirmPin) { setError("PINs do not match."); return; }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) { setError("PIN must be exactly 4 digits."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, phone: phone.trim(), name: name.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      localStorage.setItem(BRAND.key, JSON.stringify({ token: data.token, user: data.user }));
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BRAND.light }}>
      <header className="text-white px-6 py-4" style={{ background: `linear-gradient(135deg,${BRAND.bg},${BRAND.dark})` }}>
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <Link href="/" className="text-indigo-200 hover:text-white text-sm">← Home</Link>
          <h1 className="text-lg font-black">{BRAND.logo}</h1>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-white rounded-t-2xl px-6 py-5 text-center" style={{ background: `linear-gradient(135deg,${BRAND.bg},${BRAND.dark})` }}>
            <p className="text-xs opacity-70 mb-1">ARCANUM TECH LIMITED</p>
            <h2 className="text-xl font-black">{BRAND.logo}</h2>
            <p className="text-sm opacity-80 mt-1">{mode === "login" ? "Welcome back" : "Create your account"}</p>
          </div>
          <div className="bg-white rounded-b-2xl border border-t-0 shadow-lg px-6 py-6">
            <div className="flex rounded-xl overflow-hidden border mb-5">
              <button onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 py-2 text-sm font-black transition-colors ${mode === "login" ? "text-white" : "text-gray-500"}`}
                style={mode === "login" ? { background: BRAND.bg } : {}}>Log In</button>
              <button onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 py-2 text-sm font-black transition-colors ${mode === "register" ? "text-white" : "text-gray-500"}`}
                style={mode === "register" ? { background: BRAND.bg } : {}}>Register</button>
            </div>
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded mb-3">{error}</p>}
            <form onSubmit={submit} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Mwale"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0960123456" type="tel"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">4-Digit PIN</label>
                <input required value={pin} onChange={e => setPin(e.target.value.slice(0, 4))} placeholder="••••"
                  type="password" inputMode="numeric" maxLength={4}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm PIN</label>
                  <input required value={confirmPin} onChange={e => setConfirmPin(e.target.value.slice(0, 4))} placeholder="••••"
                    type="password" inputMode="numeric" maxLength={4}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full text-white font-black py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg,${BRAND.bg},${BRAND.dark})` }}>
                {loading ? "Please wait..." : mode === "login" ? "Log In →" : "Create Account →"}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-4">
              Your PIN secures your tender subscriptions.<br />ARCANUM TECH LIMITED · TPIN 2003723894
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
