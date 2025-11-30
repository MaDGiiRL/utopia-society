// src/pages/admin/MembersList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MembersList() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMembers(data);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Soci iscritti</h2>
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
                {new Date(m.created_at).toLocaleString("it-IT")}
              </td>
              <td>{m.full_name}</td>
              <td>{m.email}</td>
              <td>{m.phone}</td>
              <td>{m.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
