import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";

function AboutSection() {
  return (
    <section id="about" className="border-t border-white/10 bg-black/40 py-20">
      <div className="mx-auto max-w-5xl px-4">
        <motion.h2
          {...fadeUp()}
          className="text-center text-2xl font-semibold tracking-wide"
        >
          About{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Utopia
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-4 text-center text-sm text-slate-300 md:text-base"
        >
          Utopia è un club privato situato nel cuore della città. Un ambiente
          esclusivo, curato in ogni dettaglio, dove suoni elettronici,
          installazioni luminose e mixology di alto livello si fondono per
          creare un’esperienza unica.
        </motion.p>

        <motion.div
          {...fadeUp(0.15)}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur">
            <h3 className="text-sm font-semibold text-cyan-300">
              Atmosfera futuristica
            </h3>
            <p className="mt-2 text-xs text-slate-300">
              Luci al neon dinamiche, effetti visivi e scenografie immersive per
              farti dimenticare il mondo esterno.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur">
            <h3 className="text-sm font-semibold text-fuchsia-300">
              Musica selezionata
            </h3>
            <p className="mt-2 text-xs text-slate-300">
              DJ resident e guest internazionali con sonorità house, techno,
              elettronica e contaminazioni moderne.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur">
            <h3 className="text-sm font-semibold text-blue-300">
              Accesso riservato
            </h3>
            <p className="mt-2 text-xs text-slate-300">
              Ingresso solo per soci e accompagnatori registrati. Compila la
              domanda di ammissione online in pochi minuti.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
