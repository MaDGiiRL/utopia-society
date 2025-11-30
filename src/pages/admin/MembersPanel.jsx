// src/pages/admin/MembersPanel.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MembersPanel() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMembers(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-300">Carico soci...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Soci iscritti</h2>
          <p className="text-xs text-slate-400">
            Elenco degli invii dal form di ammissione socio.
          </p>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          Totale: {members.length}
        </span>
      </div>

      <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Telefono</th>
              <th className="px-3 py-2 text-left">Città</th>
              <th className="px-3 py-2 text-left">Marketing</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 text-[11px] text-slate-400">
                  {new Date(m.created_at).toLocaleString("it-IT")}
                </td>
                <td className="px-3 py-2">{m.full_name}</td>
                <td className="px-3 py-2">{m.email}</td>
                <td className="px-3 py-2">{m.phone || "-"}</td>
                <td className="px-3 py-2">{m.city || "-"}</td>
                <td className="px-3 py-2">
                  {m.accept_marketing ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-[2px] text-[10px] text-emerald-300">
                      Sì
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700/40 px-2 py-[2px] text-[10px] text-slate-300">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  Nessun socio registrato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
