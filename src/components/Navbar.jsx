import { NavLink, Link } from "react-router";
import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";

const navLinkClasses =
  "relative px-3 py-1 text-sm font-medium tracking-wide uppercase transition hover:text-cyan-300";

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/70 backdrop-blur border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
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

        {/* Links + Social */}
        <motion.div
          className="flex items-center gap-4 text-xs"
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
      </nav>
    </header>
  );
}

export default Navbar;
