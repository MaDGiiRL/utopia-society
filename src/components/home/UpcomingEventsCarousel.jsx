import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function UpcomingEventsCarousel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/events/home`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(
            data.message || "Errore nel caricamento dei prossimi eventi"
          );
        }

        setEvents(data.upcoming || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Errore imprevisto nel caricamento prossimi eventi"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="relative z-10 mx-auto mt-8 max-w-5xl px-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
            Prossimi eventi
          </div>
          <p className="text-[11px] text-slate-500">
            Scopri cosa sta arrivando dopo l&apos;evento in evidenza.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-[11px] text-slate-400">
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Caricamento prossimi eventi...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-1 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              Coming soon
            </span>
            <p className="max-w-xs text-[11px] text-slate-500">
              Stiamo preparando i prossimi eventi. Torna a visitarci tra poco.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {events.map((ev) => {
              const dateLabel = ev.event_date
                ? new Date(ev.event_date).toLocaleDateString("it-IT", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })
                : "-";

              return (
                <article
                  key={ev.id}
                  className="min-w-[220px] max-w-xs flex-1 rounded-xl border border-slate-800/80 bg-slate-900/80 p-3 shadow-[0_0_24px_rgba(15,23,42,0.8)]"
                >
                  {ev.banner_image_url && (
                    <div className="mb-2 overflow-hidden rounded-lg border border-slate-700/80">
                      <img
                        src={ev.banner_image_url}
                        alt={ev.title}
                        className="h-28 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-cyan-300" />
                      {dateLabel}
                    </span>
                  </div>
                  <h3 className="mb-1 text-xs font-semibold text-slate-100">
                    {ev.banner_title || ev.title}
                  </h3>
                  {ev.banner_subtitle && (
                    <p className="mb-2 line-clamp-3 text-[10px] text-slate-400">
                      {ev.banner_subtitle}
                    </p>
                  )}
                  {ev.banner_cta_label && ev.banner_cta_url && (
                    <a
                      href={ev.banner_cta_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black hover:brightness-110"
                    >
                      {ev.banner_cta_label}
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
