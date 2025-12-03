// src/components/admin/AdminLoginForm.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminLogin } from "../../api/admin";

export default function AdminLoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fromState = location.state?.from?.pathname;
  const from =
    fromState && fromState.startsWith("/admin") ? fromState : "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      await adminLogin({ email: normalizedEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const fallback = t("admin.login.errorGeneric");
      const msg = err.response?.data?.message || fallback;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-350 flex items-center justify-center px-4 py-6 sm:py-10">
      {/* sfondo glow dietro la card */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-cyan-500/5 via-fuchsia-500/3 to-slate-950" />
      <div className="pointer-events-none fixed inset-x-0 -z-10 top-1/4 flex justify-center">
        <div className="h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Piccolo badge sopra la card */}
        <div className="mb-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="uppercase tracking-[0.18em]">
              {t("admin.login.badge", "Reserved area · Utopia Club")}
            </span>
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-5 py-6 shadow-[0_0_28px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:px-6 sm:py-7">
          {/* header card */}
          <div className="mb-6 space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-cyan-400 to-emerald-400 shadow-[0_0_22px_rgba(56,189,248,0.8)]">
              <Lock className="h-5 w-5 text-slate-950" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold tracking-[0.22em] uppercase text-slate-50">
              {t("admin.login.title")}
            </h1>
            <p className="text-[11px] text-slate-400">
              {t("admin.login.subtitle")}
            </p>
            <p className="text-[10px] text-slate-500">
              ✨{" "}
              {t(
                "admin.login.funHint",
                "Enter your administrator credentials. No spam, only super-powers."
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                {t("admin.login.emailLabel")}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 focus-within:border-cyan-400/80">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="flex-1 bg-transparent text-sm text-slate-50 outline-none border-none placeholder:text-slate-500"
                  placeholder={t("admin.login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                {t("admin.login.passwordLabel")}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 focus-within:border-cyan-400/80">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  className="flex-1 bg-transparent text-sm text-slate-50 outline-none border-none placeholder:text-slate-500"
                  placeholder={t("admin.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                🔐{" "}
                {t(
                  "admin.login.passwordHint",
                  "Keep it safe, don’t share it in group chats."
                )}
              </p>
            </div>

            {/* Error box */}
            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-1 w-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_0_26px_rgba(56,189,248,0.85)] transition hover:brightness-110 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? t("admin.login.submitting") : t("admin.login.submit")}
            </button>
          </form>

          {/* Piccola nota in basso */}
          <div className="mt-4 text-center text-[10px] text-slate-500">
            {t(
              "admin.login.footerHint",
              "Access reserved to Utopia staff. If you shouldn't be here… you probably shouldn't be here 😄"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
