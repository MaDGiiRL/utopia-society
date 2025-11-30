// src/pages/MembershipForm.jsx
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import ScrollScene3D from "../components/ScrollScene3D";
import { supabase } from "../lib/supabaseClient";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

// Base URL backend: da env, con fallback a localhost:4000 in dev
// In produzione VITE_ADMIN_API_URL DEVE essere valorizzata
const API_BASE =
  import.meta.env.VITE_ADMIN_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : null);

if (!API_BASE) {
  // Questo ti aiuta a capire subito in prod se manca la variabile
  console.error(
    "VITE_ADMIN_API_URL non è configurata! Il frontend non sa dove chiamare l'Admin API."
  );
}

function MembershipForm() {
  const formRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  // 👇 Stati per anteprima documenti
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [frontName, setFrontName] = useState("");
  const [backName, setBackName] = useState("");

  // ====== SETUP CANVAS FIRMA (opzionale) ======
  useEffect(() => {
    if (!isModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const getPos = (e) => {
      if (e.touches?.[0]) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleStart = (e) => {
      e.preventDefault();
      drawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const handleMove = (e) => {
      if (!drawing.current) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSigned(true);
    };

    const handleEnd = (e) => {
      e?.preventDefault();
      drawing.current = false;
    };

    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    canvas.addEventListener("touchstart", handleStart);
    canvas.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);

      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isModalOpen]);

  // cleanup URL oggetti quando il componente smonta
  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleConfirmSignature = async () => {
    if (!hasSigned) {
      await Swal.fire({
        icon: "warning",
        title: "Firma mancante",
        text: "Per favore firma la domanda prima di confermare.",
        confirmButtonText: "Ok",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }
    setIsModalOpen(false);
  };

  // === Helper anteprima file (fronte/retro) ===
  const handleFileChange = (e, setPreview, setName) => {
    const file = e.target.files?.[0];

    // libera eventuale URL precedente
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setName(file.name);
    } else {
      setName("");
    }
  };

  // === Helper per upload documento verso il backend ===

  const uploadDocumento = async (file, tipo) => {
    if (!API_BASE) {
      throw new Error(
        "API_BASE non configurato (VITE_ADMIN_API_URL mancante in .env del frontend)."
      );
    }

    const todayFolder = new Date().toISOString().slice(0, 10);
    const random =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const path = `${todayFolder}/${random}_${tipo}_${file.name}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    console.log(
      "Chiamo upload-document su:",
      `${API_BASE}/api/admin/upload-document`,
      {
        path,
      }
    );

    const res = await fetch(`${API_BASE}/api/admin/upload-document`, {
      method: "POST",
      body: formData,
    });

    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // non è JSON, pazienza
    }

    if (!res.ok || !data.ok) {
      console.error("Upload documento failed", {
        status: res.status,
        raw,
        data,
      });
      throw new Error(
        data.message ||
          `Errore upload documento (HTTP ${res.status}) – riprova più tardi.`
      );
    }

    return {
      path: data.path,
      url: data.signedUrl,
    };
  };

  // ====== SUBMIT: upload immagini + insert in Supabase (members) ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk(false);

    const formData = new FormData(e.target);

    // Campi anagrafici
    const name = formData.get("associatedName") || "";
    const surname = formData.get("associatedSurname") || "";
    const fullName = `${name} ${surname}`.trim();

    // File documento
    const fileFront = formData.get("document_front");
    const fileBack = formData.get("document_back");

    if (!fileFront || !fileFront.size || !fileBack || !fileBack.size) {
      setLoading(false);
      setError("Carica sia il fronte che il retro del documento.");
      return;
    }

    try {
      // 1) Upload documenti al backend (bucket privato)
      const frontResult = await uploadDocumento(fileFront, "front");
      const backResult = await uploadDocumento(fileBack, "back");

      // 2) Inserimento record in members
      const payload = {
        full_name: fullName,
        email: formData.get("emailType"),
        phone: formData.get("telephone"),
        city: formData.get("city") || null,
        date_of_birth: formData.get("birthDate") || null,
        birth_place: formData.get("birthPlace") || null,
        fiscal_code: formData.get("fiscalCode") || null,
        note: formData.get("note") || null,
        accept_privacy: formData.get("accept_privacy") === "on",
        accept_marketing: formData.get("accept_marketing") === "on",
        source: "membership_form",
        document_front_url: frontResult.url,
        document_back_url: backResult.url,
      };

      const { error: insertError } = await supabase
        .from("members")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        setError("Si è verificato un errore, riprova più tardi.");
        return;
      }

      setOk(true);
      e.target.reset();
      clearSignature();
      setHasSigned(false);

      // reset anteprime
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
      setFrontPreview(null);
      setBackPreview(null);
      setFrontName("");
      setBackName("");

      await Swal.fire({
        icon: "success",
        title: "Domanda inviata",
        text: "La tua richiesta di ammissione è stata registrata correttamente.",
        confirmButtonText: "Chiudi",
        confirmButtonColor: "#22c55e",
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Errore imprevisto, riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh]">
      {/* Glow generale */}
      <div className="pointer-events-none absolute inset-0 m-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* SFONDO 3D SCROLL-DRIVEN */}
      <ScrollScene3D />

      <section className="relative overflow-hidden py-24">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:grid lg:grid-cols-[1.05fr_minmax(0,1.1fr)] lg:items-start">
          {/* COLONNA TESTO */}
          <motion.div
            {...fadeUp()}
            className="space-y-6 text-center lg:text-left"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-cyan-300">
              Membership • Accesso riservato
            </p>

            <motion.h1
              initial={{
                opacity: 0,
                y: 60,
                scale: 0.9,
                letterSpacing: "0.05em",
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                letterSpacing: "0.22em",
              }}
              transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.18em] uppercase"
            >
              Diventa{" "}
              <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                Socio Utopia
              </span>
            </motion.h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto lg:mx-0">
              Compila la domanda online per richiedere la tessera socio. La
              richiesta deve essere inviata almeno 24 ore prima
              dell&apos;ingresso in struttura.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start text-[0.7rem]">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 uppercase tracking-[0.2em] text-cyan-200">
                Step 1 / 1
              </span>
              <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1 uppercase tracking-[0.18em] text-fuchsia-200">
                Registrazione socio
              </span>
            </div>

            <div className="hidden md:flex flex-col gap-2 text-[0.75rem] text-slate-300 pt-4 border-t border-white/10 max-w-md lg:max-w-none">
              <p className="uppercase tracking-[0.22em] text-slate-400">
                Cosa ti serve
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                <li>Dati anagrafici corretti e aggiornati</li>
                <li>Foto fronte / retro di un documento valido</li>
                <li>Accettazione privacy e statuto Utopia / ACSI</li>
              </ul>
            </div>
          </motion.div>

          {/* COLONNA FORM */}
          <motion.form
            {...fadeUp(0.15)}
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-2 space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6 md:p-7 text-sm backdrop-blur-xl shadow-[0_0_40px_rgba(15,23,42,0.8)] lg:mt-0"
          >
            {/* HEADER FORM */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.25em] text-slate-400">
                  Domanda di ammissione
                </p>
                <p className="text-xs text-slate-200">
                  I tuoi dati saranno utilizzati solo ai fini associativi.
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300">
                24h prima
              </div>
            </div>

            {/* SEZIONE: DATI ANAGRAFICI */}
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                Dati anagrafici
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Nome
                  </label>
                  <input
                    id="associatedName"
                    name="associatedName"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Nome"
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Cognome
                  </label>
                  <input
                    id="associatedSurname"
                    name="associatedSurname"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Cognome"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Nato/a a
                  </label>
                  <input
                    id="birthPlace"
                    name="birthPlace"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Luogo di nascita"
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Data di nascita
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SEZIONE: CONTATTI */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                Contatti
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Codice fiscale
                  </label>
                  <input
                    id="fiscalCode"
                    name="fiscalCode"
                    maxLength={16}
                    minLength={16}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm uppercase outline-none focus:border-cyan-400"
                    placeholder="Codice fiscale"
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Email
                  </label>
                  <input
                    id="emailType"
                    name="emailType"
                    type="email"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Cellulare
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    maxLength={10}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Numero cellulare"
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    Città di residenza
                  </label>
                  <input
                    id="city"
                    name="city"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder="Città"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SEZIONE: DOCUMENTO */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                Documento di identità
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Fronte */}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/60 bg-slate-950/70 px-4 py-6 text-center text-xs text-slate-200 hover:border-cyan-300 transition">
                  <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-cyan-300">
                    Fronte
                  </span>
                  {frontName && (
                    <span className="mb-1 text-[0.65rem] text-cyan-200/90">
                      {frontName}
                    </span>
                  )}
                  <span className="text-[0.65rem] text-slate-400">
                    Carica o scatta la foto del fronte del documento
                  </span>
                  <input
                    id="cameraInputFronte"
                    name="document_front"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    required
                    onChange={(e) =>
                      handleFileChange(e, setFrontPreview, setFrontName)
                    }
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
                    Retro
                  </span>
                  {backName && (
                    <span className="mb-1 text-[0.65rem] text-fuchsia-200/90">
                      {backName}
                    </span>
                  )}
                  <span className="text-[0.65rem] text-slate-400">
                    Carica o scatta la foto del retro del documento
                  </span>
                  <input
                    id="cameraInputRetro"
                    name="document_back"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    required
                    onChange={(e) =>
                      handleFileChange(e, setBackPreview, setBackName)
                    }
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

            {/* NOTE OPZIONALI */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                Note aggiuntive (opzionale)
              </p>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Eventuali richieste o informazioni aggiuntive…"
              />
            </div>

            {/* SEZIONE: CONSENSI */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                Consensi
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <label className="flex items-start gap-2">
                  <input
                    id="accept_privacy"
                    name="accept_privacy"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>
                    Dichiaro di aver preso visione e di accettare la{" "}
                    <a
                      href="/pdf/privacy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline"
                    >
                      privacy dei dati
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    id="accept_statute"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>
                    Approvo lo{" "}
                    <a
                      href="/pdf/statuto.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline"
                    >
                      statuto Utopia e statuto ACSI nazionale
                    </a>
                    .
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    id="accept_marketing"
                    name="accept_marketing"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>
                    Autorizzo l&apos;utilizzo dei miei contatti per
                    comunicazioni riguardanti eventi e attività del club
                    (newsletter/SMS).
                  </span>
                </label>
              </div>
            </div>

            {/* MESSAGGI + CTA */}
            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                {error}
              </div>
            )}
            {ok && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
                Domanda inviata correttamente.
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                id="btnSubmit"
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_0_40px_rgba(56,189,248,0.9)] hover:brightness-110 transition ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Invio in corso..." : "Invia domanda di ammissione"}
              </button>

              {/* <button
                type="button"
                onClick={() => {
                  clearSignature();
                  setIsModalOpen(true);
                }}
                className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-300 hover:text-cyan-200"
              >
                Apri riquadro firma (opzionale)
              </button> */}
            </div>
          </motion.form>

          {/* {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    Firma la domanda di ammissione
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-400">
                  Firma all&apos;interno del riquadro usando mouse o dito (su
                  mobile).
                </p>

                <div className="mt-4 flex justify-center">
                  <canvas
                    id="signature-pad"
                    ref={canvasRef}
                    width={350}
                    height={200}
                    className="rounded-xl border border-white/20 bg-slate-900"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[0.7rem] uppercase tracking-wide text-slate-300 underline"
                  >
                    Reset firma
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSignature}
                    className="rounded-full bg-linear-to-r from-emerald-400 to-cyan-500 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-black"
                  >
                    Conferma firma
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </section>
    </div>
  );
}

export default MembershipForm;
