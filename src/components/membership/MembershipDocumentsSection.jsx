import { useTranslation } from "react-i18next";

export default function MembershipDocumentsSection({
  frontName,
  backName,
  frontPreview,
  backPreview,
  onFrontChange,
  onBackChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 border-t border-white/5 pt-4">
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
        {t("membership.sectionDocument")}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fronte */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/60 bg-slate-950/70 px-4 py-6 text-center text-xs text-slate-200 hover:border-cyan-300 transition">
          <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-cyan-300">
            {t("membership.docFrontTitle")}
          </span>
          {frontName && (
            <span className="mb-1 text-[0.65rem] text-cyan-200/90">
              {frontName}
            </span>
          )}
          <span className="text-[0.65rem] text-slate-400">
            {t("membership.docFrontSubtitle")}
          </span>
          <input
            id="cameraInputFronte"
            name="document_front"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            required
            onChange={onFrontChange}
          />
          {frontPreview && (
            <div className="mt-3 w-full max-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
              <img
                src={frontPreview}
                alt="Anteprima documento fronte"
                className="block w-full h-auto object-cover"
              />
            </div>
          )}
        </label>

        {/* Retro */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-fuchsia-400/60 bg-slate-950/70 px-4 py-6 text-center text-xs text-slate-200 hover:border-fuchsia-300 transition">
          <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-fuchsia-300">
            {t("membership.docBackTitle")}
          </span>
          {backName && (
            <span className="mb-1 text-[0.65rem] text-fuchsia-200/90">
              {backName}
            </span>
          )}
          <span className="text-[0.65rem] text-slate-400">
            {t("membership.docBackSubtitle")}
          </span>
          <input
            id="cameraInputRetro"
            name="document_back"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            required
            onChange={onBackChange}
          />
          {backPreview && (
            <div className="mt-3 w-full max-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
              <img
                src={backPreview}
                alt="Anteprima documento retro"
                className="block w-full h-auto object-cover"
              />
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
