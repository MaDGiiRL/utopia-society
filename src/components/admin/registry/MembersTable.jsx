// src/components/admin/registry/MembersTable.jsx
export default function MembersTable({
  t,
  loading,
  error,
  filteredMembers,
  onOpenMember,
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
        Soci / richieste tessera
      </h3>

      <table className="min-w-full text-left text-[11px] text-slate-200">
        <thead>
          <tr className="border-b  border-white/10 bg-slate-900/70 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <th className="px-3 py-2">Anno</th>
            <th className="px-3 py-2">Stato</th>
            <th className="px-3 py-2">Export ACSI</th>
            <th className="px-3 py-2">Cognome</th>
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2 text-right">Azioni</th>
          </tr>
        </thead>

        <tbody>
          {filteredMembers.map((m) => {
            // YEAR: se esiste field year, altrimenti anno di created_at
            const year =
              m.year ??
              (m.valid_from
                ? new Date(m.valid_from).getFullYear()
                : m.created_at
                ? new Date(m.created_at).getFullYear()
                : null);

            const status = m.status || "";

            // split full_name -> first/last name con preferenza ai campi separati
            let firstName = m.first_name || "";
            let lastName = m.last_name || "";

            if (!firstName && !lastName && m.full_name) {
              const parts = m.full_name.trim().split(/\s+/);
              if (parts.length === 1) {
                lastName = parts[0];
              } else {
                lastName = parts.pop();
                firstName = parts.join(" ");
              }
            }

            const exported = !!m.exported_to_registry;

            return (
              <tr
                key={m.id}
                className="border-b border-white/5 hover:bg-slate-900/60"
              >
                {/* ANNO */}
                <td className="px-3 py-2 text-[11px] text-slate-300">
                  {year || "-"}
                </td>

                {/* STATO */}
                <td className="px-3 py-2 text-[11px]">
                  {status ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-px text-[10px] uppercase tracking-[0.14em] ${
                        status.toLowerCase().startsWith("attiv")
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-700/40 text-slate-200 border border-slate-600/60"
                      }`}
                    >
                      {status}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* EXPORT ACSI */}
                <td className="px-3 py-2 text-[11px]">
                  <span
                    className={`inline-flex rounded-full px-2 py-px text-[10px] uppercase tracking-[0.14em] ${
                      exported
                        ? "bg-cyan-500/10 text-cyan-200 border border-cyan-500/40"
                        : "bg-amber-500/10 text-amber-200 border border-amber-500/40"
                    }`}
                  >
                    {exported ? "ESPORTATO" : "DA ESPORTARE"}
                  </span>
                </td>

                {/* COGNOME */}
                <td className="px-3 py-2 text-[11px] text-slate-200 uppercase">
                  {lastName || "-"}
                </td>

                {/* NOME */}
                <td className="px-3 py-2 text-[11px] text-slate-300 uppercase">
                  {firstName || "-"}
                </td>

                {/* AZIONI */}
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenMember && onOpenMember(m.id)}
                    className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-100 hover:bg-cyan-500/25"
                  >
                    {t("admin.membersPanel.openCard")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
