import { useEffect, useState } from "react";
import {
  CalendarDays,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Send,
  Trash2,
  Edit3,
  Star,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function NewEventPanel() {
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [sentCount, setSentCount] = useState(null);

  // 🔹 lista eventi
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  // 🔹 stato modale edit
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    event_date: "",
    banner_title: "",
    banner_subtitle: "",
    banner_cta_label: "",
    banner_cta_url: "",
    is_featured: false,
    event_type: "current",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // ✅ helper: evento passato (usa solo event_date)
  const isPastEvent = (event_date) => {
    if (!event_date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const evDate = new Date(event_date);
    evDate.setHours(0, 0, 0, 0);

    return evDate < today;
  };

  // ---- upload immagine banner ----
  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError("");
    setBannerUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/admin/upload-campaign-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante l'upload dell'immagine evento"
        );
      }

      setBannerImageUrl(data.url);
    } catch (err) {
      console.error(err);
      setBannerError(
        err instanceof Error
          ? err.message
          : "Errore durante l'upload dell'immagine evento"
      );
      setBannerImageUrl("");
    } finally {
      setBannerUploading(false);
    }
  };

  // ---- create nuovo evento ----
  // ✅ FIX 2 — Frontend (NewEventPanel.jsx)
  // Modifica SOLO dentro handleSubmit: valida descrizione se WhatsApp è selezionato
  // + usa bannerSubtitle "pulito" nel payload

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);
    setSentCount(null);
    setSending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const sendEmail = formData.get("send_email") === "on";
    const sendWhatsapp = formData.get("send_whatsapp") === "on";

    // ✅ descrizione evento = textarea grande
    const bannerSubtitle = (formData.get("banner_subtitle") || "")
      .toString()
      .trim();

    // ✅ hard stop lato UI: WhatsApp richiede descrizione
    if (sendWhatsapp && !bannerSubtitle) {
      setSending(false);
      setError(
        "Per inviare WhatsApp devi compilare la descrizione evento (textarea grande)."
      );
      return;
    }

    const payload = {
      title: (formData.get("title") || "").toString(),
      event_date: formData.get("event_date") || null,
      banner_title: (formData.get("banner_title") || "").toString(),
      banner_subtitle: bannerSubtitle, // ✅ usa sempre la textarea pulita
      banner_cta_label: (formData.get("banner_cta_label") || "").toString(),
      banner_cta_url: (formData.get("banner_cta_url") || "").toString(),
      banner_image_url: bannerImageUrl || "",
      // retro-compatibilità: true se almeno un canale è selezionato
      send_newsletter: sendEmail || sendWhatsapp,
      event_type: (formData.get("event_type") || "current").toString(),
      // nuovo oggetto channels, come per le campagne
      channels: {
        email: sendEmail,
        sms: sendWhatsapp, // WhatsApp lato backend
      },
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/events`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante la creazione dell'evento"
        );
      }

      setOk(true);
      setSentCount(data.recipients ?? null);

      loadEvents();

      form.reset();
      setBannerImageUrl("");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante il salvataggio evento"
      );
    } finally {
      setSending(false);
    }
  };

  // ---- fetch lista eventi ----
  const loadEvents = async () => {
    setEventsError("");
    setEventsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/events`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Errore nel caricamento degli eventi");
      }

      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setEventsError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto nel caricamento eventi"
      );
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ---- delete evento (con SweetAlert2) ----
  const handleDeleteEvent = async (ev) => {
    const result = await Swal.fire({
      title: "Eliminare evento?",
      text: `Vuoi davvero cancellare l'evento "${ev.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sì, elimina",
      cancelButtonText: "Annulla",
      background: "#020617",
      color: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${ev.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante la cancellazione dell'evento"
        );
      }

      setEvents((prev) => prev.filter((e) => e.id !== ev.id));

      await Swal.fire({
        title: "Eliminato",
        text: "L'evento è stato cancellato correttamente.",
        icon: "success",
        confirmButtonColor: "#22c55e",
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "Errore",
        text:
          err instanceof Error
            ? err.message
            : "Errore imprevisto durante la cancellazione",
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#020617",
        color: "#e5e7eb",
      });
    }
  };

  // ---- apri modale edit ----
  const handleOpenEditModal = (ev) => {
    setEditingEvent(ev);
    setEditError("");

    setEditForm({
      title: ev.title || "",
      event_date: ev.event_date ? ev.event_date.slice(0, 10) : "",
      banner_title: ev.banner_title || "",
      banner_subtitle: ev.banner_subtitle || "",
      banner_cta_label: ev.banner_cta_label || "",
      banner_cta_url: ev.banner_cta_url || "",
      is_featured: !!ev.is_featured,
      event_type: ev.event_type || "current",
    });
  };

  const handleCloseEditModal = () => {
    if (editSaving) return;
    setEditingEvent(null);
    setEditError("");
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- salva modifiche dalla modale ----
  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    // 🔒 hard stop: evento passato => NON salva e NON chiama PATCH
    if (isPastEvent(editForm.event_date)) return;

    setEditError("");
    setEditSaving(true);

    const payload = {
      title: editForm.title,
      event_date: editForm.event_date || null,
      banner_title: editForm.banner_title,
      banner_subtitle: editForm.banner_subtitle,
      banner_cta_label: editForm.banner_cta_label,
      banner_cta_url: editForm.banner_cta_url,
      is_featured: editForm.is_featured,
      event_type: editForm.event_type,
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/events/${editingEvent.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante l'aggiornamento dell'evento"
        );
      }

      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? data.event : e))
      );

      setEditingEvent(null);
    } catch (err) {
      console.error(err);
      setEditError(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante l'aggiornamento"
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ✅ se passato: modale SOLO LETTURA (non modificabile)
  const isPastEditing = !!editingEvent && isPastEvent(editForm.event_date);
  const editDisabled = isPastEditing || editSaving;

  return (
    <div className="space-y-6 md:space-y-7 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Nuovo evento
            </div>
            <p className="text-xs text-slate-400">
              Crea un evento con banner in homepage e (opzionalmente) invia
              comunicazioni ai soci.
            </p>
          </div>
        </div>
      </div>

      {/* FORM CREAZIONE */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Riga titolo / data */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-[2fr_1fr]">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <Sparkles className="h-3 w-3 text-cyan-300" />
              Titolo evento
            </label>
            <input
              name="title"
              required
              placeholder="Utopia Night · Special Guest..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
              <CalendarDays className="h-3 w-3 text-fuchsia-300" />
              Data evento
            </label>
            <input
              type="date"
              name="event_date"
              required
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
            />
          </div>
        </div>

        {/* Tipo evento */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
            Tipo evento
          </label>
          <div className="flex flex-col gap-1.5 text-[11px] text-slate-200 sm:flex-row sm:items-center sm:gap-4">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="event_type"
                value="current"
                defaultChecked
                className="h-3 w-3 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span>Evento in atto (banner principale / featured)</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="event_type"
                value="upcoming"
                className="h-3 w-3 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span>Prossimo evento (solo carosello)</span>
            </label>
          </div>
        </div>

        {/* Sezione Banner Homepage */}
        <div className="space-y-3 rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-4">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                Banner homepage
              </div>
              <p className="text-[11px] text-slate-400">
                I testi che inserisci qui vengono usati sia nel banner della
                home, sia nelle eventuali comunicazioni email/WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_1.2fr]">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Titolo banner
                </label>
                <input
                  name="banner_title"
                  placeholder="Venerdì • Utopia Night"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Sottotitolo / descrizione breve
                </label>
                <textarea
                  name="banner_subtitle"
                  rows={3}
                  placeholder="Special guest, visual, luci e suono. Ingresso riservato ai soci in regola con il tesseramento."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Testo pulsante
                  </label>
                  <input
                    name="banner_cta_label"
                    placeholder="Prenota il tavolo"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Link pulsante
                  </label>
                  <input
                    name="banner_cta_url"
                    placeholder="https://wa.me/39..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                  />
                </div>
              </div>
            </div>

            {/* Upload immagine banner */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                <ImageIcon className="h-3 w-3 text-amber-300" />
                Immagine banner homepage
              </label>
              <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/20 bg-slate-950/80 p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black file:hover:brightness-110"
                />
                <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Consigliato un formato orizzontale (1200×500) per un impatto
                    visivo forte.
                  </span>
                  {bannerUploading && (
                    <span className="inline-flex items-center gap-1 text-cyan-300">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Upload...
                    </span>
                  )}
                </div>

                {bannerError && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
                    {bannerError}
                  </div>
                )}

                {bannerImageUrl && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
                    <img
                      src={bannerImageUrl}
                      alt="Anteprima banner evento"
                      className="block max-h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opzione: canali invio (Email / WhatsApp) */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
            Invio comunicazioni ai soci
          </div>
          <p className="text-[11px] text-slate-400">
            Puoi scegliere se inviare solo email, solo WhatsApp o entrambi i
            canali ai soci che hanno dato il consenso marketing.
          </p>

          <div className="mt-2 flex flex-col gap-2 text-[11px] text-slate-200 sm:flex-row sm:items-center sm:gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="send_email"
                defaultChecked
                className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span>
                Invia <span className="font-semibold text-cyan-300">email</span>{" "}
                automatica usando titolo, data, descrizione e immagine.
              </span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="send_whatsapp"
                className="h-3.5 w-3.5 rounded border-emerald-500 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              <span>
                Invia anche un{" "}
                <span className="font-semibold text-emerald-300">
                  messaggio WhatsApp
                </span>{" "}
                ai soci (tramite Meta Cloud API).
              </span>
            </label>
          </div>
        </div>

        {/* Stato invio */}
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            Evento creato correttamente.
            {sentCount != null && (
              <span className="ml-1 text-emerald-300/90">
                Comunicazione email inviata a {sentCount} destinatari marketing.
              </span>
            )}
          </div>
        )}

        {/* Bottoni */}
        <div className="flex flex-col items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={sending}
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_24px_rgba(56,189,248,0.8)] hover:brightness-110 transition ${
              sending ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Invio in corso...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Crea evento</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* LISTA EVENTI ESISTENTI */}
      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/75 p-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              Eventi creati
            </div>
            <p className="text-[11px] text-slate-500">
              Gestisci il banner in homepage e modifica o cancella gli eventi
              passati.
            </p>
          </div>

          <button
            type="button"
            onClick={loadEvents}
            disabled={eventsLoading}
            className={`inline-flex items-center gap-1 rounded-full border border-slate-600/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition ${
              eventsLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <Loader2
              className={`h-3 w-3 ${eventsLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {eventsError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
            {eventsError}
          </div>
        )}

        {/* ✅ fix: max-h-[420px] */}
        <div className="-mx-2 max-h-[420px] overflow-x-auto overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/70 px-2 py-1 sm:mx-0">
          {eventsLoading ? (
            <div className="flex h-24 items-center justify-center text-[11px] text-slate-400">
              Caricamento eventi...
            </div>
          ) : events.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-[11px] text-slate-500">
              Nessun evento creato finora.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800 text-[11px] min-w-[540px] sm:min-w-0">
              {events.map((ev) => {
                const dateLabel = ev.event_date
                  ? new Date(ev.event_date).toLocaleDateString("it-IT", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })
                  : "-";

                const type = ev.event_type || "current";
                const isPast = isPastEvent(ev.event_date);

                return (
                  <li
                    key={ev.id}
                    className="flex flex-col gap-2 px-2 py-2.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-900/60 rounded-xl sm:rounded-none"
                  >
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-100">
                          {ev.title}
                        </span>

                        {/* ✅ badge passato automatico */}
                        {isPast && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] border bg-rose-500/10 text-rose-200 border-rose-400/70">
                            Passato
                          </span>
                        )}

                        {/* Tipo evento solo se NON passato */}
                        {!isPast && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] border ${
                              type === "current"
                                ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/70"
                                : "bg-sky-500/10 text-sky-200 border-sky-400/70"
                            }`}
                          >
                            {type === "current" ? "In atto" : "Prossimo"}
                          </span>
                        )}

                        {/* Featured solo se NON passato */}
                        {!isPast && ev.is_featured && type === "current" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-cyan-200 border border-cyan-400/70">
                            <Star className="h-3 w-3 fill-cyan-400/70 text-cyan-900" />
                            Featured
                          </span>
                        )}

                        {ev.status && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-300 border border-slate-700/80">
                            {ev.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span>
                          <CalendarDays className="mr-1 inline-block h-3 w-3 text-cyan-300" />
                          {dateLabel}
                        </span>

                        {ev.banner_title && (
                          <span className="text-slate-500">
                            Banner:{" "}
                            <span className="text-slate-300">
                              {ev.banner_title}
                            </span>
                          </span>
                        )}

                        {ev.recipients_count != null && (
                          <span className="text-slate-500">
                            Newsletter:{" "}
                            <span className="text-slate-300">
                              {ev.recipients_count} destinatari
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ev)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-600/70 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-500/70 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-100 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ✨ EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-3 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
            {/* header modale */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-200">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-100">
                    Edit event
                  </h3>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {isPastEditing
                    ? "Evento passato: visualizzazione sola lettura."
                    : "Aggiorna rapidamente le info evento e il banner in homepage."}
                </p>

                {isPastEditing && (
                  <div className="mt-2 inline-flex items-center rounded-full border border-rose-400/70 bg-rose-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-rose-200">
                    Evento passato · sola lettura
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseEditModal}
                className="rounded-full bg-slate-900/80 p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
              {/* titolo + data */}
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-[1.5fr_1fr]">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Title
                  </label>
                  <input
                    value={editForm.title}
                    disabled={editDisabled}
                    onChange={(e) =>
                      handleEditFieldChange("title", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.event_date}
                    disabled={editDisabled}
                    onChange={(e) =>
                      handleEditFieldChange("event_date", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* tipo evento */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Tipo evento
                </label>
                <div className="flex flex-col gap-1.5 text-[11px] text-slate-200">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      value="current"
                      disabled={editDisabled}
                      checked={editForm.event_type === "current"}
                      onChange={() =>
                        handleEditFieldChange("event_type", "current")
                      }
                      className="h-3 w-3 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400 disabled:opacity-50"
                    />
                    <span>In atto (può essere featured)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      value="upcoming"
                      disabled={editDisabled}
                      checked={editForm.event_type === "upcoming"}
                      onChange={() =>
                        handleEditFieldChange("event_type", "upcoming")
                      }
                      className="h-3 w-3 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400 disabled:opacity-50"
                    />
                    <span>Prossimo (solo carosello, non featured)</span>
                  </label>
                </div>
              </div>

              {/* banner title/subtitle */}
              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Banner title
                </label>
                <input
                  value={editForm.banner_title}
                  disabled={editDisabled}
                  onChange={(e) =>
                    handleEditFieldChange("banner_title", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  Banner subtitle
                </label>
                <textarea
                  rows={3}
                  value={editForm.banner_subtitle}
                  disabled={editDisabled}
                  onChange={(e) =>
                    handleEditFieldChange("banner_subtitle", e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                />
              </div>

              {/* CTA */}
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    CTA label
                  </label>
                  <input
                    value={editForm.banner_cta_label}
                    disabled={editDisabled}
                    onChange={(e) =>
                      handleEditFieldChange("banner_cta_label", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                    CTA link
                  </label>
                  <input
                    value={editForm.banner_cta_url}
                    disabled={editDisabled}
                    onChange={(e) =>
                      handleEditFieldChange("banner_cta_url", e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/90 px-3 py-1.5 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* featured toggle */}
              <div className="rounded-xl border border-cyan-500/30 bg-slate-950/90 px-3 py-2">
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-100">
                  <input
                    type="checkbox"
                    checked={editForm.is_featured}
                    disabled={editDisabled}
                    onChange={(e) =>
                      handleEditFieldChange("is_featured", e.target.checked)
                    }
                    className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400 disabled:opacity-50"
                  />
                  <span>Usa come evento in evidenza (banner homepage).</span>
                </label>
                <p className="mt-1 text-[10px] text-slate-400">
                  Solo gli eventi <span className="font-semibold">in atto</span>{" "}
                  possono essere featured. Il backend garantisce un solo evento
                  in evidenza per volta.
                </p>
              </div>

              {editError && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                  {editError}
                </div>
              )}
            </div>

            {/* footer modale */}
            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editSaving}
                className="inline-flex items-center justify-center gap-1 rounded-full border border-slate-600/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300 hover:border-slate-400 hover:text-slate-100 transition disabled:opacity-50"
              >
                Close
              </button>

              {/* ✅ Save SOLO se NON passato */}
              {!isPastEditing && (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:brightness-110 transition disabled:opacity-60"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Save changes</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
