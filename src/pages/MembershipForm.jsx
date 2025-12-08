// src/pages/MembershipForm.jsx
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import ScrollScene3D from "../components/ScrollScene3D";
import MembershipIntro from "../components/membership/MembershipIntro";
import MembershipFormHeader from "../components/membership/MembershipFormHeader";
import MembershipDocumentsSection from "../components/membership/MembershipDocumentsSection";
import MembershipConsentsSection from "../components/membership/MembershipConsentsSection";
import MembershipMessages from "../components/membership/MembershipMessages";
import MembershipSubmitRow from "../components/membership/MembershipSubmitRow";

// Base URL backend
const API_BASE =
  import.meta.env.VITE_ADMIN_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : null);

if (!API_BASE) {
  console.error(
    "VITE_ADMIN_API_URL non è configurata! Il frontend non sa dove chiamare l'Admin API."
  );
}

// 🔹 Helper: genera PNG con firma NERA su sfondo BIANCO
const generateSignatureBlackPng = (canvasOriginal) => {
  if (!canvasOriginal) return null;

  const tmp = document.createElement("canvas");
  tmp.width = canvasOriginal.width;
  tmp.height = canvasOriginal.height;

  const ctx = tmp.getContext("2d");

  // Disegniamo la firma così com'è (bianca su trasparente / sfondo scuro)
  ctx.drawImage(canvasOriginal, 0, 0);

  const imgData = ctx.getImageData(0, 0, tmp.width, tmp.height);
  const pixels = imgData.data;

  // Per ogni pixel:
  // - se ha alpha > 0 => è firma -> diventa nero pieno
  // - se alpha == 0   => sfondo -> diventa bianco pieno
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];

    if (a > 0) {
      // pixel "di firma" -> nero
      pixels[i] = 0; // R
      pixels[i + 1] = 0; // G
      pixels[i + 2] = 0; // B
      pixels[i + 3] = 255; // alpha pieno
    } else {
      // sfondo -> bianco
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return tmp.toDataURL("image/png");
};

function MembershipForm() {
  const { t } = useTranslation();
  const formRef = useRef(null);

  // Firma inline
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [frontName, setFrontName] = useState("");
  const [backName, setBackName] = useState("");

  // Setup eventi di disegno per la firma (sempre visibile)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const getRect = () => canvas.getBoundingClientRect();

    // 🔹 Firma visivamente bianca su sfondo scuro
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const getPos = (e) => {
      const rect = getRect();
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
  }, []);

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
    setSignatureDataUrl(null);
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

  // Submit "vero" del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);

    // ✅ Firma obbligatoria
    if (!hasSigned) {
      await Swal.fire({
        icon: "warning",
        title: t("membership.signatureMissingTitle", "Firma mancante"),
        text: t(
          "membership.signatureMissingText",
          "Per favore firma la domanda nel riquadro dedicato prima di inviare."
        ),
        confirmButtonText: "Ok",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    setLoading(true);

    // 🔹 Genera PNG con firma NERA (per il backend)
    let signatureDataUrlLocal = null;
    const canvas = canvasRef.current;
    if (canvas) {
      signatureDataUrlLocal = generateSignatureBlackPng(canvas);
      setSignatureDataUrl(signatureDataUrlLocal);
    }

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
      // 1) upload documenti
      const frontResult = await uploadDocumento(fileFront, "front");
      const backResult = await uploadDocumento(fileBack, "back");

      // 2) payload per /api/admin/members
      const payload = {
        full_name: fullName,
        email: formData.get("emailType"),
        phone: formData.get("telephone"),
        city: formData.get("city") || null,
        date_of_birth: formData.get("birthDate") || null,
        birth_place: formData.get("birthPlace") || null,
        fiscal_code: formData.get("fiscalCode") || null,
        note: formData.get("note") || null, // viene da MembershipNotesSection
        accept_privacy: formData.get("accept_privacy") === "on",
        accept_marketing: formData.get("accept_marketing") === "on",
        source: "membership_form",
        document_front_url: frontResult.url,
        document_back_url: backResult.url,
        signature_data_url: signatureDataUrlLocal || null,
      };

      const res = await fetch(`${API_BASE}/api/admin/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        console.error("Errore creazione membro", { status: res.status, data });
        throw new Error(data?.message || t("membership.errorGeneric"));
      }

      // reset UI
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
      <div className="pointer-events-none absolute inset-0 m-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.18),transparent_60%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.18),transparent_60%)]">
        <ScrollScene3D />
      </div>
      <section className="relative overflow-hidden py-24">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 lg:grid lg:grid-cols-[1.05fr_minmax(0,1.1fr)] lg:items-start">
          {/* COLONNA TESTO */}
          <MembershipIntro />

          {/* COLONNA FORM */}
          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-2 space-y-6 rounded-3xl border border-white/10 bg-black/70 p-6 md:p-7 text-sm backdrop-blur-xl shadow-[0_0_40px_rgba(15,23,42,0.8)] lg:mt-0"
          >
            <MembershipFormHeader />

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
            <MembershipDocumentsSection
              frontName={frontName}
              backName={backName}
              frontPreview={frontPreview}
              backPreview={backPreview}
              onFrontChange={(e) =>
                handleFileChange(e, setFrontPreview, setFrontName)
              }
              onBackChange={(e) =>
                handleFileChange(e, setBackPreview, setBackName)
              }
            />

            {/* FIRMA DIGITALE */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
                {t("membership.signatureTitle", "Firma digitale")}
              </p>
              <p className="text-[0.7rem] text-slate-400">
                {t(
                  "membership.signatureDescription",
                  "Firma all'interno del riquadro usando mouse o dito (su mobile)."
                )}
                <span className="ml-1 text-rose-400">*</span>
              </p>
              <div className="mb-2 overflow-hidden rounded-xl border border-white/15 bg-slate-900/80">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={220}
                  className="block w-full cursor-crosshair"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-slate-300 hover:border-amber-400 hover:text-amber-300"
                >
                  {t("membership.signatureClear", "Cancella firma")}
                </button>
              </div>
            </div>

            {/* CONSENSI */}
            <MembershipConsentsSection />

            {/* MESSAGGI + CTA */}
            <MembershipMessages
              error={error}
              ok={ok}
              successText={t("membership.successInline")}
            />

            <MembershipSubmitRow
              loading={loading}
              submitLabel={t("membership.submitIdle")}
              submitLoadingLabel={t("membership.submitLoading")}
            />
          </motion.form>
        </div>
      </section>
    </div>
  );
}

export default MembershipForm;
