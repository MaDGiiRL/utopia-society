import { motion, useMotionValue, useSpring } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";

function TiltCard({ title, color, text, idx }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(y, { stiffness: 120, damping: 16 });
  const rotateY = useSpring(x, { stiffness: 120, damping: 16 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // valori tra -1 e 1
    const normX = (offsetX - centerX) / centerX;
    const normY = (offsetY - centerY) / centerY;

    // ruota in base alla posizione del mouse
    x.set(normX * 10); // asse Y (rotazione orizzontale)
    y.set(-normY * 10); // asse X (rotazione verticale)
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
      style={{
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur group transform-gpu will-change-transform"
    >
      {/* bordo glow animato */}
      <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22),transparent_55%)]" />

      {/* highlight diagonale */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-20 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-24 transition duration-700" />

      <div className="relative">
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <p className="mt-2 text-xs text-slate-300">{text}</p>
      </div>
    </motion.div>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 m-5 min-h-[90vh]"
    >
      <div className="relative mx-auto max-w-5xl px-4">
        <motion.h2
          initial={{
            opacity: 0,
            y: 80,
            scale: 0.85,
            letterSpacing: "-0.05em",
          }}
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
            <TiltCard key={item.title} idx={idx} {...item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
