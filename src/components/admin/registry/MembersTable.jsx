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

      <table className="min-w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-white/10 bg-slate-900/70">
            <th className="px-3 py-2 font-medium text-slate-400">
              {t("admin.membersPanel.table.name")}
            </th>
            <th className="px-3 py-2 font-medium text-slate-400">
              {t("admin.membersPanel.table.email")}
            </th>
            <th className="px-3 py-2 font-medium text-slate-400 text-right">
              {/* azioni */}
              {t("admin.membersPanel.table.card")}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((m) => {
            const isRegistry =
              m.source === "members_registry" ||
              m.is_registry_active ||
              !!m._registryEntry;

            return (
              <tr
                key={m.id}
                className="border-b border-white/5 hover:bg-slate-900/60"
              >
                <td className="px-3 py-2 text-[11px] text-slate-200">
                  {m.full_name || "-"}
                </td>

                <td className="px-3 py-2 text-[11px] text-slate-300 break-all">
                  {m.email || "-"}
                </td>

                <td className="px-3 py-2 text-[11px] text-slate-300">
                  {m.city || "-"}
                </td>

                <td className="px-3 py-2 text-right">
                  {isRegistry && onOpenRegistryEntry ? (
                    <button
                      type="button"
                      onClick={() => onOpenRegistryEntry(m._registryEntry || m)}
                      className="rounded-full border border-slate-500/70 bg-slate-800/60 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700"
                    >
                      Dettagli storico
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenMember && onOpenMember(m.id)}
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
