import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import HeroTitle from "./hero/HeroTitle";
import HeroLogoCard from "./hero/HeroLogoCard";

function HeroSection() {
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
        {/* Colonna testo */}
        <motion.div {...fadeUp()}>
          <HeroTitle style={{ y: titleY, opacity: titleOpacity }} />
        </motion.div>

        {/* Colonna logo/card */}
        <motion.div {...fadeUp(0.2)}>
          <HeroLogoCard
            style={{
              y: cardY,
              scale: cardScale,
              opacity: cardOpacity,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
