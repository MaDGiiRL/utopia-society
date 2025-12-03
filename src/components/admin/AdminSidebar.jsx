import {
  Users,
  Mail,
  Send,
  LogOut,
  Shield,
  Activity,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminSidebar({
  tab,
  onTabChange,
  xmlError,
  xmlLoading,
  onExportXml,
  // 🔹 nuove props per export ACSI
  xlsxError,
  xlsxLoading,
  onExportXlsx,
  onLogout,
}) {
  const { t } = useTranslation();

  return (
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
              {t("admin.dashboard.badge")}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
              <Activity className="h-3 w-3 text-emerald-300" />
              <span>{t("admin.dashboard.subtitle")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-2 shadow-lg">
        <nav className="flex flex-col gap-1 text-xs md:flex-col">
          <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {/* Membri */}
            <button
              type="button"
              onClick={() => onTabChange("members")}
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
                  {t("admin.dashboard.membersTabTitle")}
                </span>
                <span className="text-[10px] text-slate-500">
                  {t("admin.dashboard.membersTabSubtitle")}
                </span>
              </div>
            </button>

            {/* Contatti */}
            <button
              type="button"
              onClick={() => onTabChange("contacts")}
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
                  {t("admin.dashboard.contactsTabTitle")}
                </span>
                <span className="text-[10px] text-slate-500">
                  {t("admin.dashboard.contactsTabSubtitle")}
                </span>
              </div>
            </button>

            {/* Campagne */}
            <button
              type="button"
              onClick={() => onTabChange("campaign")}
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
                  {t("admin.dashboard.campaignTabTitle")}
                </span>
                <span className="text-[10px] text-slate-500">
                  {t("admin.dashboard.campaignTabSubtitle")}
                </span>
              </div>
            </button>

            {/* Nuovo evento */}
            <button
              type="button"
              onClick={() => onTabChange("event")}
              className={`flex w-full min-w-40 items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                tab === "event"
                  ? "border border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  : "border border-transparent text-slate-300 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-[0.18em]">
                  Nuovo evento
                </span>
                <span className="text-[10px] text-slate-500">
                  Banner + newsletter
                </span>
              </div>
            </button>

            {/* ✅ Log attività */}
            <button
              type="button"
              onClick={() => onTabChange("logs")}
              className={`flex w-full min-w-40 items-center gap-2 rounded-xl px-3 py-2 text-left transition md:min-w-0 ${
                tab === "logs"
                  ? "border border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  : "border border-transparent text-slate-300 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80">
                <Activity className="h-3.5 w-3.5 shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-[0.18em]">
                  {t("admin.dashboard.logsTabTitle", "Log attività")}
                </span>
                <span className="text-[10px] text-slate-500">
                  {t("admin.dashboard.logsTabSubtitle", "Azioni admin + sito")}
                </span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Export + logout */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 text-[11px] shadow-lg sm:flex-col sm:items-center sm:justify-between">
        {/* XLSX ACSI */}
        <button
          type="button"
          onClick={onExportXlsx}
          disabled={xlsxLoading}
          className={`inline-flex items-center justify-center gap-1 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1.5 font-semibold uppercase tracking-[0.16em] text-emerald-100 hover:bg-emerald-500/25 transition ${
            xlsxLoading ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <FileSpreadsheet className="h-3 w-3" />
          <span className="hidden sm:inline">
            {t("admin.dashboard.exportMembersAcsiFull", "Export ACSI (.xlsx)")}
          </span>
          <span className="sm:hidden">
            {t("admin.dashboard.exportMembersAcsiShort", "ACSI .xlsx")}
          </span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-1 text-[10px] text-slate-400 transition hover:text-rose-300"
        >
          <LogOut className="h-3 w-3" />
          <span>{t("admin.dashboard.logout")}</span>
        </button>
      </div>

      {xmlError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {xmlError}
        </div>
      )}

      {xlsxError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {xlsxError}
        </div>
      )}
    </aside>
  );
}
