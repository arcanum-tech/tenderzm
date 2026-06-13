"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const KEY = "tenderzm_session";
const BG = "#3730a3";

export default function HeaderAuth() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) { try { setUser(JSON.parse(raw).user); } catch {} }
  }, []);

  function logout() {
    localStorage.removeItem(KEY);
    setUser(null);
    router.refresh();
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs opacity-70 hidden sm:inline">{user.name}</span>
        <button onClick={logout}
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:bg-white/30"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          Log Out
        </button>
      </div>
    );
  }

  return (
    <Link href="/login"
      className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
      style={{ background: "rgba(255,255,255,0.9)", color: BG }}>
      Log In
    </Link>
  );
}
