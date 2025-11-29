// src/components/HeroSection.jsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";

function HeroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"], // quando esce dall'hero
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_60%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-24 pt-24 md:flex-row md:pt-24">
        <motion.div
          {...fadeUp()}
          style={{ y: titleY, opacity: titleOpacity }}
          className="flex-1 text-center md:text-left space-y-5"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Night Club • Members Only
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Benvenuto in{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Utopia
            </span>
            .
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Un club privato dove luci, musica e design futuristico si
            incontrano. Accesso riservato ai soci, esperienze fuori dal
            quotidiano.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <a
              href="/ammissione-socio"
              className="inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_25px_rgba(56,189,248,0.75)] hover:brightness-110 transition"
            >
              Diventa socio
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
          <div className="relative h-72 w-72 rounded-[2.5rem] border border-cyan-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] overflow-hidden">
            {/* LOGO ANIMATO (resta) */}
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
              Friday / Saturday
            </span>
            <span className="absolute bottom-5 right-8 text-xs text-cyan-200">
              23:30 – Late
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
