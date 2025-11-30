// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // se arrivi da AdminRoute, ti rimanda dove volevi andare
  const fromState = location.state?.from?.pathname;
  const from =
    fromState && fromState.startsWith("/admin") ? fromState : "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // IMPORTANTE per cookie
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Credenziali non valide");
      }

      // login ok -> AdminRoute chiamerà /api/admin/me e ti farà entrare
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Errore di login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-6 shadow-[0_0_28px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <div className="mb-5 text-center space-y-1.5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(56,189,248,0.9)]">
            <Lock className="h-5 w-5 text-slate-950" />
          </div>
          <h1 className="text-lg font-semibold tracking-[0.2em] uppercase text-slate-50">
            Admin
          </h1>
          <p className="text-[11px] text-slate-400">
            Accesso riservato allo staff Utopia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                className="flex-1 bg-transparent text-sm text-slate-50 outline-none border-none"
                placeholder="admin@utopia.club"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                required
                className="flex-1 bg-transparent text-sm text-slate-50 outline-none border-none"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-1 w-full rounded-full border border-cyan-400 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-500/30 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Accesso in corso..." : "Entra nell'area admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
