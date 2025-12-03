// src/components/admin/contacts/ContactsHeader.jsx
import { Mail, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactsHeader({ total, onExport }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
            {t("admin.contactsPanel.title")}
          </h2>
          <p className="text-[11px] text-slate-400">
            {t("admin.contactsPanel.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/25 transition"
        >
          <Download className="h-3 w-3" />
          <span>{t("admin.contactsPanel.exportExcel")}</span>
        </button>

        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          {t("admin.contactsPanel.total", { count: total })}
        </span>
      </div>
    </div>
  );
}
