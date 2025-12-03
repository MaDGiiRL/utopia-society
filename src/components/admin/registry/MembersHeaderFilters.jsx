// src/components/admin/registry/MembersHeaderFilters.jsx
export default function MembersHeaderFilters({ t, filteredCount, totalCount }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
          {t("admin.membersPanel.headerTitle")}
        </h2>
        <p className="text-[11px] text-slate-400">
          {t("admin.membersPanel.headerSubtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-[10px] text-slate-300">
          {t("admin.membersPanel.shownCounter", {
            filtered: filteredCount,
            total: totalCount,
          })}
        </span>
      </div>
    </div>
  );
}
