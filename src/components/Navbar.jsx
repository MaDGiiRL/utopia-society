import { useState } from "react";
import { NavLink, Link } from "react-router";
import { motion } from "framer-motion";
import { Instagram, Facebook, Menu, X } from "lucide-react";

const navLinkClasses =
  "relative px-3 py-1 text-sm font-medium tracking-wide uppercase transition hover:text-cyan-300";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* LOGO - CLICCABILE */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.8)] group-hover:scale-105 transition" />
            <span className="text-lg font-semibold tracking-[0.25em] uppercase text-white group-hover:text-cyan-300 transition">
              Utopia
            </span>
          </Link>
        </motion.div>

        {/* DESKTOP: Links + Social */}
        <motion.div
          className="relative hidden items-center gap-4 text-xs md:flex"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Nav Links */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkClasses} ${
                isActive ? "text-cyan-300" : "text-slate-200"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/ammissione-socio"
            className={({ isActive }) =>
              `${navLinkClasses} ${
                isActive ? "text-cyan-300" : "text-slate-200"
              }`
            }
          >
            Diventa socio
          </NavLink>

          {/* Social Icons */}
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
              href="https://www.facebook.com/utopiasociety.pd"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-300 transition"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* MOBILE: Hamburger */}
        <motion.button
          type="button"
          className="relative z-10 flex items-center justify-center rounded-full border border-white/15 bg-black/60 p-2 text-slate-100 shadow-md backdrop-blur md:hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </motion.button>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <motion.div
          className="relative md:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="border-t border-white/10 bg-black/90 backdrop-blur px-4 pb-4 pt-2">
            <div className="flex flex-col gap-2 text-xs uppercase tracking-wide text-slate-100">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `py-2 ${isActive ? "text-cyan-300" : "text-slate-200"}`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/ammissione-socio"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `py-2 ${isActive ? "text-cyan-300" : "text-slate-200"}`
                }
              >
                Diventa socio
              </NavLink>

              <div className="mt-2 flex items-center gap-4 border-t border-white/10 pt-3">
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
                  href="https://www.facebook.com/utopiasociety.pd"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-cyan-300 transition"
                >
                  <Facebook className="h-4 w-4" />
                  <span className="text-[0.7rem]">/utopiasociety.pd</span>
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
