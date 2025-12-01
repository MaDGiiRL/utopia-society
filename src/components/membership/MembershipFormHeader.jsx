import { useTranslation } from "react-i18next";

export default function MembershipFormHeader() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-slate-400">
          {t("membership.formHeaderBadge")}
        </p>
        <p className="text-xs text-slate-200">
          {t("membership.formHeaderSubtitle")}
        </p>
      </div>
      <div className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300">
        {t("membership.formHeaderChip")}
      </div>
    </div>
  );
}
