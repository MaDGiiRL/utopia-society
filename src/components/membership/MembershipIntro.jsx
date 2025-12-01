import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import { fadeUp } from "../../utils/motionPresets";

export default function MembershipIntro() {
  const { t } = useTranslation();

  return (
    <motion.div {...fadeUp()} className="space-y-6 text-center lg:text-left">
      <p className="text-[0.7rem] uppercase tracking-[0.4em] text-cyan-300">
        {t("membership.badge")}
      </p>

      <motion.h1
        initial={{
          opacity: 0,
          y: 60,
          scale: 0.9,
          letterSpacing: "0.05em",
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: "0.22em",
        }}
        transition={{
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.18em] uppercase"
      >
        <Trans
          i18nKey="membership.title"
          components={{
            strong: (
              <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent" />
            ),
          }}
        />
      </motion.h1>

      <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto lg:mx-0">
        {t("membership.description")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start text-[0.7rem]">
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 uppercase tracking-[0.2em] text-cyan-200">
          {t("membership.stepBadge")}
        </span>
        <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1 uppercase tracking-[0.18em] text-fuchsia-200">
          {t("membership.stepLabel")}
        </span>
      </div>

      <div className="hidden md:flex flex-col gap-2 text-[0.75rem] text-slate-300 pt-4 border-t border-white/10 max-w-md lg:max-w-none">
        <p className="uppercase tracking-[0.22em] text-slate-400">
          {t("membership.needTitle")}
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-200">
          <li>{t("membership.needItem1")}</li>
          <li>{t("membership.needItem2")}</li>
          <li>{t("membership.needItem3")}</li>
        </ul>
      </div>
    </motion.div>
  );
}
