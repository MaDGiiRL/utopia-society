import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import MembershipBackground3D from "../components/MembershipBackground3D";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

function MembershipForm() {
  const formRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Setup canvas firma
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

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // apri modale firma
    setIsModalOpen(true);
  };

  const handleConfirmSignature = () => {
    if (!hasSigned) {
      Swal.fire({
        icon: "warning",
        title: "Firma mancante",
        text: "Per favore firma la domanda prima di confermare.",
        confirmButtonText: "Ok",
      });
      return;
    }

    setIsModalOpen(false);

    Swal.fire({
      icon: "success",
      title: "Registrazione effettuata",
      text: "La tua domanda di ammissione è stata inviata.",
      confirmButtonText: "Chiudi",
      confirmButtonColor: "#22c55e",
      background: "#020617",
      color: "#e5e7eb",
    });

    // reset form & firma
    formRef.current?.reset();
    clearSignature();
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      {/* SFONDO 3D FUTURISTICO */}
      <MembershipBackground3D />

      {/* CONTENUTO FORM */}
      <div className="relative mx-auto max-w-3xl px-6">
        <motion.h1
          {...fadeUp()}
          className="text-center text-2xl font-semibold tracking-wide"
        >
          Domanda di ammissione a{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Socio Utopia
          </span>
        </motion.h1>
        <motion.p
          {...fadeUp(0.1)}
          className="mt-2 text-center text-xs text-slate-300"
        >
          Da effettuare almeno 24 ore prima dell&apos;ingresso in struttura.
        </motion.p>

        <motion.form
          {...fadeUp(0.15)}
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-black/60 p-6 text-sm backdrop-blur"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Nome
              </label>
              <input
                id="associatedName"
                name="associatedName"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Nome"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Cognome
              </label>
              <input
                id="associatedSurname"
                name="associatedSurname"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Cognome"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Nato/a a
              </label>
              <input
                id="birthPlace"
                name="birthPlace"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Luogo di nascita"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Data di nascita
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Codice fiscale
              </label>
              <input
                id="fiscalCode"
                name="fiscalCode"
                maxLength={16}
                minLength={16}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm uppercase outline-none focus:border-cyan-400"
                placeholder="Codice fiscale"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Email
              </label>
              <input
                id="emailType"
                name="emailType"
                type="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Email"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                Cellulare
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                maxLength={10}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder="Numero cellulare"
                required
              />
            </div>
          </div>

          {/* Upload documento */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Foto documento (fronte / retro)
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-400/60 bg-slate-900/50 px-4 py-6 text-center text-xs text-slate-200 hover:border-cyan-300">
                <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-cyan-300">
                  Fronte
                </span>
                <span className="text-[0.65rem] text-slate-400">
                  Carica o scatta la foto del fronte del documento
                </span>
                <input
                  id="cameraInputFronte"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  required
                />
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-fuchsia-400/60 bg-slate-900/50 px-4 py-6 text-center text-xs text-slate-200 hover:border-fuchsia-300">
                <span className="mb-1 text-[0.7rem] uppercase tracking-wide text-fuchsia-300">
                  Retro
                </span>
                <span className="text-[0.65rem] text-slate-400">
                  Carica o scatta la foto del retro del documento
                </span>
                <input
                  id="cameraInputRetro"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          {/* Consensi */}
          <div className="space-y-2 text-xs text-slate-300">
            <label className="flex items-start gap-2">
              <input
                id="autorize1"
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
                id="autorize2"
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
          </div>

          <div className="pt-4">
            <button
              id="btnSubmit"
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(56,189,248,0.8)] hover:brightness-110 transition"
            >
              Registrati
            </button>
          </div>
        </motion.form>

        {/* MODALE FIRMA */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Firma la domanda di ammissione
                </h2>
                <button
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
                  onClick={clearSignature}
                  className="text-[0.7rem] uppercase tracking-wide text-slate-300 underline"
                >
                  Reset firma
                </button>
                <button
                  onClick={handleConfirmSignature}
                  className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-black"
                >
                  Conferma firma
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MembershipForm;
