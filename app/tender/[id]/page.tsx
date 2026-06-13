import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: t } = await supabase.from("tenders").select("*").eq("id", id).single();
  if (!t) return notFound();

  const daysLeft = Math.ceil((new Date(t.closing_date).getTime() - Date.now()) / 86400000);

  return (
    <div className="min-h-screen" style={{ background: "#eef2ff" }}>
      <header style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }} className="text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-indigo-200 hover:text-white text-sm">← Back</Link>
          <h1 className="text-lg font-black">TenderZM 📋</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
              style={{ background: "#e0e7ff", color: "#3730a3" }}>{t.category}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${daysLeft <= 3 ? "bg-red-100 text-red-700" : daysLeft <= 7 ? "bg-yellow-100 text-yellow-700" : "bg-indigo-100 text-indigo-700"}`}>
              ⏰ {daysLeft > 0 ? `${daysLeft} days left` : "Closed"}
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{t.title}</h2>
          <p className="text-sm text-gray-500 mb-1">🏛 {t.issuing_body} · {t.is_government ? "Government" : "Private Sector"}</p>
          {t.tender_number && <p className="text-xs text-gray-400 mb-4">Ref: {t.tender_number}</p>}
          {t.value_zmw && <p className="text-2xl font-black mb-3" style={{ color: "#3730a3" }}>ZMW {Number(t.value_zmw).toLocaleString()}</p>}
          {t.description && <p className="text-sm text-gray-600 leading-relaxed">{t.description}</p>}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm space-y-3 text-sm">
          <h3 className="font-black text-gray-800">Key Dates & Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Published</p>
              <p className="font-bold text-gray-800">{new Date(t.published_date).toLocaleDateString("en-ZM")}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Closing Date</p>
              <p className="font-bold text-red-700">{new Date(t.closing_date).toLocaleDateString("en-ZM")}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-bold text-gray-800">{t.location}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-bold text-gray-800">{t.is_government ? "Government" : "Private"}</p>
            </div>
          </div>
        </div>

        {(t.contact_email || t.contact_phone) && (
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
            <h3 className="font-black text-gray-800 mb-3">Contact</h3>
            {t.contact_phone && (
              <a href={`tel:${t.contact_phone}`} className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: "#3730a3" }}>
                📞 {t.contact_phone}
              </a>
            )}
            {t.contact_email && (
              <a href={`mailto:${t.contact_email}`} className="flex items-center gap-2 text-sm font-bold" style={{ color: "#3730a3" }}>
                ✉️ {t.contact_email}
              </a>
            )}
          </div>
        )}

        <div className="rounded-2xl p-5 text-white text-center" style={{ background: "linear-gradient(135deg,#3730a3,#312e81)" }}>
          <p className="font-black mb-1">Want alerts for tenders like this?</p>
          <p className="text-xs mb-3" style={{ color: "#c7d2fe" }}>Subscribe PRO — ZMW 200/month for SMS alerts on new tenders.</p>
          <Link href="/subscribe" className="inline-block font-black px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "white", color: "#3730a3" }}>Subscribe →</Link>
        </div>
      </main>
    </div>
  );
}
