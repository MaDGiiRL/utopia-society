// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { events } from "../data/eventsGallery";
import GalleryHeader from "../components/gallery/GalleryHeader";
import GalleryFilters from "../components/gallery/GalleryFilters";

export default function GalleryPage() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("az");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventIndex, setModalEventIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // eventi filtrati + ordinati
  const filteredSortedEvents = useMemo(() => {
    let list = [...events];

    if (filter !== "all") {
      list = list.filter((ev) => ev.tags?.includes(filter));
    }

    list.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      return 0;
    });

    return list;
  }, [filter, sort]);

  // immagini flatten delle card filtrate
  const flatImages = useMemo(() => {
    const result = [];
    filteredSortedEvents.forEach((ev, eventIndex) => {
      for (let i = 0; i < ev.imagesCount; i++) {
        result.push({
          eventIndex,
          imageIndex: i,
          slug: ev.slug,
          title: ev.title,
        });
      }
    });
    return result;
  }, [filteredSortedEvents]);

  const openModal = (eventIndex, imageIndex) => {
    setModalEventIndex(eventIndex);
    setModalImageIndex(imageIndex);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const currentEvent = filteredSortedEvents[modalEventIndex];

  const showPrevImage = () => {
    if (!currentEvent || !filteredSortedEvents.length) return;

    if (modalImageIndex > 0) {
      setModalImageIndex((prev) => prev - 1);
      return;
    }

    const prevEventIndex =
      (modalEventIndex - 1 + filteredSortedEvents.length) %
      filteredSortedEvents.length;
    const prevEvent = filteredSortedEvents[prevEventIndex];
    setModalEventIndex(prevEventIndex);
    setModalImageIndex(prevEvent.imagesCount - 1);
  };

  const showNextImage = () => {
    if (!currentEvent || !filteredSortedEvents.length) return;

    if (modalImageIndex < currentEvent.imagesCount - 1) {
      setModalImageIndex((prev) => prev + 1);
      return;
    }

    const nextEventIndex = (modalEventIndex + 1) % filteredSortedEvents.length;
    setModalEventIndex(nextEventIndex);
    setModalImageIndex(0);
  };

  // chiudi modal quando cambiano filtro/sort
  useEffect(() => {
    setModalOpen(false);
    setModalEventIndex(0);
    setModalImageIndex(0);
  }, [filter, sort]);

  // tastiera nel modal
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, modalEventIndex, modalImageIndex, currentEvent]);

  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-6xl px-3 py-24 space-y-6">
        {/* Header pagina */}
        <GalleryHeader
          eventsCount={events.length}
          photosCount={events.reduce(
            (acc, ev) => acc + (ev.imagesCount || 0),
            0
          )}
        />

        {/* Filtri + sort + conteggio filtrato */}
        <GalleryFilters
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
          filteredEventsCount={filteredSortedEvents.length}
          filteredPhotosCount={flatImages.length}
        />

        {/* Griglia grossa */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredSortedEvents.map((ev, eventIndex) =>
            Array.from({ length: ev.imagesCount }).map((_, imageIndex) => (
              <button
                key={`${ev.slug}-${imageIndex}`}
                type="button"
                onClick={() => openModal(eventIndex, imageIndex)}
                className="group relative aspect-4/3 overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 hover:border-cyan-400/70 transition"
              >
                <img
                  src={`/events/${ev.slug}/${imageIndex + 1}.jpg`}
                  alt={`${ev.title} photo ${imageIndex + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 flex items-end justify-between px-2 pb-1 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[0.65rem] text-slate-100">
                    {ev.title}
                  </span>
                  <span className="text-[0.65rem] text-slate-200/80">
                    #{imageIndex + 1}
                  </span>
                </div>
              </button>
            ))
          )}

          {!filteredSortedEvents.length && (
            <p className="col-span-full text-center text-sm text-slate-400 py-8">
              {t("gallery.filters.summary", {
                events: 0,
                photos: 0,
              })}
            </p>
          )}
        </div>
      </section>

      {/* MODAL FULLSCREEN */}
      {modalOpen && currentEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={closeModal}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-rose-400 hover:text-rose-300 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-black">
              <img
                src={`/events/${currentEvent.slug}/${modalImageIndex + 1}.jpg`}
                alt={`${currentEvent.title} fullscreen ${modalImageIndex + 1}`}
                className="h-full w-full object-contain bg-black"
              />

              <button
                onClick={showPrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={showNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/70 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-2 right-3 rounded-full bg-black/70 px-3 py-1 text-[0.7rem] text-slate-100 border border-white/25">
                {currentEvent.title} · #{modalImageIndex + 1}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
