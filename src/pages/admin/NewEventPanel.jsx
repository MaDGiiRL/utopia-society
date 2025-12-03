// src/components/admin/events/NewEventPanel.jsx
import { useState } from "react";
import {
  CalendarDays,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function NewEventPanel() {
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [sentCount, setSentCount] = useState(null);

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError("");
    setBannerUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/admin/upload-campaign-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante l'upload dell'immagine evento"
        );
      }

      setBannerImageUrl(data.url);
    } catch (err) {
      console.error(err);
      setBannerError(
        err instanceof Error
          ? err.message
          : "Errore durante l'upload dell'immagine evento"
      );
      setBannerImageUrl("");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);
    setSentCount(null);
    setSending(true);

    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title") || "",
      event_date: formData.get("event_date") || null,
      banner_title: formData.get("banner_title") || "",
      banner_subtitle: formData.get("banner_subtitle") || "",
      banner_cta_label: formData.get("banner_cta_label") || "",
      banner_cta_url: formData.get("banner_cta_url") || "",
      banner_image_url: bannerImageUrl || "",
      // ✅ niente oggetto/testo mail: si genera tutto in automatico lato server
      send_newsletter: formData.get("send_newsletter") === "on",
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/events`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante la creazione dell'evento"
        );
      }

      setOk(true);
      setSentCount(data.recipients ?? null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante il salvataggio evento"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Nuovo evento
            </div>
            <p className="text-xs text-slate-400">
              Crea un evento con banner in homepage e (opzionalmente) invia una
              newsletter automatica ai soci.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Riga titolo / data */}
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Titolo evento
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
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
            />
          </div>
        </div>

        {/* Sezione Banner Homepage */}
        <div className="space-y-3 rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                Banner homepage
              </div>
              <p className="text-[11px] text-slate-400">
                I testi che inserisci qui vengono usati sia nel banner della
                home, sia nella newsletter automatica.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1.2fr]">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Titolo banner
                </label>
                <input
                  name="banner_title"
                  placeholder="Venerdì • Utopia Night"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Sottotitolo / descrizione breve
                </label>
                <textarea
                  name="banner_subtitle"
                  rows={3}
                  placeholder="Special guest, visual, luci e suono. Ingresso riservato ai soci in regola con il tesseramento."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Testo pulsante
                  </label>
                  <input
                    name="banner_cta_label"
                    placeholder="Prenota il tavolo"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Link pulsante
                  </label>
                  <input
                    name="banner_cta_url"
                    placeholder="https://wa.me/39..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                  />
                </div>
              </div>
            </div>

            {/* Upload immagine banner */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                <ImageIcon className="h-3 w-3 text-amber-300" />
                Immagine banner homepage
              </label>
              <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/20 bg-slate-950/80 p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black file:hover:brightness-110"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Consigliato un formato orizzontale (1200×500) per un impatto
                    visivo forte.
                  </span>
                  {bannerUploading && (
                    <span className="inline-flex items-center gap-1 text-cyan-300">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Upload...
                    </span>
                  )}
                </div>

                {bannerError && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
                    {bannerError}
                  </div>
                )}

                {bannerImageUrl && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
                    <img
                      src={bannerImageUrl}
                      alt="Anteprima banner evento"
                      className="block max-h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opzione: invio newsletter automatico */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <label className="inline-flex items-start gap-2 text-[11px] text-slate-200">
            <input
              type="checkbox"
              name="send_newsletter"
              className="mt-[2px] h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              defaultChecked
            />
            <span>
              Invia automaticamente una newsletter ai soci marketing usando{" "}
              <span className="font-semibold text-cyan-300">
                titolo, data, descrizione e immagine
              </span>{" "}
              di questo evento.
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
            Evento creato correttamente.
            {sentCount != null && (
              <span className="ml-1 text-emerald-300/90">
                Newsletter inviata a {sentCount} destinatari marketing.
              </span>
            )}
          </div>
        )}

        {/* Bottoni */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={sending}
            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(56,189,248,0.8)] hover:brightness-110 transition ${
              sending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Invio in corso...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Crea evento</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
