import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { Instagram, Facebook } from "lucide-react";

function ContactSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax leggero del glow di sfondo e delle card
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [20, -10]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 0.5]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden py-20 min-h-[90vh] "
    >
      {/* Glow dinamico di sfondo */}
      <motion.div
        style={{ y: bgY, opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0"
      />

      <div className="relative mx-auto max-w-5xl px-4">
        <motion.div
          style={{ y: cardsY }}
          className="grid gap-10 md:grid-cols-[1.1fr_minmax(0,1fr)] items-start"
        >
          {/* Testo + social */}
          <motion.div {...fadeUp()}>
            <p className="text-[0.7rem] uppercase tracking-[0.35em] text-cyan-300 mb-2">
              Contact • Utopia
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">Contattaci</h2>
            <p className="mt-3 text-sm text-slate-300">
              Per info su tavoli, eventi privati o partnership compila il form. Ti
              risponderemo il prima possibile.
            </p>

            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p>
                Email:{" "}
                <span className="text-cyan-300">
                  info@utopia-nightclub.it
                </span>
              </p>
            </div>

            {/* Social futuristici con tilt */}
            <motion.div
              {...fadeUp(0.15)}
              className="mt-8 inline-flex flex-col gap-3 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black p-4 shadow-[0_0_25px_rgba(56,189,248,0.4)] transform-gpu"
              whileHover={{
                rotateX: -6,
                rotateY: 4,
                translateY: -6,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
            >
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-300">
                Follow Utopia
              </span>

              <div className="flex items-center gap-4">
                {/* Insta */}
                <motion.a
                  href="https://www.instagram.com/utopia.society.pd"
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-300 text-slate-50 shadow-[0_0_18px_rgba(244,114,182,0.7)]"
                  whileHover={{
                    scale: 1.12,
                    rotate: 4,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="pointer-events-none absolute inset-[-30%] opacity-40 bg-[conic-gradient(from_180deg,_rgba(15,23,42,0)_0deg,_rgba(15,23,42,0.9)_120deg,_rgba(15,23,42,0)_240deg)] animate-[spin_4s_linear_infinite]" />
                  <Instagram className="relative z-10 h-5 w-5" />
                </motion.a>

                {/* Facebook */}
                <motion.a
                  href="https://www.facebook.com/utopiasociety.pd"
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 text-slate-50 shadow-[0_0_18px_rgba(59,130,246,0.7)]"
                  whileHover={{
                    scale: 1.12,
                    rotate: -4,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="pointer-events-none absolute inset-[-30%] opacity-40 bg-[radial-gradient(circle_at_10%_0%,rgba(191,219,254,0.9),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(30,64,175,0.85),transparent_55%)] animate-pulse" />
                  <Facebook className="relative z-10 h-5 w-5" />
                </motion.a>

                <div className="ml-1 text-[0.7rem] leading-relaxed text-slate-300">
                  <p>Scopri lineup, eventi speciali</p>
                  <p className="text-[0.65rem] text-slate-400">
                    Story, reel e aggiornamenti in tempo reale.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Form contatti con effetto 3D */}
          <motion.form
            {...fadeUp(0.1)}
            style={{ y: cardsY }}
            className="space-y-4 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur transform-gpu"
            onSubmit={(e) => e.preventDefault()}
            whileHover={{
              rotateX: -4,
              rotateY: -4,
              translateY: -6,
            }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            <div className="relative">
              {/* bordino glow animato */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Nome
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Il tuo nome"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="name@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Messaggio
              </label>
              <textarea
                rows="4"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Scrivici per info su tavoli, eventi o membership..."
                required
              />
            </div>
            <motion.button
              type="submit"
              className="w-full rounded-full text-white bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:brightness-110 transition"
              whileTap={{ scale: 0.96 }}
            >
              Invia
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
