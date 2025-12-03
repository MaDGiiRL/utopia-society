// src/components/admin/campaign/CampaignHeader.jsx
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CampaignHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400/70 via-fuchsia-500/60 to-emerald-400/70 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.7)]">
          <Send className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
            {t("admin.campaign.headerTitle")}
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            {t("admin.campaign.headerSubtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-[11px]">
        <p className="text-[10px] text-slate-500 text-right max-w-xs">
          {t("admin.campaign.headerNote", { table: "members" })}
        </p>
      </div>
    </div>
  );
}
