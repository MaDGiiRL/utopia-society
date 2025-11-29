import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { Instagram, Facebook } from "lucide-react"; // 👈 qui lucide

function ContactSection() {
  return (
    <section id="contact" className=" py-16">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-[1.1fr_1fr]">
        {/* Testo + social */}
        <motion.div {...fadeUp()}>
          <h2 className="text-xl font-semibold">Contattaci</h2>
          <p className="mt-3 text-sm text-slate-300">
            Per info su tavoli, eventi privati o partnership compila il form. Ti
            risponderemo il prima possibile.
          </p>

          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>
              Email:{" "}
              <span className="text-cyan-300">info@utopia-nightclub.it</span>
            </p>
          </div>

          {/* Social futuristici */}
          <motion.div
            {...fadeUp(0.15)}
            className="mt-8 inline-flex flex-col gap-3 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black p-4 shadow-[0_0_25px_rgba(56,189,248,0.5)]"
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
                  scale: 1.1,
                  rotate: 3,
                  boxShadow: "0 0 28px rgba(244,114,182,0.95)",
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
                  scale: 1.1,
                  rotate: -3,
                  boxShadow: "0 0 28px rgba(59,130,246,0.95)",
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

        {/* Form contatti */}
        <motion.form
          {...fadeUp(0.1)}
          className="space-y-4 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
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
          <button
            type="submit"
            className="w-full rounded-full text-white bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:brightness-110 transition"
          >
            Invia
          </button>
        </motion.form>
      </div>
    </section>
  );
}

export default ContactSection;
