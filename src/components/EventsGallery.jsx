import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { events } from "../data/eventsGallery";

const IMAGES_PER_PAGE = 8;

export default function EventsGallery() {
  const { t } = useTranslation();

  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("az");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const [imagePage, setImagePage] = useState(1);

  const autoplayRef = useRef(null);
  const AUTOPLAY_INTERVAL = 6000;

  // filtri + sort
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

  // fix indice evento attivo quando cambia la lista
  useEffect(() => {
    if (!filteredSortedEvents.length) return;
    if (!filteredSortedEvents[activeEventIndex]) {
      setActiveEventIndex(0);
    }
  }, [filteredSortedEvents, activeEventIndex]);

  const activeEvent = filteredSortedEvents[activeEventIndex] || null;

  // reset pagina immagini quando cambia evento
  useEffect(() => {
    setImagePage(1);
  }, [activeEventIndex]);

  // autoplay “soft”
  useEffect(() => {
    if (!filteredSortedEvents.length) return;

    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }

    autoplayRef.current = setInterval(() => {
      setActiveEventIndex((prev) =>
        filteredSortedEvents.length
          ? (prev + 1) % filteredSortedEvents.length
          : 0
      );
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [filteredSortedEvents]);

  const handleSelectEvent = (index) => {
    setActiveEventIndex(index);
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  // paginazione immagini
  const totalImagePages = activeEvent
    ? Math.max(1, Math.ceil(activeEvent.imagesCount / IMAGES_PER_PAGE))
    : 1;

  const paginatedImages = useMemo(() => {
    if (!activeEvent) return [];
    const start = (imagePage - 1) * IMAGES_PER_PAGE;
    const end = start + IMAGES_PER_PAGE;
    return Array.from({ length: activeEvent.imagesCount })
      .map((_, idx) => idx)
      .slice(start, end);
  }, [activeEvent, imagePage]);

  // modal
  const openModal = (idx) => {
    setModalImageIndex(idx);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const showPrevImage = () => {
    if (!activeEvent) return;
    setModalImageIndex(
      (prev) => (prev - 1 + activeEvent.imagesCount) % activeEvent.imagesCount
    );
  };

  const showNextImage = () => {
    if (!activeEvent) return;
    setModalImageIndex((prev) => (prev + 1) % activeEvent.imagesCount);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, activeEvent]);

  return (
    <section
      id="events"
      className=" bg-linear-to-b from-slate-650 via-black to-slate-850 min-h-[90vh]"
    >
      <div className="mx-auto max-w-6xl px-4 space-y-6">
        {/* Header compatto */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-400">
              {t("gallery.eventsSection.sectionLabel")}
            </p>
            <h2 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
              {t("gallery.eventsSection.sectionTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              {t("gallery.eventsSection.sectionSubtitle")}
            </p>
          </div>

          {/* Filtri + Sort */}
          <div className="flex flex-wrap gap-3 text-[0.7rem]">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-slate-400">
                {t("gallery.eventsSection.filterLabel")}
              </span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-full bg-slate-900/80 border border-white/15 px-3 py-1 text-[0.7rem] text-slate-100 outline-none"
              >
                <option value="all">
                  {t("gallery.eventsSection.filterAllEvents")}
                </option>
                <option value="guest">
                  {t("gallery.eventsSection.filterGuestNights")}
                </option>
                <option value="resident">
                  {t("gallery.eventsSection.filterResidents")}
                </option>
                <option value="live">
                  {t("gallery.eventsSection.filterLive")}
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-slate-400">
                {t("gallery.eventsSection.sortLabel")}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full bg-slate-900/80 border border-white/15 px-3 py-1 text-[0.7rem] text-slate-100 outline-none"
              >
                <option value="az">{t("gallery.filters.sortAz")}</option>
                <option value="za">{t("gallery.filters.sortZa")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista eventi a chip */}
        <div className="border border-white/5 rounded-2xl bg-black/65 p-5 backdrop-blur transform-gpu">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
              {t("gallery.eventsSection.chipsLabel")}
            </p>
            <p className="text-[0.7rem] text-slate-500">
              {t("gallery.eventsSection.chipsCount", {
                count: filteredSortedEvents.length,
              })}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700/70 scrollbar-track-transparent">
            {filteredSortedEvents.map((ev, index) => {
              const isActive = index === activeEventIndex;
              return (
                <button
                  key={ev.slug}
                  type="button"
                  onClick={() => handleSelectEvent(index)}
                  className={`flex items-center gap-2 rounded-full px-2.5 py-1 border text-[0.7rem] whitespace-nowrap transition ${
                    isActive
                      ? "border-cyan-400/80 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-slate-900/70 text-slate-200 hover:border-cyan-400/60"
                  }`}
                >
                  <div className="h-6 w-8 overflow-hidden rounded-md bg-slate-800/80">
                    <img
                      src={`/events/${ev.slug}/1.jpg`}
                      alt={ev.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span>{ev.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evento attivo: gallery + preview */}
        {activeEvent && (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                    {t("gallery.eventsSection.galleryLabel")}
                  </p>
                  <p className="text-sm text-slate-200">
                    {t("gallery.eventsSection.gallerySubtitle", {
                      title: activeEvent.title,
                      count: activeEvent.imagesCount,
                    })}
                  </p>
                  {activeEvent.tags && (
                    <p className="mt-1 text-[0.7rem] text-slate-500">
                      {activeEvent.tags.join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Griglia con paginazione */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paginatedImages.map((idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 hover:border-cyan-400/70 transition"
                      onClick={() => openModal(idx)}
                    >
                      <img
                        src={`/events/${activeEvent.slug}/${idx + 1}.jpg`}
                        alt={`${activeEvent.title} photo ${idx + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>

                {/* Paginazione foto */}
                {activeEvent.imagesCount > IMAGES_PER_PAGE && (
                  <div className="flex items-center justify-between gap-3 text-[0.7rem] text-slate-300">
                    <span>
                      {t("gallery.pagination.photosRange", {
                        from: (imagePage - 1) * IMAGES_PER_PAGE + 1,
                        to: Math.min(
                          imagePage * IMAGES_PER_PAGE,
                          activeEvent.imagesCount
                        ),
                        total: activeEvent.imagesCount,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImagePage((p) => Math.max(1, p - 1))}
                        disabled={imagePage === 1}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                          imagePage === 1
                            ? "border-slate-800 text-slate-600 cursor-not-allowed"
                            : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                        }`}
                      >
                        <ChevronLeft className="h-3 w-3" />
                        {t("gallery.pagination.prev")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setImagePage((p) => Math.min(totalImagePages, p + 1))
                        }
                        disabled={imagePage === totalImagePages}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                          imagePage === totalImagePages
                            ? "border-slate-800 text-slate-600 cursor-not-allowed"
                            : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                        }`}
                      >
                        {t("gallery.pagination.next")}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview singola */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/65 backdrop-blur transform-gpu p-2">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900/70">
                  <img
                    src={`/events/${activeEvent.slug}/1.jpg`}
                    alt={activeEvent.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FULLSCREEN */}
      {modalOpen && activeEvent && (
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

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/20 bg-black">
              <img
                src={`/events/${activeEvent.slug}/${modalImageIndex + 1}.jpg`}
                alt={`${activeEvent.title} fullscreen ${modalImageIndex + 1}`}
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
                {modalImageIndex + 1} / {activeEvent.imagesCount}
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-300">{activeEvent.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
