// src/pages/admin/MembersList.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/admin/members?exported=all`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Errore lettura soci");
        }

        setMembers(data.members || []);
      } catch (err) {
        console.error(err);
        setError("Errore nel caricamento dei soci");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Soci iscritti (tutti)</h2>

      {loading && (
        <p className="text-sm text-slate-400">Caricamento in corso…</p>
      )}

      {error && !loading && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="py-2">Data</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Città</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/5">
                <td className="py-1 text-xs">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("it-IT")
                    : "-"}
                </td>
                <td>{m.full_name}</td>
                <td>{m.email || "-"}</td>
                <td>{m.phone || "-"}</td>
                <td>{m.city || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
