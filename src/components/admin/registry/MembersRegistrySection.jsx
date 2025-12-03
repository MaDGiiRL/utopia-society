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
  // 🔹 nuovi
  registryStatusFilter,
  setRegistryStatusFilter,
}) {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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

        {/* Filtri anno + stato */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          {/* filtro anno */}
          <div className="flex items-center gap-1">
            <span>Anno:</span>
            <select
              className="h-7 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="ALL">Tutti</option>
              {/* opzionale: puoi aggiungere qui anni “predefiniti” */}
              {/* <option value="2024">2024</option> */}
            </select>
          </div>

          {/* filtro stato */}
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

      {/* Import storico */}
      <div className="flex flex-col gap-2 rounded-lg bg-slate-900/70 p-2 text-[11px] text-slate-200 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
            Import storico ACSI (.xlsx)
          </span>

          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="block cursor-pointer text-[11px] text-slate-200 file:mr-2 file:rounded-md file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-[11px] file:font-medium file:text-slate-100 hover:file:bg-slate-700"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setRegistryFile(f);
            }}
          />

          <div className="flex items-center gap-1">
            <span>Anno per import:</span>
            <input
              type="number"
              className="h-7 w-20 rounded-md border border-slate-700 bg-slate-950/80 px-2 text-[11px] text-slate-100"
              placeholder={new Date().getFullYear().toString()}
              value={registryYear}
              onChange={(e) => setRegistryYear(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {importMessage && (
            <span className="text-[10px] text-slate-300">{importMessage}</span>
          )}

          <button
            type="button"
            onClick={onImportClick}
            disabled={importingRegistry}
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
              importingRegistry
                ? "cursor-wait border-slate-600 bg-slate-800 text-slate-400"
                : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/25"
            }`}
          >
            {importingRegistry ? "Import in corso…" : "Importa XLSX"}
          </button>
        </div>
      </div>

      {/* Tabella storico */}
      {registryLoading ? (
        <div className="py-6 text-center text-xs text-slate-400">
          Caricamento storico soci…
        </div>
      ) : registryError ? (
        <div className="py-6 text-center text-xs text-rose-400">
          {registryError}
        </div>
      ) : filteredRegistry.length === 0 ? (
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
                <th className="px-2 py-2">Tessera</th>
                <th className="px-2 py-2">Cod. Fiscale</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Cellulare</th>
                <th className="px-2 py-2">Valida dal</th>
                <th className="px-2 py-2">Valida al</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistry.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-2 py-4 text-center text-xs text-slate-400"
                  >
                    Nessun risultato.
                  </td>
                </tr>
              )}
              {filteredRegistry.length > 0 &&
                filteredRegistry
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((entry) => (
                    <tr
                      key={
                        entry.id ||
                        `${entry.external_id}-${entry.card_number}-${entry.year}`
                      }
                      className="cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/50"
                      onClick={() => onOpenRegistryEntry(entry)}
                    >
                      <td className="px-2 py-1 align-middle text-[11px] text-slate-300">
                        {entry.year ?? "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        <span
                          className={`inline-flex rounded-full px-2 py-[1px] text-[10px] uppercase tracking-[0.14em] ${
                            (entry.status || "")
                              .toString()
                              .toLowerCase()
                              .startsWith("attiv")
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-700/40 text-slate-200 border border-slate-600/60"
                          }`}
                        >
                          {entry.status || "-"}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        {entry.last_name || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        {entry.first_name || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px] text-slate-300">
                        {entry.card_number || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        {entry.fiscal_code || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        {entry.email || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px]">
                        {entry.phone || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px] text-slate-300">
                        {entry.valid_from || "-"}
                      </td>
                      <td className="px-2 py-1 align-middle text-[11px] text-slate-300">
                        {entry.valid_to || "-"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
}
