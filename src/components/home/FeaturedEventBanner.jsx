// src/components/home/FeaturedEventBanner.jsx
import { useEffect, useState } from "react";
import { CalendarDays, ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function FeaturedEventBanner() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/admin/events/featured`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Errore caricamento evento");
        }

        if (!cancelled) {
          setEvent(data.event);
        }
      } catch (err) {
        console.error("[FeaturedEventBanner]", err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Errore imprevisto caricamento evento"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Se non c'è niente da mostrare, non sporcare la home
  if (loading || error || !event) {
    return null;
  }

  const {
    id,
    title,
    event_date,
    banner_title,
    banner_subtitle,
    banner_cta_label,
    banner_cta_url,
    banner_image_url,
  } = event;

  const dateLabel = event_date
    ? new Date(event_date).toLocaleDateString("it-IT", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    : null;

  const hasImage = !!banner_image_url;

  // 🔹 logging click CTA evento in evidenza
  const handleCtaClick = () => {
    try {
      fetch(`${API_BASE}/api/admin/logs/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // endpoint pubblico → niente credentials
        body: JSON.stringify({
          event_type: "featured_event_cta_click",
          description: `Click CTA evento in evidenza: ${
            banner_cta_label || ""
          }`,
          source: "public_site_featured_event_banner",
          meta: {
            event_id: id,
            title,
            event_date,
            banner_cta_url,
            banner_cta_label,
            path:
              typeof window !== "undefined" ? window.location.pathname : null,
          },
        }),
      }).catch(() => {
        // non bloccare mai la UX per un errore di logging
      });
    } catch {
      // silenzioso
    }
  };

  return (
    <section className="px-3 pt-4">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-slate-950/80 shadow-[0_0_35px_rgba(56,189,248,0.45)]">
          {/* Glow */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-32 rounded-full bg-fuchsia-500/25 blur-3xl" />

          <div
            className={`relative grid gap-4 ${
              hasImage ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {/* Immagine a SINISTRA (se presente) */}
            {hasImage && (
              <div className="relative order-1 min-h-[180px] border-b border-slate-800/70 md:border-b-0 md:border-r">
                <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 via-transparent to-fuchsia-500/15" />
                <img
                  src={banner_image_url}
                  alt={banner_title || title}
                  className="relative block h-full w-full max-h-72 object-cover md:max-h-full"
                />
              </div>
            )}

            {/* Testo a DESTRA (o full width se non c'è immagine) */}
            <div
              className={`flex flex-col justify-between p-5 md:p-6 lg:p-7 ${
                hasImage ? "order-2" : "order-1 md:col-span-1"
              }`}
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>Evento in evidenza</span>
                  {dateLabel && (
                    <>
                      <span className="h-px w-4 bg-cyan-400/40" />
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-100/90">
                        <CalendarDays className="h-3 w-3" />
                        {dateLabel}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="text-balance text-xl font-semibold tracking-[0.12em] text-slate-50 sm:text-2xl md:text-3xl">
                  {banner_title || title}
                </h2>

                {banner_subtitle && (
                  <p className="text-sm text-slate-300/90 md:text-[15px]">
                    {banner_subtitle}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* CTA – logga click + apre link */}
                {banner_cta_label && banner_cta_url && (
                  <a
                    href={banner_cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCtaClick}
                    className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.8)] hover:brightness-110"
                  >
                    <span>{banner_cta_label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}

                {event_date && (
                  <div className="flex items-center gap-2 rounded-full border border-slate-600/70 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-200">
                    <CalendarDays className="h-3.5 w-3.5 text-cyan-300" />
                    <span>
                      {new Date(event_date).toLocaleDateString("it-IT", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
