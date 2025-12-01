// src/components/gallery/GalleryHeader.jsx
import { useTranslation } from "react-i18next";

export default function GalleryHeader({ eventsCount, photosCount }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-400">
          {t("gallery.header.label")}
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          {t("gallery.header.title")}
        </h1>
        <p className="text-sm text-slate-300 max-w-xl">
          {t("gallery.header.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-[0.75rem] text-slate-400">
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1">
          {t("gallery.header.events", { count: eventsCount })}
        </span>
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1">
          {t("gallery.header.photos", { count: photosCount })}
        </span>
      </div>
    </div>
  );
}
