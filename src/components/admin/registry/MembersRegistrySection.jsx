
export default function MembersRegistrySection({
  registryLoading,
  registryError,
  filteredRegistry,
  registryFile,
  setRegistryFile,
  importingRegistry,
  importMessage,
  onImportClick,
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Storico soci da XLSX (tabella members_registry)
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setRegistryFile(file);
            }}
            className="block max-w-[220px] cursor-pointer text-[10px] text-slate-300 file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-cyan-400/70 file:bg-slate-900/80 file:px-2 file:py-1 file:text-[10px] file:text-cyan-100 hover:file:bg-cyan-500/20"
          />
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

      {!registryLoading && !registryError && filteredRegistry.length === 0 && (
        <div className="py-4 text-center text-[11px] text-slate-500">
          Nessun record storico per l&apos;anno selezionato.
        </div>
      )}

      {!registryLoading && !registryError && filteredRegistry.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/70">
                <th className="px-3 py-2 font-medium text-slate-400">Stato</th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Tessera
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">Nome</th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Cognome
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Cod. fiscale
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">Anno</th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Valida dal
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Valida al
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">Email</th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Cellulare
                </th>
                <th className="px-3 py-2 font-medium text-slate-400">
                  Qualifica
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
                    {r.status || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.card_number || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.first_name || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.last_name || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.fiscal_code || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.year || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.valid_from
                      ? new Date(r.valid_from).toLocaleDateString("it-IT")
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.valid_to
                      ? new Date(r.valid_to).toLocaleDateString("it-IT")
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.email || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.phone || "-"}
                  </td>
                  <td className="px-3 py-2 text-[11px] text-slate-300">
                    {r.qualification || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
