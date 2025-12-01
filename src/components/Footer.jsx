import { motion } from "framer-motion";
import { Link } from "react-router";
import { Instagram, Facebook } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10  bg-black/70 backdrop-blur py-10">
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* LOGO CLICCABILE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2"
          >
            <Link to="/" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-full bg-linear-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.8)] group-hover:scale-105 transition" />
              <span className="text-lg font-semibold tracking-[0.25em] uppercase text-slate-100 group-hover:text-cyan-300 transition">
                Utopia
              </span>
            </Link>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-wide text-slate-400"
          >
            <Link to="/" className="hover:text-cyan-300 transition">
              {t("footer.home")}
            </Link>

            <Link
              to="/ammissione-socio"
              className="hover:text-cyan-300 transition"
            >
              {t("footer.becomeMember")}
            </Link>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <a
              href="https://www.instagram.com/utopia.society.pd"
              className="text-slate-400 hover:text-fuchsia-300 transition"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="h-5 w-5" />
            </a>

            <a
              href="https://www.facebook.com/utopiasociety.pd"
              className="text-slate-400 hover:text-cyan-300 transition"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-center space-y-1"
        >
          <p className="text-[0.7rem] text-slate-300">
            {t("footer.copyright", { year })} —{" "}
            <span className="text-slate-400">{t("footer.rights")}</span>
          </p>

          <p className="text-[0.65rem] text-slate-400">
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
