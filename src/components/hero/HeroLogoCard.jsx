import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HeroLogoCard({ style }) {
  const { t } = useTranslation();

  return (
    <motion.div style={style} className="flex-1 flex justify-center">
      <div className="relative h-72 w-72 rounded-[2.5rem] border border-cyan-300/40 bg-linear-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] overflow-hidden">
        {/* LOGO ANIMATO */}
        <motion.img
          src="/img/logo-nobg.png"
          alt="Utopia Logo"
          className="absolute inset-0 m-auto w-100 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]"
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


      </div>
    </motion.div>
  );
}
