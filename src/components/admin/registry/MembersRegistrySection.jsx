import React from "react";
import { useTranslation } from "react-i18next";

export default function MembersRegistrySection({
  registryLoading,
  registryError,
  filteredRegistry,
  registryFile,
  setRegistryFile,
  importingRegistry,
  importMessage,
  onImportClick,
  page,
  pageSize,
  total,
  onPageChange,
  registryYear,
  setRegistryYear,
  onOpenRegistryEntry,
  yearFilter,
  setYearFilter,
  registryStatusFilter,
  setRegistryStatusFilter,
}) {
  const { t } = useTranslation();

  // 🔹 calcolo pagine totali in base al totale passato dal parent
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // 🔹 slice dei risultati in base alla pagina corrente
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageEntries = filteredRegistry.slice(startIndex, endIndex);

  return (
    <div className="space-y-3">
      {/* HEADER + filtri */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
            Storico soci ACSI
          </h2>
          <p className="text-[11px] text-slate-400">
            {total} righe trovate
            {registryStatusFilter === "ACTIVE" ? " (solo attivi)" : ""}{" "}
            {yearFilter !== "ALL" ? `• anno ${yearFilter}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          {/* ANNO */}
          <div className="flex items-center gap-1">
            <span>Anno:</span>
            <select
              className="h-7 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="ALL">Tutti</option>
              {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* STATO */}
          <div className="flex items-center gap-1">
            <span>Stato:</span>
            <select
              className="h-7 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={registryStatusFilter}
              onChange={(e) => setRegistryStatusFilter(e.target.value)}
            >
              <option value="ALL">Tutti</option>
              <option value="ACTIVE">Solo attivi</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABELLONE */}
      {registryLoading ? (
        <div className="py-6 text-center text-xs text-slate-400">
          Caricamento storico soci…
        </div>
      ) : registryError ? (
        <div className="py-6 text-center text-xs text-rose-400">
          {registryError}
        </div>
      ) : total === 0 || filteredRegistry.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          Nessun socio nello storico con i filtri selezionati.
        </div>
      ) : (
        <>
          <table className="min-w-full text-left text-[11px] text-slate-200">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/80 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                <th className="px-2 py-2">Anno</th>
                <th className="px-2 py-2">Stato</th>
                <th className="px-2 py-2">Cognome</th>
                <th className="px-2 py-2">Nome</th>
                <th className="px-2 py-2 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {pageEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-2 py-4 text-center text-xs text-slate-400"
                  >
                    Nessun risultato per questa pagina.
                  </td>
                </tr>
              ) : (
                pageEntries.map((entry) => (
                  <tr
                    key={
                      entry.id ||
                      `${entry.external_id || ""}-${entry.card_number || ""}-${
                        entry.year || ""
                      }`
                    }
                    className="border-b border-slate-800/60 hover:bg-slate-800/50"
                  >
                    <td className="px-2 py-1 text-slate-300">
                      {entry.year ?? "-"}
                    </td>

                    <td className="px-2 py-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-px text-[10px] uppercase tracking-[0.14em] ${
                          entry.status &&
                          entry.status.toLowerCase().startsWith("attiv")
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-700/40 text-slate-200 border border-slate-600/60"
                        }`}
                      >
                        {entry.status || "-"}
                      </span>
                    </td>

                    <td className="px-2 py-1">{entry.last_name || "-"}</td>
                    <td className="px-2 py-1">{entry.first_name || "-"}</td>

                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenRegistryEntry(entry)}
                        className="rounded-full border border-slate-500/70 bg-slate-800/60 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700"
                      >
                        Dettagli
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINAZIONE */}
          {total > pageSize && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
              <span>
                Pagina {page} di {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                    page <= 1
                      ? "cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  }`}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                    page >= totalPages
                      ? "cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
