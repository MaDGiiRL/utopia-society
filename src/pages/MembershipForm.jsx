// src/pages/MembershipForm.jsx
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useTranslation, Trans } from "react-i18next";
import ScrollScene3D from "../components/ScrollScene3D";
import { supabase } from "../lib/supabaseClient";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

// Base URL backend
const API_BASE =
  import.meta.env.VITE_ADMIN_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : null);

if (!API_BASE) {
  console.error(
    "VITE_ADMIN_API_URL non è configurata! Il frontend non sa dove chiamare l'Admin API."
  );
}

function MembershipForm() {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [frontName, setFrontName] = useState("");
  const [backName, setBackName] = useState("");

  // Firma (se la riattivi)
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

  const handleFileChange = (e, setPreview, setName) => {
    const file = e.target.files?.[0];

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

  const uploadDocumento = async (file, tipo) => {
    if (!API_BASE) {
      throw new Error(t("membership.apiBaseMissing"));
    }

    const todayFolder = new Date().toISOString().slice(0, 10);
    const random =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const path = `${todayFolder}/${random}_${tipo}_${file.name}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const res = await fetch(`${API_BASE}/api/admin/upload-document`, {
      method: "POST",
      body: formData,
    });

    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      // non è JSON
    }

    if (!res.ok || !data.ok) {
      console.error("Upload documento failed", {
        status: res.status,
        raw,
        data,
      });
      const prefix = t("membership.uploadErrorPrefix");
      throw new Error(
        data.message ||
          `${prefix} (HTTP ${res.status}) – ${t("membership.errorGeneric")}`
      );
    }

    return {
      path: data.path,
      url: data.signedUrl,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk(false);

    const formData = new FormData(e.target);

    const name = formData.get("associatedName") || "";
    const surname = formData.get("associatedSurname") || "";
    const fullName = `${name} ${surname}`.trim();

    const fileFront = formData.get("document_front");
    const fileBack = formData.get("document_back");

    if (!fileFront || !fileFront.size || !fileBack || !fileBack.size) {
      setLoading(false);
      setError(t("membership.errorMissingDocs"));
      return;
    }

    try {
      const frontResult = await uploadDocumento(fileFront, "front");
      const backResult = await uploadDocumento(fileBack, "back");

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
        setError(t("membership.errorGeneric"));
        return;
      }

      setOk(true);
      e.target.reset();
      clearSignature();
      setHasSigned(false);

      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
      setFrontPreview(null);
      setBackPreview(null);
      setFrontName("");
      setBackName("");

      await Swal.fire({
        icon: "success",
        title: t("membership.alertSuccessTitle"),
        text: t("membership.alertSuccessText"),
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || t("membership.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh]">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 m-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.18),transparent_60%)]" />

      <ScrollScene3D />

      <section className="relative overflow-hidden py-24">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:grid lg:grid-cols-[1.05fr_minmax(0,1.1fr)] lg:items-start">
          {/* COLONNA TESTO */}
          <motion.div
            {...fadeUp()}
            className="space-y-6 text-center lg:text-left"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.4em] text-cyan-300">
              {t("membership.badge")}
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
              {/* gestione <strong> nel testo con Trans */}
              <Trans
                i18nKey="membership.title"
                components={{
                  strong: (
                    <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent" />
                  ),
                }}
              />
            </motion.h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto lg:mx-0">
              {t("membership.description")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start text-[0.7rem]">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 uppercase tracking-[0.2em] text-cyan-200">
                {t("membership.stepBadge")}
              </span>
              <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-3 py-1 uppercase tracking-[0.18em] text-fuchsia-200">
                {t("membership.stepLabel")}
              </span>
            </div>

            <div className="hidden md:flex flex-col gap-2 text-[0.75rem] text-slate-300 pt-4 border-t border-white/10 max-w-md lg:max-w-none">
              <p className="uppercase tracking-[0.22em] text-slate-400">
                {t("membership.needTitle")}
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                <li>{t("membership.needItem1")}</li>
                <li>{t("membership.needItem2")}</li>
                <li>{t("membership.needItem3")}</li>
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
                  {t("membership.formHeaderBadge")}
                </p>
                <p className="text-xs text-slate-200">
                  {t("membership.formHeaderSubtitle")}
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300">
                {t("membership.formHeaderChip")}
              </div>
            </div>

            {/* DATI ANAGRAFICI */}
            <div className="space-y-3">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.sectionPersonal")}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelName")}
                  </label>
                  <input
                    id="associatedName"
                    name="associatedName"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderName")}
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelSurname")}
                  </label>
                  <input
                    id="associatedSurname"
                    name="associatedSurname"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderSurname")}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelBirthPlace")}
                  </label>
                  <input
                    id="birthPlace"
                    name="birthPlace"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderBirthPlace")}
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelBirthDate")}
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

            {/* CONTATTI */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.sectionContacts")}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelFiscalCode")}
                  </label>
                  <input
                    id="fiscalCode"
                    name="fiscalCode"
                    maxLength={16}
                    minLength={16}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm uppercase outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderFiscalCode")}
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelEmail")}
                  </label>
                  <input
                    id="emailType"
                    name="emailType"
                    type="email"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderEmail")}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelPhone")}
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    maxLength={10}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderPhone")}
                    required
                  />
                </div>
                <div>
                  <label className="text-[0.7rem] uppercase tracking-wide text-slate-300">
                    {t("membership.labelCity")}
                  </label>
                  <input
                    id="city"
                    name="city"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                    placeholder={t("membership.placeholderCity")}
                    required
                  />
                </div>
              </div>
            </div>

            {/* DOCUMENTO */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.sectionDocument")}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Fronte */}
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/60 bg-slate-950/70 px-4 py-6 text-center text-xs text-slate-200 hover:border-cyan-300 transition">
                  <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-cyan-300">
                    {t("membership.docFrontTitle")}
                  </span>
                  {frontName && (
                    <span className="mb-1 text-[0.65rem] text-cyan-200/90">
                      {frontName}
                    </span>
                  )}
                  <span className="text-[0.65rem] text-slate-400">
                    {t("membership.docFrontSubtitle")}
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
                    {t("membership.docBackTitle")}
                  </span>
                  {backName && (
                    <span className="mb-1 text-[0.65rem] text-fuchsia-200/90">
                      {backName}
                    </span>
                  )}
                  <span className="text-[0.65rem] text-slate-400">
                    {t("membership.docBackSubtitle")}
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

            {/* NOTE */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.sectionNotes")}
              </p>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder={t("membership.notesPlaceholder")}
              />
            </div>

            {/* CONSENSI */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.sectionConsents")}
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
                    <Trans
                      i18nKey="membership.consentPrivacy"
                      components={{
                        link: (
                          <a
                            href="/pdf/privacy.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 underline"
                          />
                        ),
                      }}
                    />
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
                    <Trans
                      i18nKey="membership.consentStatute"
                      components={{
                        link: (
                          <a
                            href="/pdf/statuto.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 underline"
                          />
                        ),
                      }}
                    />
                  </span>
                </label>

                <label className="flex items-start gap-2">
                  <input
                    id="accept_marketing"
                    name="accept_marketing"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>{t("membership.consentMarketing")}</span>
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
                {t("membership.successInline")}
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
                {loading
                  ? t("membership.submitLoading")
                  : t("membership.submitIdle")}
              </button>

              {/* bottone per la firma (se lo riattivi) */}
              {/* 
              <button
                type="button"
                onClick={() => {
                  clearSignature();
                  setIsModalOpen(true);
                }}
                className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-300 hover:text-cyan-200"
              >
                Apri riquadro firma (opzionale)
              </button>
              */}
            </div>
          </motion.form>

          {/* MODALE FIRMA (ancora commentata come nel tuo codice) */}
          {/* 
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              ...
            </div>
          )} 
          */}
        </div>
      </section>
    </div>
  );
}

export default MembershipForm;
