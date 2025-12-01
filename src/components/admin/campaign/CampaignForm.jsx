import {
  Send,
  Mail,
  MessageCircle,
  CalendarDays,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CampaignForm({
  onSubmit,
  loading,
  ok,
  error,
  recipientsCount,
}) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      {/* Testo SMS */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
          <MessageCircle className="h-3 w-3 text-emerald-300" />
          {t("admin.campaign.form.smsLabel")}
        </label>
        <textarea
          name="message_sms"
          rows={3}
          maxLength={300}
          placeholder={t("admin.campaign.form.smsPlaceholder")}
          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
        />
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>{t("admin.campaign.form.smsHint")}</span>
        </div>
      </div>

      {/* Canali */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-xs">
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {t("admin.campaign.form.channelsLabel")}
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
              {t("admin.campaign.form.channelEmail")}
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
              {t("admin.campaign.form.channelSms")}
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
