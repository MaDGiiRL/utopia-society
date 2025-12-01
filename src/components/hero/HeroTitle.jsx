import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HeroTitle({ style }) {
  const { t } = useTranslation();

  return (
    <motion.div
      style={style}
      className="flex-1 text-center md:text-left space-y-5"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
        {t("hero.tagline")}
      </p>

      <motion.h1
        initial={{ opacity: 0, y: 60, scale: 0.9, letterSpacing: "0em" }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: "0.18em",
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-4xl md:text-5xl lg:text-7xl font-semibold leading-tight tracking-[0.15em] uppercase"
      >
        {t("hero.title")}{" "}
        <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.45)]">
          Utopia
        </span>
        .
      </motion.h1>

      <p className="max-w-xl text-sm text-slate-300 md:text-base mx-auto md:mx-0">
        {t("hero.description")}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
        <a
          href="/ammissione-socio"
          className="inline-flex items-center justify-center rounded-full text-black bg-linear-to-r from-cyan-400 to-fuchsia-500 px-6 py-2 text-xl font-semibold uppercase tracking-wide shadow-[0_0_25px_rgba(56,189,248,0.75)] hover:brightness-110 transition"
        >
          {t("hero.cta")}
        </a>
      </div>
    </motion.div>
  );
}
