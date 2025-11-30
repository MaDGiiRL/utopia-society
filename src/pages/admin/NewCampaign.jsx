// src/pages/admin/NewCampaign.jsx
import { useState } from "react";

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
      const res = await fetch("/api/admin/send-campaign", {
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
      <div>
        <h2 className="text-lg font-semibold">Nuova campagna evento</h2>
        <p className="text-xs text-slate-400">
          Invia newsletter e/o SMS a tutti i soci che hanno dato consenso
          marketing quando c&apos;è una nuova data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dati evento */}
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              Titolo evento / campagna
            </label>
            <input
              name="title"
              required
              placeholder="Utopia Night - Special Guest..."
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              Data evento
            </label>
            <input
              type="date"
              name="event_date"
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Testo email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            Corpo email
          </label>
          <textarea
            name="message_email"
            rows={5}
            placeholder={`Ciao {{nome}},\n\nvenerdì ti aspettiamo a Utopia per una nuova serata...`}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400"
          />
          <p className="text-[11px] text-slate-500">
            Puoi usare placeholder tipo <code>{"{{ nome }}"}</code> che verranno
            sostituiti lato server.
          </p>
        </div>

        {/* Testo SMS */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            Testo SMS
          </label>
          <textarea
            name="message_sms"
            rows={3}
            maxLength={300}
            placeholder="Venerdì Utopia Night, ingresso riservato ai soci. Presenta la tessera all’ingresso."
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Max 300 caratteri consigliati per SMS singolo.</span>
          </div>
        </div>

        {/* Canali */}
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="send_email"
              defaultChecked
              className="h-3 w-3 rounded border-slate-500 bg-slate-950"
            />
            <span className="uppercase tracking-[0.16em] text-slate-300">
              Invia Email
            </span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="send_sms"
              className="h-3 w-3 rounded border-slate-500 bg-slate-950"
            />
            <span className="uppercase tracking-[0.16em] text-slate-300">
              Invia SMS
            </span>
          </label>
        </div>

        {/* Stato invio */}
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            Campagna inviata (o messa in coda) correttamente.
          </div>
        )}

        {/* Bottoni */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-full border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/30 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Invio in corso..." : "Invia campagna"}
          </button>
        </div>
      </form>
    </div>
  );
}
