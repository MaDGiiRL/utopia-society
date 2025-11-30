// src/pages/admin/NewCampaign.jsx
import { useEffect, useState } from "react";
import {
  Send,
  Mail,
  MessageCircle,
  CalendarDays,
  Sparkles,
  Loader2,
  History,
  ListOrdered,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [recipientsCount, setRecipientsCount] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      // ultime 20 campagne
      const { data: campData, error: campErr } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (campErr) throw campErr;

      // ultimi 80 log
      const { data: logData, error: logErr } = await supabase
        .from("campaign_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);

      if (logErr) throw logErr;

      setCampaigns(campData || []);
      setLogs(logData || []);
    } catch (err) {
      console.error("Errore caricamento storico campagne:", err);
      setHistoryError("Errore nel caricamento dello storico campagne.");
      setCampaigns([]);
      setLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError("");
    setRecipientsCount(null);

    const form = new FormData(e.target);

    const payload = {
      title: form.get("title"),
      event_date: form.get("event_date"),
      message_email: form.get("message_email"),
      message_sms: form.get("message_sms"),
      channels: {
        email: form.get("send_email") === "on",
        sms: form.get("send_sms") === "on",
      },
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/send-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Errore nell'invio campagna");
      }

      setOk(true);
      setRecipientsCount(data.recipients ?? null);
      e.target.reset();

      // ricarica lo storico
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CON ICONE */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/70 via-fuchsia-500/60 to-emerald-400/70 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.7)]">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
              Nuova campagna evento
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Invia email e/o SMS a tutti i soci che hanno dato consenso
              marketing per promuovere una data o un evento speciale.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-[11px]">
          <p className="text-[10px] text-slate-500">
            I destinatari vengono letti automaticamente dalla tabella{" "}
            <span className="font-mono text-[10px]">members</span>.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dati evento */}
        <div className="grid gap-4 md:grid-cols-[2fr_1.1fr]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Titolo evento / campagna
            </label>
            <input
              name="title"
              required
              placeholder="Utopia Night · Special Guest..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <CalendarDays className="h-3 w-3 text-fuchsia-300" />
              Data evento
            </label>
            <input
              type="date"
              name="event_date"
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
            />
          </div>
        </div>

        {/* Testo email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <Mail className="h-3 w-3 text-cyan-300" />
            Corpo email
          </label>
          <textarea
            name="message_email"
            rows={6}
            placeholder={`Ciao {{ nome }},\n\nvenerdì ti aspettiamo a Utopia per una nuova serata...`}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
          />
          <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] text-slate-200">
              ?
            </span>
            Puoi usare placeholder tipo{" "}
            <code className="rounded bg-slate-900/80 px-1 py-[1px] text-[10px] text-cyan-300">
              {"{{ nome }}"}
            </code>{" "}
            o{" "}
            <code className="rounded bg-slate-900/80 px-1 py-[1px] text-[10px] text-cyan-300">
              {"{{ data_evento }}"}
            </code>{" "}
            che verranno sostituiti lato server.
          </p>
        </div>

        {/* Testo SMS */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <MessageCircle className="h-3 w-3 text-emerald-300" />
            Testo SMS
          </label>
          <textarea
            name="message_sms"
            rows={3}
            maxLength={300}
            placeholder="Venerdì Utopia Night, ingresso riservato ai soci. Presenta la tessera all’ingresso."
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Consigliati max 300 caratteri per evitare SMS multipli.</span>
          </div>
        </div>

        {/* Canali */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-xs">
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            Canali di invio
          </span>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="send_email"
                defaultChecked
                className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="inline-flex items-center gap-1 uppercase tracking-[0.16em] text-slate-200">
                <Mail className="h-3 w-3 text-cyan-300" />
                Email
              </span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="send_sms"
                className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="inline-flex items-center gap-1 uppercase tracking-[0.16em] text-slate-200">
                <MessageCircle className="h-3 w-3 text-emerald-300" />
                SMS
              </span>
            </label>
          </div>
        </div>

        {/* Stato invio */}
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            Campagna inviata correttamente
            {recipientsCount != null && (
              <span className="ml-1 text-emerald-300/90">
                · Destinatari marketing: {recipientsCount}
              </span>
            )}
          </div>
        )}

        {/* Bottoni */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(56,189,248,0.8)] hover:brightness-110 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Invio in corso...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Invia campagna</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* STORICO CAMPAGNE + LOG */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80 text-cyan-300">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                Storico campagne
              </h3>
              <p className="text-[10px] text-slate-500">
                Ultime campagne inviate con relativo stato.
              </p>
            </div>
          </div>
        </div>

        {historyError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {historyError}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Tabella campagne */}
          <div className="max-h-64 overflow-auto rounded-xl border border-white/5 bg-slate-950/70">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Titolo</th>
                  <th className="px-3 py-2 text-left">Evento</th>
                  <th className="px-3 py-2 text-left">Stato</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-400"
                    >
                      Carico storico campagne...
                    </td>
                  </tr>
                ) : campaigns.length ? (
                  campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
                    >
                      <td className="px-3 py-2 text-[10px] text-slate-400">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("it-IT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{c.title || "-"}</td>
                      <td className="px-3 py-2 text-[10px] text-slate-300">
                        {c.event_date
                          ? new Date(c.event_date).toLocaleDateString("it-IT")
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-[2px] text-[10px] uppercase tracking-[0.16em] ${
                            c.status === "sent"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : c.status === "sending"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                              : "bg-slate-700/40 text-slate-200 border border-slate-500/40"
                          }`}
                        >
                          {c.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-500"
                    >
                      Nessuna campagna registrata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tabella log */}
          <div className="max-h-64 overflow-auto rounded-xl border border-white/5 bg-slate-950/70">
            <div className="flex items-center gap-2 px-3 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <ListOrdered className="h-3 w-3" />
              Log invii recenti
            </div>
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">Ts</th>
                  <th className="px-3 py-2 text-left">Campagna</th>
                  <th className="px-3 py-2 text-left">Canale</th>
                  <th className="px-3 py-2 text-left">Stato</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-xs text-slate-400"
                    >
                      Carico log...
                    </td>
                  </tr>
                ) : logs.length ? (
                  logs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
                    >
                      <td className="px-3 py-2 text-[10px] text-slate-400">
                        {l.created_at
                          ? new Date(l.created_at).toLocaleString("it-IT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-[10px] text-slate-300">
                        {l.campaign_id}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-slate-800/80 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-slate-100">
                          {l.channel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-[2px] text-[10px] uppercase tracking-[0.16em] ${
                            l.status === "sent"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-xs text-slate-500"
                    >
                      Nessun log recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
