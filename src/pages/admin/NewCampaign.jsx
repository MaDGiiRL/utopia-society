// src/pages/admin/NewCampaign.jsx
import { useState } from "react";
import {
  Send,
  Mail,
  MessageCircle,
  CalendarDays,
  Sparkles,
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError("");

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Errore nell'invio campagna");
      }

      setOk(true);
      e.target.reset();
    } catch (err) {
      console.error(err);
      setError(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
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
            Campagna registrata e segnata come inviata.
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
    </div>
  );
}
