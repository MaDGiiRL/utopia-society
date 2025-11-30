// src/pages/admin/ContactMessagesPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Mail,
  User,
  Phone,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Reply,
} from "lucide-react";

const PAGE_SIZE = 40;

export default function ContactMessagesPanel() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [exportError, setExportError] = useState("");

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

  // reset pagina se cambia la lista
  useEffect(() => {
    setPage(1);
  }, [messages.length]);

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));

  const pagedMessages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return messages.slice(start, start + PAGE_SIZE);
  }, [messages, page]);

  const handleOpen = (msg) => {
    setSelectedMessage(msg);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  const handleExportCsv = () => {
    try {
      setExportError("");
      if (!messages.length) {
        setExportError("Non ci sono messaggi da esportare.");
        return;
      }

      const headers = ["ID", "Data", "Nome", "Email", "Telefono", "Messaggio"];

      const escapeCsv = (value) => {
        if (value === null || value === undefined) return "";
        const s = String(value);
        // rimpiazza eventuali doppi apici e racchiudi tra virgolette
        return `"${s.replace(/"/g, '""')}"`;
      };

      const rows = messages.map((m) => {
        const created = m.created_at
          ? new Date(m.created_at).toLocaleString("it-IT")
          : "";
        return [
          escapeCsv(m.id),
          escapeCsv(created),
          escapeCsv(m.name || ""),
          escapeCsv(m.email || ""),
          escapeCsv(m.phone || ""),
          escapeCsv(m.message || ""),
        ].join(";");
      });

      const csvContent = [headers.join(";"), ...rows].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `utopia_contact_messages_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Errore export CSV:", err);
      setExportError("Errore durante l'esportazione dei messaggi.");
    }
  };

  const buildMailtoLink = (msg) => {
    if (!msg?.email) return "#";

    const subject = "Re: contatto da sito Utopia";
    const body = `Ciao ${msg.name || ""},

ti rispondiamo al messaggio che ci hai inviato dal form contatti.

---

Messaggio originale:
${msg.message || ""}

---

Team Utopia
`;

    return `mailto:${encodeURIComponent(
      msg.email
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Carico messaggi...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/25 transition"
          >
            <Download className="h-3 w-3" />
            <span>Esporta Excel</span>
          </button>

          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
            Totale: {messages.length}
          </span>
        </div>
      </div>

      {(error || exportError) && (
        <div className="space-y-2">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {error}
            </div>
          )}
          {exportError && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
              {exportError}
            </div>
          )}
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
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {pagedMessages.map((m) => (
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
                <td className="px-3 py-2 align-top break-all">
                  {m.email || "-"}
                </td>
                <td className="px-3 py-2 align-top">{m.phone || "-"}</td>
                <td className="px-3 py-2 align-top text-right">
                  <button
                    type="button"
                    onClick={() => handleOpen(m)}
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-400/60 bg-cyan-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/30 transition"
                  >
                    <Eye className="h-3 w-3" />
                    Dettagli
                  </button>
                </td>
              </tr>
            ))}
            {!pagedMessages.length && !error && (
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

      {/* PAGINAZIONE */}
      {messages.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
          <div>
            Pagina {page} di {totalPages} ·{" "}
            <span className="text-slate-400">({PAGE_SIZE} per pagina)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                page === 1
                  ? "border-slate-700 text-slate-600 cursor-not-allowed"
                  : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                page === totalPages
                  ? "border-slate-700 text-slate-600 cursor-not-allowed"
                  : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
              }`}
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* MODALE DETTAGLIO MESSAGGIO */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Dettaglio messaggio
                </h3>
                <p className="text-[11px] text-slate-400">
                  ID:{" "}
                  <span className="font-mono text-[10px]">
                    {selectedMessage.id}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs text-slate-100">
              {/* dati principali */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Nome
                  </p>
                  <p>{selectedMessage.name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>
                  <p className="break-all">{selectedMessage.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Telefono
                  </p>
                  <p>{selectedMessage.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Inviato il
                  </p>
                  <p>
                    {selectedMessage.created_at
                      ? new Date(selectedMessage.created_at).toLocaleString(
                          "it-IT"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* messaggio */}
              <div className="border-t border-white/10 pt-3 space-y-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Messaggio
                </p>
                <p className="whitespace-pre-wrap text-slate-200/90">
                  {selectedMessage.message || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-between gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-slate-500/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200 hover:bg-slate-800"
              >
                Chiudi
              </button>

              {selectedMessage.email && (
                <a
                  href={buildMailtoLink(selectedMessage)}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/35 transition"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Rispondi via email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
