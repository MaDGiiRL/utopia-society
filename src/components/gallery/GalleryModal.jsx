import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function GalleryModal({
  open,
  event,
  imageIndex,
  onClose,
  onPrev,
  onNext,
}) {
  if (!open || !event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-rose-400 hover:text-rose-300 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-black">
          <img
            src={`/events/${event.slug}/${imageIndex + 1}.jpg`}
            alt={`${event.title} fullscreen ${imageIndex + 1}`}
            className="h-full w-full object-contain bg-black"
          />

          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 right-3 rounded-full bg-black/70 px-3 py-1 text-[0.7rem] text-slate-100 border border-white/25">
            {event.title} · #{imageIndex + 1}
          </div>
        </div>
      </div>
    </div>
  );
}
