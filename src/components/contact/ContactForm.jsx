import { motion } from "framer-motion";
import { fadeUp } from "../../utils/motionPresets";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";

export default function ContactForm({ sending, ok, error, onSubmit }) {
  const { t } = useTranslation();

  return (
    <motion.form
      {...fadeUp(0.1)}
      className="space-y-4 rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur transform-gpu"
      onSubmit={onSubmit}
      whileHover={{
        rotateX: -3,
        rotateY: -3,
        translateY: -6,
      }}
      transition={{ type: "spring", stiffness: 170, damping: 20 }}
    >
      <div>
        <label className="text-xs uppercase tracking-wide text-slate-300">
          {t("contact.formNameLabel")}
        </label>
        <input
          name="name"
          type="text"
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          placeholder={t("contact.formNamePlaceholder")}
          required
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-slate-300">
          {t("contact.formEmailLabel")}
        </label>
        <input
          name="email"
          type="email"
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          placeholder={t("contact.formEmailPlaceholder")}
          required
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-slate-300">
          {t("contact.formPhoneLabel")}
        </label>
        <input
          name="phone"
          type="tel"
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          placeholder={t("contact.formPhonePlaceholder")}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-slate-300">
          {t("contact.formMessageLabel")}
        </label>
        <textarea
          name="message"
          rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
          placeholder={t("contact.formMessagePlaceholder")}
          required
        />
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
          {t("contact.formSuccess")}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={sending}
        className={`w-full rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:brightness-110 transition ${
          sending ? "opacity-60 cursor-not-allowed" : ""
        }`}
        whileTap={{ scale: sending ? 1 : 0.96 }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Send className="h-3.5 w-3.5" />
          {sending ? t("contact.submitSending") : t("contact.submitIdle")}
        </span>
      </motion.button>
    </motion.form>
  );
}
