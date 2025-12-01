import { useTranslation } from "react-i18next";

export default function GalleryFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  filteredEventsCount,
  filteredPhotosCount,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[0.75rem]">
      {/* Filtri principali */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="uppercase tracking-[0.18em] text-slate-500 text-[0.65rem]">
          {t("gallery.filters.filterLabel")}
        </span>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: t("gallery.filters.all") },
            { id: "guest", label: t("gallery.filters.guest") },
            { id: "resident", label: t("gallery.filters.resident") },
            { id: "live", label: t("gallery.filters.live") },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`rounded-full border px-3 py-1 text-[0.7rem] transition ${
                filter === f.id
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                  : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + info conteggio */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-[0.18em] text-slate-500 text-[0.65rem]">
            {t("gallery.filters.sortLabel")}
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-full bg-slate-900/80 border border-white/15 px-3 py-1 text-[0.7rem] text-slate-100 outline-none"
          >
            <option value="az">{t("gallery.filters.sortAz")}</option>
            <option value="za">{t("gallery.filters.sortZa")}</option>
          </select>
        </div>

        <div className="text-[0.7rem] text-slate-500">
          {t("gallery.filters.summary", {
            events: filteredEventsCount,
            photos: filteredPhotosCount,
          })}
        </div>
      </div>
    </div>
  );
}
