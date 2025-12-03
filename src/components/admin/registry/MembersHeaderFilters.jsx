export default function MembersHeaderFilters({
  t,
  yearFilter,
  setYearFilter,
  fromTime,
  setFromTime,
  toTime,
  setToTime,
  filteredCount,
  totalCount,
  availableYears, // 👈 NUOVO
}) {
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
        {/* filtro anno */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-cyan-400"
        >
          <option value="ALL">Tutti gli anni</option>
          {availableYears?.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* fascia oraria */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-slate-500">Ora da</span>
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-100 outline-none focus:border-cyan-400"
          />
          <span className="text-[10px] text-slate-500">a</span>
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>

        {/* contatore */}
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
