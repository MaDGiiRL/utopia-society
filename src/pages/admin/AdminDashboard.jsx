// src/pages/admin/AdminDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Mail,
  Send,
  Download,
  LogOut,
  Shield,
  Activity,
} from "lucide-react";
import NewCampaign from "./NewCampaign";
import MembersPanel from "./MembersPanel";
import ContactMessagesPanel from "./ContactMessagesPanel";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function AdminDashboard() {
  const [tab, setTab] = useState("members"); // members | contacts | campaign
  const [xmlError, setXmlError] = useState("");
  const [xmlLoading, setXmlLoading] = useState(false);
  const navigate = useNavigate();

  const handleExportXml = async () => {
    setXmlError("");
    setXmlLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/members.xml`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Errore durante la generazione XML");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      a.href = url;
      a.download = `utopia_soci_${today}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setXmlError(err.message || "Errore imprevisto");
    } finally {
      setXmlLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh)] bg-slate-950/55 text-slate-50 px-3 py-25">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full space-y-4 md:w-64">
          {/* Header admin */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-lg">
            <div className="pointer-events-none absolute -left-6 -top-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -right-4 bottom-0 h-12 w-12 rounded-full bg-fuchsia-500/25 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400/80 via-fuchsia-500/70 to-emerald-400/80 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.7)]">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-100">
                  Utopia · Admin
                </h1>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <Activity className="h-3 w-3 text-emerald-300" />
                  <span>Gestisci soci, contatti e campagne.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-2 shadow-lg">
            <nav className="flex flex-col gap-1 text-xs md:flex-col">
              <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
                <button
                  type="button"
                  onClick={() => setTab("members")}
                  className={`flex w-full min-w-40 items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "members"
                      ? "border border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                      : "border border-transparent text-slate-300 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase tracking-[0.18em]">
                      Log soci
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Anagrafica e documenti
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("contacts")}
                  className={`flex w-full min-w-40 items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "contacts"
                      ? "border border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                      : "border border-transparent text-slate-300 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase tracking-[0.18em]">
                      Log contatti
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Richieste dal sito
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("campaign")}
                  className={`flex w-full min-w-40 items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "campaign"
                      ? "border border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                      : "border border-transparent text-slate-300 hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80">
                    <Send className="h-3.5 w-3.5 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="uppercase tracking-[0.18em]">
                      Nuova campagna
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Email &amp; SMS ai soci
                    </span>
                  </div>
                </button>
              </div>
            </nav>
          </div>

          {/* Export + logout */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 text-[11px] shadow-lg sm:flex-col sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleExportXml}
              disabled={xmlLoading}
              className={`inline-flex items-center justify-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1.5 font-semibold uppercase tracking-[0.16em] text-cyan-100 hover:bg-cyan-500/25 transition ${
                xmlLoading ? "cursor-not-allowed opacity-60" : ""
              }`}
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Export soci XML</span>
              <span className="sm:hidden">Export XML</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1 text-[10px] text-slate-400 transition hover:text-rose-300"
            >
              <LogOut className="h-3 w-3" />
              <span>Esci dall&apos;area admin</span>
            </button>
          </div>

          {xmlError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {xmlError}
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-3 shadow-xl sm:px-4 sm:py-4">
          {tab === "members" && <MembersPanel />}
          {tab === "contacts" && <ContactMessagesPanel />}
          {tab === "campaign" && <NewCampaign />}
        </section>
      </div>
    </div>
  );
}
