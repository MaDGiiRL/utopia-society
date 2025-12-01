import { useState } from "react";
import { NavLink, Link } from "react-router";
import { motion } from "framer-motion";
import { Instagram, Facebook, Menu, X, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import TikTokIcon from "./icons/TikTokIcon";

const navLinkClasses =
  "relative px-3 py-1 text-sm font-medium tracking-wide uppercase transition hover:text-cyan-300";

const languages = [
  { code: "it", label: "IT", name: "Italiano", country: "IT" },
  { code: "en", label: "EN", name: "English", country: "GB" },
  { code: "ro", label: "RO", name: "Română", country: "RO" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const closeMenu = () => setIsOpen(false);

  const currentLang =
    languages.find((l) => l.code === i18n.resolvedLanguage) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-8 w-8 rounded-full bg-linear-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.8)] group-hover:scale-105 transition" />
            <span className="text-lg font-semibold tracking-[0.25em] uppercase text-white group-hover:text-cyan-300 transition">
              Utopia Society
            </span>
          </Link>
        </motion.div>

        {/* DESKTOP MENU */}
        <motion.div
          className="relative hidden items-center gap-4 text-xs md:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkClasses} ${
                isActive ? "text-cyan-300" : "text-slate-200"
              }`
            }
          >
            {t("nav.home")}
          </NavLink>

          {/* 👇 NUOVO LINK GALLERY */}
          <NavLink
            to="/gallery"
            className={({ isActive }) =>
              `${navLinkClasses} ${
                isActive ? "text-cyan-300" : "text-slate-200"
              }`
            }
          >
            {t("nav.gallery", "Gallery")}
          </NavLink>

          <NavLink
            to="/ammissione-socio"
            className={({ isActive }) =>
              `${navLinkClasses} ${
                isActive ? "text-cyan-300" : "text-slate-200"
              }`
            }
          >
            {t("nav.becomeMember")}
          </NavLink>

          {/* Admin DESKTOP */}
          <Link
            to="/admin/login"
            className="ml-2 flex items-center gap-1 text-[10px] text-white/40 hover:text-cyan-300 transition"
            title={t("nav.adminArea")}
          >
            <Lock className="h-3 w-3" />
            {t("nav.admin")}
          </Link>

          {/* LANGUAGE DROPDOWN */}
          <div className="relative ml-3">
            <button
              type="button"
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-[10px] text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
            >
              <ReactCountryFlag
                countryCode={currentLang.country}
                svg
                style={{ width: "1.1em", height: "0.9em" }}
              />
              <span>{currentLang.label}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/15 bg-black/90 p-1 text-[11px] text-slate-100 shadow-lg z-20">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-white/10 ${
                      lang.code === currentLang.code ? "text-cyan-300" : ""
                    }`}
                  >
                    <ReactCountryFlag
                      countryCode={lang.country}
                      svg
                      style={{ width: "1.1em", height: "0.9em" }}
                    />
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social */}
          <div className="ml-3 flex items-center gap-3 pl-3 border-l border-white/10">
            <a
              href="https://www.instagram.com/utopia.society.pd"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-fuchsia-300 transition"
            >
              <Instagram className="h-4 w-4" />
            </a>

            <a
              href="https://www.facebook.com/utopiasocietypd"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition"
            >
              <Facebook className="h-4 w-4" />
            </a>

            <a
              href="https://www.tiktok.com/@utopiasocietypd"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* MOBILE MENU BUTTON */}
        <motion.button
          type="button"
          className="relative z-10 flex items-center justify-center rounded-full border border-white/15 bg-black/60 p-2 text-slate-100 shadow-md backdrop-blur md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </motion.button>
      </nav>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <motion.div
          className="relative md:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="border-t border-white/10 bg-black/90 backdrop-blur px-4 pb-4 pt-2">
            <div className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-100">
              <NavLink to="/" onClick={closeMenu} className="py-2">
                {t("nav.home")}
              </NavLink>

              {/* 👇 NUOVO LINK GALLERY MOBILE */}
              <NavLink to="/gallery" onClick={closeMenu} className="py-2">
                {t("nav.gallery", "Gallery")}
              </NavLink>

              <NavLink
                to="/ammissione-socio"
                onClick={closeMenu}
                className="py-2"
              >
                {t("nav.becomeMember")}
              </NavLink>

              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="mt-3 flex items-center gap-1 text-[11px] text-white/40 hover:text-cyan-300 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                {t("nav.adminArea")}
              </Link>

              {/* LANGUAGES MOBILE */}
              <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3 text-[11px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center gap-2 rounded-full border border-white/15 px-2 py-1 ${
                      lang.code === currentLang.code
                        ? "bg-white/10 text-cyan-300"
                        : "text-slate-200"
                    }`}
                  >
                    <ReactCountryFlag
                      countryCode={lang.country}
                      svg
                      style={{ width: "1.2em", height: "1em" }}
                    />
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>

              {/* SOCIAL MOBILE */}
              <div className="mt-3 flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="https://www.instagram.com/utopia.society.pd"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-fuchsia-300 transition"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-[0.7rem]">@utopia.society.pd</span>
                </a>

                <a
                  href="https://www.facebook.com/utopiasocietypd"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="text-[0.7rem]">/utopiasocietypd</span>
                </a>

                <a
                  href="https://www.tiktok.com/@utopiasocietypd"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition"
                >
                  <TikTokIcon className="h-4 w-4" />
                  <span className="text-[0.7rem]">@utopiasocietypd</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export default Navbar;
