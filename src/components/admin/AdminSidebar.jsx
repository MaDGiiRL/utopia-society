// src/components/admin/AdminSidebar.jsx
import { useState } from "react";
import {
  Users,
  Mail,
  LogOut,
  Shield,
  Activity,
  FileSpreadsheet,
  Sparkles,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminSidebar({
  tab,
  onTabChange,

  xmlError,
  xmlLoading,
  onExportXml,

  xlsxError,
  xlsxLoading,
  onExportXlsx,
  lastXlsxExportAt,

  // ✅ IMPORT (dal Dashboard)
  onImportMembers, // async ({file, year}) => Promise
  importing,
  importMessage,
  setImportMessage,

  onLogout,
}) {
  const { t } = useTranslation();

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importYear, setImportYear] = useState("");

  const toggleImport = () => {
    setImportOpen((v) => {
      const next = !v;

      // quando chiudi, resetta tutto
      if (!next) {
        setImportFile(null);
        setImportYear("");
        setImportMessage?.("");
      } else {
        // quando apri, pulisci solo eventuali errori vecchi
        setImportMessage?.("");
      }

      return next;
    });
  };

  const handleImport = async () => {
    try {
      if (!importFile) {
        setImportMessage?.("Seleziona prima un file .xlsx");
        return;
      }

      const yearStr = String(importYear || "").trim();
      const year = parseInt(yearStr, 10);
      if (!yearStr || Number.isNaN(year)) {
        setImportMessage?.("Anno import mancante o non valido (es. 2025).");
        return;
      }

      setImportMessage?.("");

      const result = await onImportMembers?.({ file: importFile, year });

      // se ok → reset file/anno (e se vuoi richiudi automaticamente)
      if (result?.ok !== false) {
        setImportFile(null);
        setImportYear("");

        // ✅ se vuoi che si richiuda da solo dopo successo:
        // setImportOpen(false);
      }
    } catch (e) {
      setImportMessage?.(e?.message || "Errore import soci");
    }
  };

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
        <nav className="flex flex-col gap-1 text-xs">
          <div className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
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

            {/* Logs */}
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

      {/* Export + Import + logout */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 text-[11px] shadow-lg">
        {/* XLSX ACSI */}
        <div className="flex w-full flex-col gap-1">
          <button
            type="button"
            onClick={onExportXlsx}
            disabled={xlsxLoading}
            className={`inline-flex items-center justify-center gap-1 rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1.5 font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-500/25 ${
              xlsxLoading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <FileSpreadsheet className="h-3 w-3" />
            <span className="hidden sm:inline">
              {t(
                "admin.dashboard.exportMembersAcsiFull",
                "Export ACSI (.xlsx)"
              )}
            </span>
            <span className="sm:hidden">
              {t("admin.dashboard.exportMembersAcsiShort", "ACSI .xlsx")}
            </span>
          </button>

          {lastXlsxExportAt && (
            <p className="text-[10px] text-slate-500">
              Ultimo export:{" "}
              {new Date(lastXlsxExportAt).toLocaleString("it-IT")}
            </p>
          )}
        </div>

        {/* ✅ IMPORT (collapsible “a scomparsa”) */}
        <div className="mt-1 rounded-xl border border-white/5 bg-slate-950/40 p-2">
          <button
            type="button"
            onClick={toggleImport}
            className={`inline-flex w-full items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
              importOpen
                ? "border-slate-600 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <Upload className="h-3 w-3" />
              {importOpen ? "Nascondi import" : "Apri import"}
              <span className="ml-1 rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-[9px] tracking-[0.14em] text-slate-400">
                Avanzato
              </span>
            </span>

            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                importOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* area che si apre/chiude */}
          <div
            className={`grid transition-all duration-300 ${
              importOpen
                ? "grid-rows-[1fr] opacity-100 mt-2"
                : "grid-rows-[0fr] opacity-0 mt-0"
            }`}
          >
            <div className="overflow-hidden">
              {/* ✅ suggerimenti completi */}
              <div className="mb-2 rounded-xl border border-white/5 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-400">
                <span className="font-medium text-slate-200">Nota:</span> il
                campo <span className="text-slate-200">Anno import</span> è{" "}
                <span className="text-slate-200">obbligatorio</span>. Usa
                l’import solo quando devi aggiungere/aggiornare soci dal
                gestionale. In caso di dubbi, contatta la developer prima di
                procedere.
              </div>

              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    File XLSX
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full cursor-pointer rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 text-[11px] text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-slate-100 hover:file:bg-slate-600"
                  />
                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {importFile?.name
                      ? `Selezionato: ${importFile.name}`
                      : "Nessun file selezionato"}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Anno import
                  </label>
                  <input
                    type="text"
                    placeholder="Es. 2025"
                    value={importYear}
                    onChange={(e) => setImportYear(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    L'anno corrispondente ai soci importati.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importing}
                    className={`inline-flex w-full items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                      importing
                        ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                        : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                    }`}
                  >
                    {importing ? "Import in corso…" : "Importa soci"}
                  </button>

                  <button
                    type="button"
                    onClick={toggleImport}
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                  >
                    Chiudi
                  </button>
                </div>

                {!!importMessage && (
                  <div className="rounded-xl border border-white/5 bg-slate-900/40 p-2 text-[11px] text-slate-300">
                    {importMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* logout */}
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
