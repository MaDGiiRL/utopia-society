// src/components/admin/registry/MembersTable.jsx
export default function MembersTable({
  t,
  loading,
  error,
  filteredMembers,
  onOpenMember,
  onOpenRegistryEntry,
}) {
  if (loading) {
    return (
      <div className="py-6 text-center text-[11px] text-slate-400">
        {t("admin.membersPanel.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-[11px] text-rose-300">{error}</div>
    );
  }

  if (!filteredMembers || !filteredMembers.length) {
    return (
      <div className="py-6 text-center text-[11px] text-slate-400">
        {t("admin.membersPanel.noResults")}
      </div>
    );
  }

  return (
    <div className="mb-4 overflow-x-auto">
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Richieste tessera dal sito
      </h3>

      <table className="min-w-full text-left text-[11px] text-slate-200">
        <thead>
          <tr className="border-b border-white/10 bg-slate-900/70 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <th className="px-3 py-2">Anno</th>
            <th className="px-3 py-2">Stato</th>
            <th className="px-3 py-2">Cognome</th>
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2 text-right">Azioni</th>
          </tr>
        </thead>

        <tbody>
          {filteredMembers.map((m) => {
            const isRegistry =
              m.source === "members_registry" ||
              m.is_registry_active ||
              !!m._registryEntry;

            const entry = m._registryEntry || (isRegistry ? m : null);

            return (
              <tr
                key={m.id}
                className="border-b border-white/5 hover:bg-slate-900/60"
              >
                {/*
                  ANNO
                  da valid_from oppure r.year se arriva da registry
                */}
                <td className="px-3 py-2 text-[11px] text-slate-300">
                  {entry?.year
                    ? entry.year
                    : entry?.valid_from
                    ? new Date(entry.valid_from).getFullYear()
                    : "-"}
                </td>

                {/* STATO */}
                <td className="px-3 py-2 text-[11px]">
                  <span
                    className={`inline-flex rounded-full px-2 py-[1px] text-[10px] uppercase tracking-[0.14em] ${
                      entry?.status &&
                      entry.status.toLowerCase().startsWith("attiv")
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-700/40 text-slate-200 border border-slate-600/60"
                    }`}
                  >
                    {entry?.status || "-"}
                  </span>
                </td>

                {/* COGNOME */}
                <td className="px-3 py-2 text-[11px] text-slate-200">
                  {entry?.last_name || "-"}
                </td>

                {/* NOME */}
                <td className="px-3 py-2 text-[11px] text-slate-300">
                  {entry?.first_name || "-"}
                </td>

                {/* AZIONI */}
                <td className="px-3 py-2 text-right">
                  {isRegistry ? (
                    <button
                      type="button"
                      onClick={() => onOpenRegistryEntry(entry)}
                      className="rounded-full border border-slate-500/70 bg-slate-800/60 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700"
                    >
                      Dettagli storico
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenMember(m.id)}
                      className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-100 hover:bg-cyan-500/25"
                    >
                      {t("admin.membersPanel.openCard")}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
