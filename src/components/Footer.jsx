import { motion } from "framer-motion";
import { Link } from "react-router";
import { Instagram, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";
import TikTokIcon from "./icons/TikTokIcon";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black/70 backdrop-blur py-8">
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Top: 3 colonne */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] items-start">
          {/* Colonna 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <Link to="/" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-full bg-linear-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.8)] group-hover:scale-105 transition" />
              <span className="text-lg font-semibold tracking-[0.25em] uppercase text-slate-100 group-hover:text-cyan-300 transition">
                Utopia Society
              </span>
            </Link>

            <p className="text-[0.75rem] text-slate-400 max-w-xs">
              {t("footer.tagline")}
            </p>

            <p className="text-[0.75rem] text-slate-300">
              {t("footer.bookingNumberLabel")}{" "}
              <a
                href="tel:+393206703297"
                className="text-cyan-300 hover:text-cyan-200 transition"
              >
                320 670 3297
              </a>
            </p>
          </motion.div>

          {/* Colonna 2: link rapidi */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-3 text-[0.8rem]"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("footer.linksTitle")}
            </h3>

            <div className="flex flex-col gap-1 text-slate-400">
              <Link
                to="/"
                className="hover:text-cyan-300 transition text-xs uppercase tracking-wide"
              >
                {t("footer.home")}
              </Link>

              <Link
                to="/gallery"
                className="hover:text-cyan-300 transition text-xs uppercase tracking-wide"
              >
                {t("footer.gallery")}
              </Link>

              <Link
                to="/ammissione-socio"
                className="hover:text-cyan-300 transition text-xs uppercase tracking-wide"
              >
                {t("footer.becomeMember")}
              </Link>
            </div>

            <div className="pt-3 text-[0.7rem] leading-relaxed text-slate-500">
              <p>{t("footer.addressLine1")}</p>
              <p>{t("footer.vatLine")}</p>
            </div>
          </motion.div>

          {/* Colonna 3: social */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 text-[0.8rem] md:text-right"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("footer.followUs")}
            </h3>

            <div className="flex md:justify-end gap-4">
              <a
                href="https://www.instagram.com/utopia.society.pd"
                className="text-slate-400 hover:text-fuchsia-300 transition"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://www.facebook.com/utopiasocietypd"
                className="text-slate-400 hover:text-cyan-300 transition"
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href="https://www.tiktok.com/@utopiasocietypd"
                className="text-slate-400 hover:text-cyan-300 transition"
                target="_blank"
                rel="noreferrer"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="mt-6 border-t border-white/10" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-3 flex flex-col gap-2 text-[0.65rem] text-slate-400 md:flex-row md:items-center md:justify-between"
        >
          <p className="text-center md:text-left">
            {t("footer.copyright", { year })} —{" "}
            <span className="text-slate-500">{t("footer.rights")}</span>
          </p>

          <p className="text-center md:text-right">
            {t("footer.developedWith")}{" "}
            <span className="text-fuchsia-400">❤️</span> {t("footer.by")}{" "}
            <a
              href="https://www.linkedin.com/in/sofia-vidotto-junior-developer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 transition"
            >
              MaDGiiRL
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
