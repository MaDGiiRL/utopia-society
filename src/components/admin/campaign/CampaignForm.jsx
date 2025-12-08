// src/components/admin/campaign/CampaignForm.jsx
import {
  Send,
  Mail,
  CalendarDays,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function CampaignForm({
  onSubmit,
  loading,
  ok,
  error,
  recipientsCount,
}) {
  const { t } = useTranslation();

  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [channel, setChannel] = useState("email"); // "email" | "sms"

  const handleHeroChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroError("");
    setHeroUploading(true);

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
        throw new Error(data.message || "Errore upload immagine campagna");
      }

      // URL pubblico dal bucket "public-assets"
      setHeroImageUrl(data.url);
    } catch (err) {
      console.error("Errore upload immagine campagna:", err);
      setHeroError(
        err.message || "Errore durante l'upload dell'immagine campagna"
      );
      setHeroImageUrl("");
    } finally {
      setHeroUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title")?.toString().trim() || "",
      event_date: formData.get("event_date") || null,
      message_email: formData.get("message_email")?.toString() || "",
      hero_image_url: heroImageUrl || null, // URL pubblico per la newsletter
      channels: {
        email: channel === "email",
        sms: channel === "sms", // "sms" frontend = WhatsApp nel backend
      },
    };

    if (typeof onSubmit === "function") {
      onSubmit(payload, {
        reset: () => {
          e.currentTarget.reset();
          setHeroImageUrl("");
          setHeroError("");
          setChannel("email");
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dati evento */}
      <div className="grid gap-4 md:grid-cols-[2fr_1.1fr]">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <Sparkles className="h-3 w-3 text-cyan-300" />
            {t("admin.campaign.form.titleLabel")}
          </label>
          <input
            name="title"
            required
            placeholder={t("admin.campaign.form.titlePlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            <CalendarDays className="h-3 w-3 text-fuchsia-300" />
            {t("admin.campaign.form.dateLabel")}
          </label>
          <input
            type="date"
            name="event_date"
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
          />
        </div>
      </div>

      {/* Immagine hero */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
          <ImageIcon className="h-3 w-3 text-amber-300" />
          Immagine hero newsletter
        </label>

        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-950/80 p-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleHeroChange}
            className="text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black file:hover:brightness-110"
          />
          <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Puoi caricare un&apos;immagine che apparirà sotto al titolo della
              newsletter.
            </span>
            {heroUploading && (
              <span className="inline-flex items-center gap-1 text-cyan-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                Upload...
              </span>
            )}
          </div>

          {heroError && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
              {heroError}
            </div>
          )}

          {heroImageUrl && (
            <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
              <img
                src={heroImageUrl}
                alt="Anteprima immagine campagna"
                className="block max-h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Testo email */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
          <Mail className="h-3 w-3 text-cyan-300" />
          {t("admin.campaign.form.emailLabel")}
        </label>
        <textarea
          name="message_email"
          rows={6}
          placeholder={t("admin.campaign.form.emailPlaceholder")}
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
        />
        <p className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] text-slate-200">
            ?
          </span>
          {t("admin.campaign.form.emailHint", {
            namePlaceholder: "{{ nome }}",
            datePlaceholder: "{{ data_evento }}",
          })}
        </p>
      </div>

      {/* Canale: EMAIL o SMS / WhatsApp */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-xs">
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {t("admin.campaign.form.channelsLabel")}
        </span>

        <div className="flex flex-wrap gap-4">
          {/* Email */}
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="channel"
              value="email"
              checked={channel === "email"}
              onChange={() => setChannel("email")}
              className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
            />
            <span className="inline-flex items-center gap-1 uppercase tracking-[0.16em] text-slate-200">
              <Mail className="h-3 w-3 text-cyan-300" />
              {t("admin.campaign.form.channelEmail")}
            </span>
          </label>

          {/* SMS / WhatsApp */}
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="channel"
              value="sms"
              checked={channel === "sms"}
              onChange={() => setChannel("sms")}
              className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
            />
            <span className="inline-flex items-center gap-1 uppercase tracking-[0.16em] text-slate-200">
              <MessageCircle className="h-3 w-3 text-emerald-300" />
              WhatsApp
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
          {t("admin.campaign.state.success")}
          {recipientsCount != null && (
            <span className="ml-1 text-emerald-300/90">
              {t("admin.campaign.state.successRecipients", {
                count: recipientsCount,
              })}
            </span>
          )}
        </div>
      )}

      {/* Bottoni */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(56,189,248,0.8)] hover:brightness-110 transition ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t("admin.campaign.submit.sending")}</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>{t("admin.campaign.submit.send")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
