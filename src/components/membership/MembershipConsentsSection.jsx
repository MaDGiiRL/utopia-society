import { useTranslation } from "react-i18next";

export default function MembershipConsentsSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 border-t border-white/5 pt-4">
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
        {t("membership.sectionConsents")}
      </p>

      <div className="space-y-2 text-xs text-slate-300">
        {/* Privacy */}
        <label className="flex items-start gap-2">
          <input
            id="accept_privacy"
            name="accept_privacy"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
          />
          <span>
            {t("membership.consentPrivacyPrefix")}
            <a
              href="/pdf/privacy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline"
            >
              {t("membership.consentPrivacyLink")}
            </a>
            .
          </span>
        </label>

        {/* Statuto */}
        <label className="flex items-start gap-2">
          <input
            id="accept_statute"
            name="accept_statute"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
          />
          <span>
            {t("membership.consentStatutePrefix")}
            <a
              href="/pdf/statuto.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline"
            >
              {t("membership.consentStatuteLink")}
            </a>
            .
          </span>
        </label>

        {/* Marketing opzionale */}
        <label className="flex items-start gap-2">
          <input
            id="accept_marketing"
            name="accept_marketing"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
          />
          <span>{t("membership.consentMarketing")}</span>
        </label>
      </div>
    </div>
  );
}
