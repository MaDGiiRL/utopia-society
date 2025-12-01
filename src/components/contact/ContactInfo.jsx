import { motion } from "framer-motion";
import { fadeUp } from "../../utils/motionPresets";
import { Instagram, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";
import TikTokIcon from "../icons/TikTokIcon";
import SocialBox3D from "./SocialBox3D";

export default function ContactInfo() {
  const { t } = useTranslation();

  return (
    <motion.div {...fadeUp()}>
      <p className="mb-2 text-[0.7rem] uppercase tracking-[0.35em] text-cyan-300">
        {t("contact.badge")}
      </p>

      <motion.h2
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.9,
          letterSpacing: "0em",
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: "0.18em",
        }}
        transition={{
          duration: 1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.14em] uppercase"
      >
        {t("contact.title")}
      </motion.h2>

      <p className="mt-3 text-sm text-slate-300">{t("contact.description")}</p>

      <div className="mt-6 space-y-2 text-sm text-slate-300">
        <p>
          {t("contact.emailLabel")}:{" "}
          <span className="text-cyan-300">pd.utopia@gmail.com</span>
        </p>

        <p>
          Numero prenotazioni:{" "}
          <a
            href="tel:+393206703297"
            className="text-cyan-300 hover:text-cyan-200 transition"
          >
            320 670 3297
          </a>
        </p>
      </div>

      {/* Social box con scena 3D minimal */}
      <motion.div
        {...fadeUp(0.15)}
        className="relative mt-8 inline-flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-sm transform-gpu overflow-hidden"
        whileHover={{
          rotateX: -4,
          rotateY: 4,
          translateY: -6,
        }}
        transition={{ type: "spring", stiffness: 170, damping: 18 }}
      >
        <SocialBox3D />

        <div className="relative z-10">
          <span className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-300">
            {t("contact.socialTagline")}
          </span>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <motion.a
              href="https://www.instagram.com/utopia.society.pd"
              target="_blank"
              rel="noreferrer"
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-tr from-fuchsia-500 via-rose-500 to-amber-300 text-slate-50"
              whileHover={{
                scale: 1.08,
                rotate: 3,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Instagram className="relative z-10 h-5 w-5 drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
            </motion.a>

            <motion.a
              href="https://www.facebook.com/utopiasocietypd"
              target="_blank"
              rel="noreferrer"
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-tr from-sky-500 via-blue-500 to-indigo-500 text-slate-50"
              whileHover={{
                scale: 1.08,
                rotate: -3,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Facebook className="relative z-10 h-5 w-5 drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
            </motion.a>

            <motion.a
              href="https://www.tiktok.com/@utopiasocietypd"
              target="_blank"
              rel="noreferrer"
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-tr from-slate-100 via-slate-50 to-gray-200 text-slate-900"
              whileHover={{
                scale: 1.08,
                rotate: 2,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <TikTokIcon className="relative z-10 h-5 w-5 drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
            </motion.a>

            <div className="ml-1 max-w-[220px] text-[0.7rem] leading-relaxed text-slate-300">
              <p>{t("contact.socialLine1")}</p>
              <p className="text-[0.65rem] text-slate-400">
                {t("contact.socialLine2")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
