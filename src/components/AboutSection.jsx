import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";

function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 m-5 min-h-[90vh] "
    >
      {/* Contenuto */}
      <div className="relative mx-auto max-w-5xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 80, scale: 0.85, letterSpacing: "-0.05em" }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            letterSpacing: "0.25em",
          }}
          transition={{
            duration: 1.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-center font-semibold uppercase text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] leading-tight"
        >
          About{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.45)]">
            Utopia
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-10 text-center text-sm text-slate-300 md:text-base"
        >
          Utopia è un club privato situato nel cuore della città. Un ambiente
          esclusivo, curato in ogni dettaglio, dove suoni elettronici,
          installazioni luminose e mixology di alto livello si fondono per
          creare un’esperienza unica.
        </motion.p>

        <motion.div
          {...fadeUp(0.15)}
          className="mt-20 grid gap-6 md:grid-cols-3 perspective-[1200px]"
        >
          {[
            {
              title: "Atmosfera futuristica",
              color: "text-cyan-300",
              text: "Luci al neon, laser e una scenografia digitale che trasforma la pista in un dancefloor virtuale.",
            },
            {
              title: "Musica selezionata",
              color: "text-fuchsia-300",
              text: "DJ resident e guest internazionali con sonorità house, techno, elettronica e contaminazioni moderne.",
            },
            {
              title: "Accesso riservato",
              color: "text-blue-300",
              text: "Ingresso solo per soci e accompagnatori registrati. Compila la domanda di ammissione online in pochi minuti.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                rotateX: -6,
                rotateY: 4,
              }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur group transform-gpu"
            >
              {/* bordo glow animato */}
              <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22),transparent_55%)]" />

              {/* highlight diagonale */}
              <div className="pointer-events-none absolute -inset-x-10 -top-10 h-20 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-24 transition duration-700" />

              <div className="relative">
                <h3 className={`text-sm font-semibold ${item.color}`}>
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
