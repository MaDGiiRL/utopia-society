// src/pages/admin/AdminDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, Mail, Send, Download, LogOut } from "lucide-react";
import NewCampaign from "./NewCampaign";
import MembersPanel from "./MembersPanel";
import ContactMessagesPanel from "./ContactMessagesPanel";

export default function AdminDashboard() {
  const [tab, setTab] = useState("members"); // members | contacts | campaign
  const [xmlError, setXmlError] = useState("");
  const [xmlLoading, setXmlLoading] = useState(false);
  const navigate = useNavigate();

  const handleExportXml = async () => {
    setXmlError("");
    setXmlLoading(true);

    try {
      const res = await fetch("/api/admin/members.xml", {
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
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950/95 text-slate-50 px-3 py-30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 space-y-4">
          {/* Header admin */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-lg">
            <h1 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Utopia · Admin
            </h1>
            <p className="mt-1 text-[11px] text-slate-500">
              Gestisci soci, log e campagne.
            </p>
          </div>

          {/* Tabs (in verticale su desktop, orizzontale scrollabile su mobile) */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-2 shadow-lg">
            <nav className="flex flex-col gap-1 text-xs md:flex-col">
              <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
                <button
                  type="button"
                  onClick={() => setTab("members")}
                  className={`flex w-full min-w-[150px] items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "members"
                      ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/60"
                      : "text-slate-300 hover:bg-slate-900/70 border border-transparent"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span className="uppercase tracking-[0.18em]">Log soci</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("contacts")}
                  className={`flex w-full min-w-[150px] items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "contacts"
                      ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/60"
                      : "text-slate-300 hover:bg-slate-900/70 border border-transparent"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="uppercase tracking-[0.18em]">
                    Log contatti
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("campaign")}
                  className={`flex w-full min-w-[150px] items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                    tab === "campaign"
                      ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/60"
                      : "text-slate-300 hover:bg-slate-900/70 border border-transparent"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  <span className="uppercase tracking-[0.18em]">
                    Nuova campagna
                  </span>
                </button>
              </div>
            </nav>
          </div>

          {/* Export + logout */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-lg flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleExportXml}
              disabled={xmlLoading}
              className={`inline-flex items-center justify-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1.5 font-semibold uppercase tracking-[0.16em] text-cyan-100 hover:bg-cyan-500/25 transition ${
                xmlLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Export soci XML</span>
              <span className="sm:hidden">Export XML</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1 text-[10px] text-slate-400 hover:text-rose-300 transition"
            >
              <LogOut className="h-3 w-3" />
              <span>Esci</span>
            </button>
          </div>

          {xmlError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {xmlError}
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-3 shadow-xl sm:px-4 sm:py-4">
          {tab === "members" && <MembersPanel />}
          {tab === "contacts" && <ContactMessagesPanel />}
          {tab === "campaign" && <NewCampaign />}
        </section>
      </div>
    </div>
  );
}
