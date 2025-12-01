import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { useTranslation } from "react-i18next";

function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const cardOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center"
    >
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-24 pt-24 md:flex-row md:pt-24">
        <motion.div
          {...fadeUp()}
          style={{ y: titleY, opacity: titleOpacity }}
          className="flex-1 text-center md:text-left space-y-5"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            {t("hero.tagline")}
          </p>

          {/* TITOLONE ANIMATO ALLO SCROLL */}
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
            {t("hero.title")}
          </motion.h1>

          <p className="max-w-xl text-sm text-slate-300 md:text-base">
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

        <motion.div
          {...fadeUp(0.2)}
          style={{
            y: cardY,
            scale: cardScale,
            opacity: cardOpacity,
          }}
          className="flex-1 flex justify-center"
        >
          <div className="relative h-72 w-72 rounded-[2.5rem] border border-cyan-300/40 bg-linear-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] overflow-hidden">
            {/* LOGO ANIMATO */}
            <motion.img
              src="/img/logo-small.png"
              alt="Utopia Logo"
              className="absolute inset-0 m-auto w-40 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]"
              animate={{
                x: [0, -10, 8, -6, 0],
                y: [0, -8, 6, -4, 0],
                rotate: [0, 2, -2, 1, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Glow di sfondo */}
            <div className="h-full w-full rounded-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.65),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.6),transparent_55%)]" />

            <span className="absolute bottom-5 left-6 text-xs font-medium tracking-[0.2em] uppercase text-slate-200">
              {t("hero.scheduleDays")}
            </span>
            <span className="absolute bottom-5 right-8 text-xs text-cyan-200">
              {t("hero.scheduleTime")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
