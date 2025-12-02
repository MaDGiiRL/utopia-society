import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function MembershipSubmitRow({
  loading,
  submitLabel,
  submitLoadingLabel,
  onOpenSignature, // ✅ nuovo prop
  signatureLabel, // ✅ testo bottone firma
}) {
  return (
    <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <motion.button
        id="btnSubmit"
        type="submit"
        disabled={loading}
        className={`w-full sm:w-auto rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_40px_rgba(56,189,248,0.9)] hover:brightness-110 transition ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
        whileTap={{ scale: loading ? 1 : 0.96 }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Send
            className={`h-4 w-4 transition ${
              loading ? "animate-pulse" : "opacity-100"
            }`}
          />
          <span>{loading ? submitLoadingLabel : submitLabel}</span>
        </span>
      </motion.button>

      {onOpenSignature && (
        <button
          type="button"
          onClick={onOpenSignature}
          className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-300 hover:text-cyan-300 underline decoration-dotted"
        >
          {signatureLabel || "Firma digitalmente"}
        </button>
      )}
    </div>
  );
}
