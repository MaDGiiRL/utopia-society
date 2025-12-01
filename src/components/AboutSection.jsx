
import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { useTranslation } from "react-i18next";
import TiltCard from "./about/TiltCard";

function AboutSection() {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("about.card1Title"),
      color: "text-cyan-300",
      text: t("about.card1Text"),
    },
    {
      title: t("about.card2Title"),
      color: "text-fuchsia-300",
      text: t("about.card2Text"),
    },
    {
      title: t("about.card3Title"),
      color: "text-blue-300",
      text: t("about.card3Text"),
    },
  ];

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
          {t("about.title", "About")}{" "}
          <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(236,72,153,0.45)]">
            Utopia
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-10 text-center text-sm text-slate-300 md:text-base"
        >
          {t("about.paragraph")}
        </motion.p>

        <motion.div
          {...fadeUp(0.15)}
          className="mt-20 grid gap-6 md:grid-cols-3 perspective-distant-[1200px]"
        >
          {cards.map((item, idx) => (
            <TiltCard key={item.title} idx={idx} {...item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
