export default function GalleryGrid({ events, onImageClick }) {
  if (!events.length) {
    return (
      <p className="mt-6 text-sm text-slate-400">
        Nessun evento trovato con i filtri selezionati.
      </p>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {events.map((ev, eventIndex) =>
        Array.from({ length: ev.imagesCount }).map((_, imageIndex) => (
          <button
            key={`${ev.slug}-${imageIndex}`}
            type="button"
            onClick={() => onImageClick(eventIndex, imageIndex)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 hover:border-cyan-400/70 transition"
          >
            <img
              src={`/events/${ev.slug}/${imageIndex + 1}.jpg`}
              alt={`${ev.title} photo ${imageIndex + 1}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-2 pb-1 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
              <span className="text-[0.65rem] text-slate-100">{ev.title}</span>
              <span className="text-[0.65rem] text-slate-200/80">
                #{imageIndex + 1}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
