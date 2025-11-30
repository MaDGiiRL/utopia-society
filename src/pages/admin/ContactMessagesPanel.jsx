// src/pages/admin/ContactMessagesPanel.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ContactMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMessages(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-300">Carico messaggi...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Messaggi di contatto</h2>
          <p className="text-xs text-slate-400">
            Tutti gli invii dal form contatti del sito.
          </p>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          Totale: {messages.length}
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
              <th className="px-3 py-2 text-left">Messaggio</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr
                key={m.id}
                className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 text-[11px] text-slate-400 align-top">
                  {new Date(m.created_at).toLocaleString("it-IT")}
                </td>
                <td className="px-3 py-2 align-top">{m.name || "-"}</td>
                <td className="px-3 py-2 align-top">{m.email || "-"}</td>
                <td className="px-3 py-2 align-top">{m.phone || "-"}</td>
                <td className="px-3 py-2 align-top max-w-xs">
                  <p className="whitespace-pre-wrap text-[11px] text-slate-100/90">
                    {m.message}
                  </p>
                </td>
              </tr>
            ))}
            {!messages.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  Nessun messaggio ricevuto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
