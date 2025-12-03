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
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const hasAnyRecords = (total || 0) > 0;

  const startIndex = !hasAnyRecords ? 0 : (page - 1) * pageSize + 1;
  const endIndex = !hasAnyRecords ? 0 : Math.min(page * pageSize, total || 0);

  return (
    <div className="mt-4">
      {/* ... parte sopra (input anno, file, bottone importa) invariata ... */}

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
