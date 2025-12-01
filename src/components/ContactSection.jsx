import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { Instagram, Facebook, Send } from "lucide-react";
import * as THREE from "three";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

function SocialBox3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 320;
    let height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.6);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    const ambient = new THREE.AmbientLight(0x64748b, 0.5);
    scene.add(ambient);

    const pinkLight = new THREE.PointLight(0xec4899, 0.9, 25);
    pinkLight.position.set(-3, 1.5, 6);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 0.9, 25);
    cyanLight.position.set(3, -1.5, 6);
    scene.add(cyanLight);

    const ringGeom = new THREE.TorusGeometry(2.4, 0.05, 32, 200);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x020617,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    scene.add(ring);

    const innerGeom = new THREE.TorusGeometry(1.5, 0.04, 32, 160);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0x050114,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.95,
    });
    const innerRing = new THREE.Mesh(innerGeom, innerMat);
    innerRing.rotation.x = Math.PI / 3;
    scene.add(innerRing);

    const sphereGeom = new THREE.SphereGeometry(0.12, 24, 24);

    const igMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 1.3,
      metalness: 0.7,
      roughness: 0.25,
    });
    const fbMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 1.3,
      metalness: 0.7,
      roughness: 0.25,
    });

    const igSphere = new THREE.Mesh(sphereGeom, igMat);
    const fbSphere = new THREE.Mesh(sphereGeom, fbMat);
    scene.add(igSphere);
    scene.add(fbSphere);

    const particlesCount = 70;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 7;
      positions[i3 + 1] = (Math.random() - 0.5) * 3;
      positions[i3 + 2] = -3 + Math.random() * 2;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      ring.rotation.x = Math.sin(t * 0.4) * 0.2;
      ring.rotation.y = t * 0.35;

      innerRing.rotation.y = -t * 0.6;
      innerRing.rotation.z = Math.sin(t * 0.45) * 0.3;

      const r = 2;
      igSphere.position.set(Math.cos(t * 0.8) * r, Math.sin(t * 0.8) * 0.4, 0);
      fbSphere.position.set(
        Math.cos(t * 0.8 + Math.PI) * r,
        Math.sin(t * 0.8 + Math.PI) * 0.4,
        0
      );

      particles.rotation.y = t * 0.12;

      camera.position.z = 9 + Math.sin(t * 0.4) * 0.35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 320;
      height = container.clientHeight || 160;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      sphereGeom.dispose();
      igMat.dispose();
      fbMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10 rounded-2xl overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute inset-0 bg-linear-to-br from-black/40 via-transparent to-black/60" />
    </div>
  );
}

function ContactSection() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const cardsY = useTransform(scrollYProgress, [0, 1], [20, -10]);

  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setOk(false);
    setError("");

    const form = new FormData(e.target);

    const payload = {
      name: form.get("name")?.trim() || "",
      email: form.get("email")?.trim() || "",
      phone: form.get("phone")?.trim() || "",
      message: form.get("message")?.trim() || "",
      source_page: "contact_section",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        console.error("Errore /api/contact:", data);
        throw new Error(data.message || "Errore invio messaggio");
      }

      setOk(true);
      e.target.reset();
    } catch (err) {
      console.error(err);
      setError(t("contact.formError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden py-20 min-h-[90vh]"
    >
      <div className="relative mx-auto max-w-5xl px-4">
        <motion.div
          style={{ y: cardsY }}
          className="grid gap-10 md:grid-cols-[1.1fr_minmax(0,1fr)] items-start"
        >
          {/* Testo + social */}
          <motion.div {...fadeUp()}>
            <p className="mb-2 text-[0.7rem] uppercase tracking-[0.35em] text-cyan-300">
              {t("contact.badge")}
            </p>

            <motion.h2
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.9,
                letterSpacing: "0em",
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                letterSpacing: "0.18em",
              }}
              transition={{
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.14em] uppercase"
            >
              {t("contact.title")}
            </motion.h2>

            <p className="mt-3 text-sm text-slate-300">
              {t("contact.description")}
            </p>

            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p>
                {t("contact.emailLabel")}:{" "}
                <span className="text-cyan-300">
                  {t("contact.emailAddress")}
                </span>
              </p>
            </div>

            {/* Social box con scena 3D minimal */}
            <motion.div
              {...fadeUp(0.15)}
              className="relative mt-8 inline-flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-sm transform-gpu overflow-hidden"
              whileHover={{
                rotateX: -4,
                rotateY: 4,
                translateY: -6,
              }}
              transition={{ type: "spring", stiffness: 170, damping: 18 }}
            >
              <SocialBox3D />

              <div className="relative z-10">
                <span className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-300">
                  {t("contact.socialTagline")}
                </span>

                <div className="mt-3 flex items-center gap-4">
                  <motion.a
                    href="https://www.instagram.com/utopia.society.pd"
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-tr from-fuchsia-500 via-rose-500 to-amber-300 text-slate-50"
                    whileHover={{
                      scale: 1.08,
                      rotate: 3,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram className="relative z-10 h-5 w-5 drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
                  </motion.a>

                  <motion.a
                    href="https://www.facebook.com/utopiasociety.pd"
                    target="_blank"
                    rel="noreferrer"
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-tr from-sky-500 via-blue-500 to-indigo-500 text-slate-50"
                    whileHover={{
                      scale: 1.08,
                      rotate: -3,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Facebook className="relative z-10 h-5 w-5 drop-shadow-[0_0_8px_rgba(15,23,42,0.8)]" />
                  </motion.a>

                  <div className="ml-1 max-w-[220px] text-[0.7rem] leading-relaxed text-slate-300">
                    <p>{t("contact.socialLine1")}</p>
                    <p className="text-[0.65rem] text-slate-400">
                      {t("contact.socialLine2")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Form contatti con effetto 3D */}
          <motion.form
            {...fadeUp(0.1)}
            style={{ y: cardsY }}
            className="space-y-4 rounded-2xl border border-white/10 bg-black/65 p-5 backdrop-blur transform-gpu"
            onSubmit={handleSubmit}
            whileHover={{
              rotateX: -3,
              rotateY: -3,
              translateY: -6,
            }}
            transition={{ type: "spring", stiffness: 170, damping: 20 }}
          >
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                {t("contact.formNameLabel")}
              </label>
              <input
                name="name"
                type="text"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder={t("contact.formNamePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                {t("contact.formEmailLabel")}
              </label>
              <input
                name="email"
                type="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder={t("contact.formEmailPlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                {t("contact.formPhoneLabel")}
              </label>
              <input
                name="phone"
                type="tel"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder={t("contact.formPhonePlaceholder")}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-slate-300">
                {t("contact.formMessageLabel")}
              </label>
              <textarea
                name="message"
                rows="4"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                placeholder={t("contact.formMessagePlaceholder")}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                {error}
              </div>
            )}
            {ok && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200">
                {t("contact.formSuccess")}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={sending}
              className={`w-full rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(56,189,248,0.7)] hover:brightness-110 transition ${
                sending ? "opacity-60 cursor-not-allowed" : ""
              }`}
              whileTap={{ scale: sending ? 1 : 0.96 }}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Send className="h-3.5 w-3.5" />
                {sending ? t("contact.submitSending") : t("contact.submitIdle")}
              </span>
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
