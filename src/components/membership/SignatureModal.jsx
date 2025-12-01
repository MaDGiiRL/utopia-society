import { useTranslation } from "react-i18next";

export default function SignatureModal({
  isOpen,
  canvasRef,
  onClear,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/95 p-4 text-xs text-slate-100 shadow-xl">
        <h2 className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-slate-200">
          {t("membership.signatureTitle", "Firma la domanda")}
        </h2>
        <p className="mb-3 text-[0.7rem] text-slate-400">
          {t(
            "membership.signatureDescription",
            "Firma all'interno del riquadro utilizzando il mouse o il dito (su mobile)."
          )}
        </p>

        <div className="mb-3 overflow-hidden rounded-xl border border-white/15 bg-slate-900/80">
          <canvas
            ref={canvasRef}
            width={500}
            height={220}
            className="block w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300 hover:border-amber-400 hover:text-amber-300"
          >
            {t("membership.signatureClear", "Cancella")}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300 hover:border-rose-400 hover:text-rose-300"
            >
              {t("membership.signatureCancel", "Annulla")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-black"
            >
              {t("membership.signatureConfirm", "Conferma")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
