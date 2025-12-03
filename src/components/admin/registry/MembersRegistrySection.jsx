export default function MembersRegistrySection({
  registryLoading,
  registryError,
  filteredRegistry, // pagina corrente
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
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const hasAnyRecords = (total || 0) > 0;

  const startIndex = !hasAnyRecords ? 0 : (page - 1) * pageSize + 1;
  const endIndex = !hasAnyRecords ? 0 : Math.min(page * pageSize, total || 0);

  const fixedYears = [2022, 2023, 2024, 2025, 2026];

  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Storico soci
        </h3>

        {/* 🔹 Filtro ANNO + import XLSX */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {/* Filtro anno storico */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[10px] text-slate-100 outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tutti gli anni</option>
            {fixedYears.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          {/* Anno usato per l'import */}
          <input
            type="number"
            min="1900"
            max="2100"
            value={registryYear}
            onChange={(e) => setRegistryYear(e.target.value)}
            placeholder="Anno import (es. 2025)"
            className="w-[130px] rounded-full border border-slate-600 bg-slate-900/80 px-3 py-1 text-[10px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />

          {/* File XLSX */}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setRegistryFile(file);
            }}
            className="block max-w-[220px] cursor-pointer text-[10px] text-slate-300 file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-cyan-400/70 file:bg-slate-900/80 file:px-2 file:py-1 file:text-[10px] file:text-cyan-100 hover:file:bg-cyan-500/20"
          />

          {/* Bottone importa */}
          <button
            type="button"
            onClick={onImportClick}
            disabled={importingRegistry}
            className={`rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-[9px] text-emerald-100 hover:bg-emerald-500/25 ${
              importingRegistry ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {importingRegistry ? "Import in corso..." : "Importa XLSX"}
          </button>
        </div>
      </div>

      {importMessage && (
        <p className="mb-2 text-[10px] text-slate-400">{importMessage}</p>
      )}

      {registryLoading && (
        <div className="py-4 text-center text-[11px] text-slate-400">
          Caricamento storico soci...
        </div>
      )}

      {registryError && !registryLoading && (
        <div className="py-4 text-center text-[11px] text-rose-300">
          {registryError}
        </div>
      )}

      {!registryLoading && !registryError && !hasAnyRecords && (
        <div className="py-4 text-center text-[11px] text-slate-500">
          Nessun record storico per l&apos;anno selezionato.
        </div>
      )}

      {!registryLoading && !registryError && hasAnyRecords && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/70">
                  <th className="px-3 py-2 font-medium text-slate-400">Anno</th>
                  <th className="px-3 py-2 font-medium text-slate-400">Nome</th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    Cognome
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    E-mail
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    Scheda
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistry.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {r.year ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {r.first_name || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {r.last_name || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {r.email || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onOpenRegistryEntry(r)}
                        className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-100 hover:bg-cyan-500/25"
                      >
                        Apri scheda
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* paginazione */}
          <div className="mt-2 flex flex-col items-center justify-between gap-2 text-[10px] text-slate-400 sm:flex-row">
            <span>
              Mostrati{" "}
              <span className="font-semibold text-slate-200">{startIndex}</span>{" "}
              - <span className="font-semibold text-slate-200">{endIndex}</span>{" "}
              di <span className="font-semibold text-slate-200">{total}</span>{" "}
              record
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className={`rounded-full border border-slate-500/60 px-3 py-1 text-[10px] ${
                  page <= 1
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-slate-800/70"
                }`}
              >
                &laquo; Precedente
              </button>
              <span>
                Pagina{" "}
                <span className="font-semibold text-slate-200">{page}</span> /{" "}
                <span className="font-semibold text-slate-200">
                  {totalPages}
                </span>
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className={`rounded-full border border-slate-500/60 px-3 py-1 text-[10px] ${
                  page >= totalPages
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-slate-800/70"
                }`}
              >
                Successiva &raquo;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
