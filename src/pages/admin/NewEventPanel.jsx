import { useEffect, useMemo, useState } from "react";
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
  ListOrdered,
  Mail,
  MessageCircle,
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

  // lista eventi
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  // modale edit
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
    banner_image_url: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // invio da modale edit
  const [editSendLoading, setEditSendLoading] = useState(false);
  const [editSendError, setEditSendError] = useState("");
  const [editSendOk, setEditSendOk] = useState(false);
  const [editSendCounts, setEditSendCounts] = useState({
    email: null,
    whatsapp: null,
  });

  const [editSendChannels, setEditSendChannels] = useState({
    email: true,
    sms: false, // WhatsApp
  });

  const [editSendMessageEmail, setEditSendMessageEmail] = useState("");
  const [editSendMessageWhatsapp, setEditSendMessageWhatsapp] = useState("");
  const [editSendHeroUrl, setEditSendHeroUrl] = useState("");
  const [editSendHeroUploading, setEditSendHeroUploading] = useState(false);
  const [editSendHeroError, setEditSendHeroError] = useState("");

  // logs invii evento
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [logsEvent, setLogsEvent] = useState(null);
  const [sendLogsLoading, setSendLogsLoading] = useState(false);
  const [sendLogsError, setSendLogsError] = useState("");
  const [sendLogs, setSendLogs] = useState([]);
  const [logsChannel, setLogsChannel] = useState("all"); // all | email | whatsapp

  // helper: evento passato (usa solo event_date)
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

    const bannerSubtitle = (formData.get("banner_subtitle") || "")
      .toString()
      .trim();

    // hard stop: WhatsApp richiede descrizione
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
      banner_subtitle: bannerSubtitle,
      banner_cta_label: (formData.get("banner_cta_label") || "").toString(),
      banner_cta_url: (formData.get("banner_cta_url") || "").toString(),
      banner_image_url: bannerImageUrl || "",
      send_newsletter: sendEmail || sendWhatsapp,
      event_type: (formData.get("event_type") || "current").toString(),
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
      setSentCount(data.recipients_email ?? data.recipients ?? null);

      await loadEvents();

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

  // ---- delete evento ----
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

  // ---- open edit modal ----
  const handleOpenEditModal = (ev) => {
    setEditingEvent(ev);
    setEditError("");
    setEditSaving(false);

    // reset invio
    setEditSendLoading(false);
    setEditSendError("");
    setEditSendOk(false);
    setEditSendCounts({ email: null, whatsapp: null });

    setEditSendChannels({ email: true, sms: false });
    setEditSendMessageEmail(ev.banner_subtitle || ev.title || "");
    setEditSendMessageWhatsapp(ev.banner_subtitle || "");
    setEditSendHeroUrl(ev.banner_image_url || "");
    setEditSendHeroError("");

    setEditForm({
      title: ev.title || "",
      event_date: ev.event_date ? ev.event_date.slice(0, 10) : "",
      banner_title: ev.banner_title || "",
      banner_subtitle: ev.banner_subtitle || "",
      banner_cta_label: ev.banner_cta_label || "",
      banner_cta_url: ev.banner_cta_url || "",
      is_featured: !!ev.is_featured,
      event_type: ev.event_type || "current",
      banner_image_url: ev.banner_image_url || "",
    });
  };

  const handleCloseEditModal = () => {
    if (editSaving || editSendLoading) return;
    setEditingEvent(null);
    setEditError("");
    setEditSendError("");
    setEditSendOk(false);
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- salva modifiche ----
  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    // evento passato => sola lettura
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
      banner_image_url: editForm.banner_image_url || null,
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

      // aggiorna editingEvent locale (così invio/logs usano dati aggiornati)
      setEditingEvent(data.event);
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

  // ---- upload hero per invio da modale ----
  const handleEditSendHeroChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditSendHeroError("");
    setEditSendHeroUploading(true);

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
        throw new Error(data.message || "Errore upload immagine");
      }

      setEditSendHeroUrl(data.url);
    } catch (err) {
      console.error(err);
      setEditSendHeroError(
        err instanceof Error ? err.message : "Errore upload immagine"
      );
    } finally {
      setEditSendHeroUploading(false);
    }
  };

  // ---- invio da modale edit ----
  const handleSendFromEdit = async () => {
    if (!editingEvent) return;

    setEditSendError("");
    setEditSendOk(false);
    setEditSendCounts({ email: null, whatsapp: null });

    const wantEmail = !!editSendChannels.email;
    const wantWhatsapp = !!editSendChannels.sms;

    if (!wantEmail && !wantWhatsapp) {
      setEditSendError("Seleziona almeno un canale (Email o WhatsApp).");
      return;
    }

    // WhatsApp richiede testo
    if (wantWhatsapp && !(editSendMessageWhatsapp || "").trim()) {
      setEditSendError(
        "Per inviare WhatsApp devi compilare il messaggio WhatsApp."
      );
      return;
    }

    setEditSendLoading(true);

    const payload = {
      channels: {
        email: wantEmail,
        sms: wantWhatsapp,
      },
      message_email: (editSendMessageEmail || "").toString(),
      message_whatsapp: (editSendMessageWhatsapp || "").toString(),
      hero_image_url: editSendHeroUrl || null,
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/events/${editingEvent.id}/send`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Errore invio comunicazioni evento");
      }

      setEditSendOk(true);
      setEditSendCounts({
        email: data.recipients_email ?? 0,
        whatsapp: data.recipients_whatsapp ?? 0,
      });

      await loadEvents();
    } catch (err) {
      console.error(err);
      setEditSendError(
        err instanceof Error ? err.message : "Errore invio comunicazioni evento"
      );
    } finally {
      setEditSendLoading(false);
    }
  };

  // ---- logs invii evento ----
  const openSendLogsModal = async (ev) => {
    setLogsModalOpen(true);
    setLogsEvent(ev);
    setSendLogs([]);
    setSendLogsError("");
    setSendLogsLoading(true);
    setLogsChannel("all");

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/events/${ev.id}/send-logs?limit=500`,
        { credentials: "include" }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Errore caricamento log invii");
      }

      setSendLogs(data.logs || []);
    } catch (err) {
      console.error(err);
      setSendLogsError(
        err instanceof Error ? err.message : "Errore caricamento log invii"
      );
    } finally {
      setSendLogsLoading(false);
    }
  };

  const closeSendLogsModal = () => {
    setLogsModalOpen(false);
    setLogsEvent(null);
    setSendLogs([]);
    setSendLogsError("");
    setLogsChannel("all");
  };

  const filteredLogs = useMemo(() => {
    if (logsChannel === "email") {
      return sendLogs.filter((l) => l.channel === "email");
    }
    if (logsChannel === "whatsapp") {
      return sendLogs.filter(
        (l) => l.channel === "whatsapp" || l.channel === "sms"
      );
    }
    return sendLogs;
  }, [sendLogs, logsChannel]);

  const logStats = useMemo(() => {
    const stats = {
      emailSent: 0,
      emailFailed: 0,
      whatsappSent: 0,
      whatsappFailed: 0,
    };
    for (const l of sendLogs) {
      const isSent = l.status === "sent";
      if (l.channel === "email") {
        if (isSent) stats.emailSent++;
        else stats.emailFailed++;
      } else if (l.channel === "whatsapp" || l.channel === "sms") {
        if (isSent) stats.whatsappSent++;
        else stats.whatsappFailed++;
      }
    }
    return stats;
  }, [sendLogs]);

  // UI flags modale
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

        {/* Banner */}
        <div className="space-y-3 rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              Banner homepage
            </div>
            <p className="text-[11px] text-slate-400">
              Testi usati sia per home sia per invii (email/WhatsApp).
            </p>
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
                  placeholder="Special guest, visual, luci e suono..."
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
                  <span>Consigliato orizzontale (1200×500).</span>
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

        {/* Canali invio */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
            Invio comunicazioni ai soci
          </div>
          <p className="text-[11px] text-slate-400">
            Seleziona Email, WhatsApp o entrambi per i soci marketing attivi.
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
                Invia <span className="font-semibold text-cyan-300">email</span>
              </span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="send_whatsapp"
                className="h-3.5 w-3.5 rounded border-emerald-500 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              <span>
                Invia anche{" "}
                <span className="font-semibold text-emerald-300">WhatsApp</span>
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
                Email inviata a {sentCount} destinatari.
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

      {/* LISTA EVENTI */}
      <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/75 p-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
              Eventi creati
            </div>
            <p className="text-[11px] text-slate-500">
              Modifica, invia di nuovo (da Edit) e guarda i log invii.
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
            <ul className="divide-y divide-slate-800 text-[11px] min-w-[700px] sm:min-w-0">
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

                const recipientsEmail =
                  typeof ev.recipients_email === "number"
                    ? ev.recipients_email
                    : ev.recipients_count;

                const recipientsWhatsapp =
                  typeof ev.recipients_whatsapp === "number"
                    ? ev.recipients_whatsapp
                    : null;

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

                        {isPast && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] border bg-rose-500/10 text-rose-200 border-rose-400/70">
                            Passato
                          </span>
                        )}

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

                        {recipientsEmail != null && (
                          <button
                            type="button"
                            onClick={() => openSendLogsModal(ev)}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            title="Apri log invii"
                          >
                            <ListOrdered className="h-3 w-3" />
                            invii
                            <span className="opacity-80">
                              · 📧 {recipientsEmail ?? 0}
                              {recipientsWhatsapp != null
                                ? ` · 💬 ${recipientsWhatsapp}`
                                : ""}
                            </span>
                          </button>
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

      {/* EDIT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-3 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
            {/* header */}
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
                    ? "Evento passato: sola lettura."
                    : "Aggiorna info e (se vuoi) reinvia comunicazioni."}
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

            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              {/* COL SX: EDIT */}
              <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
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
                      <span>Prossimo (solo carosello)</span>
                    </label>
                  </div>
                </div>

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

                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      CTA label
                    </label>
                    <input
                      value={editForm.banner_cta_label}
                      disabled={editDisabled}
                      onChange={(e) =>
                        handleEditFieldChange(
                          "banner_cta_label",
                          e.target.value
                        )
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

                {/* featured */}
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
                    Solo eventi <span className="font-semibold">in atto</span>{" "}
                    possono essere featured.
                  </p>
                </div>

                {editError && (
                  <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                    {editError}
                  </div>
                )}

                {/* save */}
                <div className="flex justify-end gap-2 pt-1">
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
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* COL DX: INVIO */}
              <div className="max-h-[70vh] space-y-3 overflow-auto pr-1">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    Reinvia comunicazioni
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Usa questi campi solo per invio (non salva sul banner).
                  </p>

                  <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-200">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editSendChannels.email}
                        onChange={(e) =>
                          setEditSendChannels((p) => ({
                            ...p,
                            email: e.target.checked,
                          }))
                        }
                        className="h-3.5 w-3.5 rounded border-slate-500 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3 text-cyan-300" /> Email
                      </span>
                    </label>

                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editSendChannels.sms}
                        onChange={(e) =>
                          setEditSendChannels((p) => ({
                            ...p,
                            sms: e.target.checked,
                          }))
                        }
                        className="h-3.5 w-3.5 rounded border-emerald-500 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
                      />
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-emerald-300" />{" "}
                        WhatsApp
                      </span>
                    </label>
                  </div>

                  <div className="mt-3 space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      Messaggio Email
                    </label>
                    <textarea
                      rows={4}
                      value={editSendMessageEmail}
                      onChange={(e) => setEditSendMessageEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-0 focus:border-cyan-400/80"
                      placeholder="Testo email (fallback: banner_subtitle)"
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      Messaggio WhatsApp (obbligatorio se attivo)
                    </label>
                    <textarea
                      rows={3}
                      value={editSendMessageWhatsapp}
                      onChange={(e) =>
                        setEditSendMessageWhatsapp(e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 outline-none ring-0 focus:border-emerald-400/80"
                      placeholder="Testo WhatsApp (usa template utopia_evento)"
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-300">
                      <ImageIcon className="h-3 w-3 text-amber-300" />
                      Immagine invio (opzionale)
                    </label>

                    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-white/15 bg-slate-950/80 p-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditSendHeroChange}
                        className="text-[11px] text-slate-200 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400 file:px-3 file:py-1 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-black file:hover:brightness-110"
                      />

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Se vuoto, usa banner_image_url dell’evento.</span>
                        {editSendHeroUploading && (
                          <span className="inline-flex items-center gap-1 text-cyan-300">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Upload...
                          </span>
                        )}
                      </div>

                      {editSendHeroError && (
                        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
                          {editSendHeroError}
                        </div>
                      )}

                      {editSendHeroUrl && (
                        <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
                          <img
                            src={editSendHeroUrl}
                            alt="Anteprima invio"
                            className="block max-h-40 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {editSendError && (
                    <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                      {editSendError}
                    </div>
                  )}

                  {editSendOk && (
                    <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
                      Invio completato.
                      <span className="ml-1 text-emerald-300/90">
                        📧 {editSendCounts.email ?? 0} · 💬{" "}
                        {editSendCounts.whatsapp ?? 0}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendFromEdit}
                      disabled={editSendLoading}
                      className={`inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black hover:brightness-110 transition ${
                        editSendLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {editSendLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Invio...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Reinvia</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* quick access logs */}
                <button
                  type="button"
                  onClick={() => openSendLogsModal(editingEvent)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-600/70 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition"
                >
                  <ListOrdered className="h-4 w-4" />
                  Apri log invii
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEND LOGS MODAL */}
      {logsModalOpen && logsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/90 text-cyan-300">
                  <ListOrdered className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    Log invii evento
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {logsEvent.title} · 📧 {logStats.emailSent} (err{" "}
                    {logStats.emailFailed}){" · "}💬 {logStats.whatsappSent}{" "}
                    (err {logStats.whatsappFailed})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSendLogsModal}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-600/70 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLogsChannel("all")}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] border ${
                  logsChannel === "all"
                    ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Tutti
              </button>
              <button
                type="button"
                onClick={() => setLogsChannel("email")}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] border ${
                  logsChannel === "email"
                    ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLogsChannel("whatsapp")}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] border ${
                  logsChannel === "whatsapp"
                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700/80 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                WhatsApp
              </button>
            </div>

            {sendLogsError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {sendLogsError}
              </div>
            )}

            <div className="max-h-[420px] overflow-auto rounded-xl border border-white/5 bg-slate-950/80">
              {sendLogsLoading ? (
                <div className="px-3 py-6 text-center text-[11px] text-slate-400">
                  Caricamento log...
                </div>
              ) : filteredLogs.length ? (
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">TS</th>
                      <th className="px-3 py-2 text-left">Canale</th>
                      <th className="px-3 py-2 text-left">Member</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Errore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-t border-white/5 bg-slate-950/40"
                      >
                        <td className="px-3 py-2 text-[10px] text-slate-400">
                          {l.created_at
                            ? new Date(l.created_at).toLocaleString("it-IT")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-300">
                          {l.channel === "email"
                            ? "email"
                            : l.channel === "sms"
                            ? "whatsapp"
                            : l.channel}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-300">
                          {l.member_id || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                              l.status === "sent"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-rose-300">
                          {l.error || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-3 py-6 text-center text-[11px] text-slate-500">
                  Nessun log disponibile.
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={closeSendLogsModal}
                className="inline-flex items-center rounded-full border border-slate-600/70 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
