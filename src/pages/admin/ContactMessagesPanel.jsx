// src/pages/admin/ContactMessagesPanel.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Mail, User, Phone, MessageSquare } from "lucide-react";

export default function ContactMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore caricamento contact_messages:", error);
        setError("Errore nel caricamento dei messaggi di contatto.");
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate-300">Carico messaggi...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-300">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Messaggi di contatto
            </h2>
            <p className="text-[11px] text-slate-400">
              Tutti gli invii dal form contatti del sito.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
          Totale: {messages.length}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </div>
      )}

      <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" /> Nome
                </span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Telefono
                </span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Messaggio
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr
                key={m.id}
                className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 align-top text-[11px] text-slate-400">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("it-IT")
                    : "-"}
                </td>
                <td className="px-3 py-2 align-top">{m.name || "-"}</td>
                <td className="px-3 py-2 align-top">{m.email || "-"}</td>
                <td className="px-3 py-2 align-top">{m.phone || "-"}</td>
                <td className="max-w-xs px-3 py-2 align-top">
                  <p className="whitespace-pre-wrap text-[11px] text-slate-100/90">
                    {m.message}
                  </p>
                </td>
              </tr>
            ))}
            {!messages.length && !error && (
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
