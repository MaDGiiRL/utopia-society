import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import { Instagram, Facebook } from "lucide-react";
import * as THREE from "three";

function ContactSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 500;

    // SCENA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.22);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI
    const ambient = new THREE.AmbientLight(0x38bdf8, 0.4);
    scene.add(ambient);

    const pinkLight = new THREE.PointLight(0xec4899, 1.4, 40);
    pinkLight.position.set(-6, 6, 8);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.4, 40);
    cyanLight.position.set(6, -4, 10);
    scene.add(cyanLight);

    // PAVIMENTO / GRIGLIA MORBIDA
    const planeGeom = new THREE.PlaneGeometry(40, 40, 40, 40);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    scene.add(plane);

    // BARRE / EQUALIZER 3D
    const bars = [];
    const barGeom = new THREE.BoxGeometry(0.4, 1, 0.4);

    const barColors = [0x22d3ee, 0xec4899, 0xa855f7, 0x38bdf8];

    const gridSizeX = 10;
    const gridSizeZ = 6;
    const spacing = 1.1;

    for (let x = -gridSizeX / 2; x < gridSizeX / 2; x++) {
      for (let z = -gridSizeZ / 2; z < gridSizeZ / 2; z++) {
        const color = barColors[Math.floor(Math.random() * barColors.length)];
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 1.3,
          metalness: 0.5,
          roughness: 0.25,
        });

        const bar = new THREE.Mesh(barGeom, mat);
        bar.position.set(x * spacing, -2.8, z * spacing);
        scene.add(bar);

        bars.push({
          mesh: bar,
          // fase casuale per avere movimento non uniforme
          phase: Math.random() * Math.PI * 2,
          band: Math.abs(x) + Math.abs(z),
        });
      }
    }

    // PARTICELLE SULLO SFONDO
    const particlesCount = 220;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 35;
    }

    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // ANELLO LUMINOSO STILE WAVE
    const ringGeom = new THREE.TorusGeometry(6, 0.04, 16, 180);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.55,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -2.4;
    scene.add(ring);

    // LOOP
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // Movimento camera leggero
      camera.position.x = Math.sin(t * 0.25) * 1.2;
      camera.position.y = 4.8 + Math.sin(t * 0.4) * 0.3;
      camera.lookAt(0, -1.5, 0);

      // Equalizer effect
      const bpm = 120;
      const beat = (t * bpm * Math.PI) / 60;

      bars.forEach(({ mesh, phase, band }) => {
        const intensity = Math.sin(beat * 0.5 + phase + band * 0.12);
        const height = 0.4 + Math.max(intensity, 0) * 3.2;

        mesh.scale.y = height;
        mesh.position.y = -3 + height / 2;

        mesh.rotation.y = Math.sin(t * 0.4 + phase) * 0.25;
      });

      // Particelle
      particles.rotation.y = t * 0.06;

      // Ring pulsante
      const ringScale = 1 + Math.sin(beat * 0.25) * 0.08;
      ring.scale.set(ringScale, ringScale, ringScale);
      ring.material.opacity = 0.4 + (Math.sin(beat * 0.5) + 1) * 0.2;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      planeGeom.dispose();
      planeMat.dispose();
      barGeom.dispose();
      bars.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      particlesGeom.dispose();
      particlesMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
    };
  }, []);

  return (
    <section id="contact" className="relative overflow-hidden py-30">
      {/* SFONDO 3D */}
      <div
        ref={containerRef}
        className="absolute inset-0 -z-10 pointer-events-none"
      >
        <canvas ref={canvasRef} className="h-full w-full" />
        {/* layer per contrasto sopra il 3D */}
        <div className="absolute inset-0" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-[1.1fr_1fr] relative">
        {/* Testo + social */}
        <motion.div {...fadeUp()}>
          <h2 className="text-xl font-semibold">Contattaci</h2>
          <p className="mt-3 text-sm text-slate-300">
            Per info su tavoli, eventi privati o partnership compila il form. Ti
            risponderemo il prima possibile.
          </p>

          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>
              Email:{" "}
              <span className="text-cyan-300">info@utopia-nightclub.it</span>
            </p>
          </div>

          {/* Social futuristici */}
          <motion.div
            {...fadeUp(0.15)}
            className="mt-8 inline-flex flex-col gap-3 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-slate-900/80 via-slate-950 to-black p-4 shadow-[0_0_25px_rgba(56,189,248,0.5)]"
          >
            <span className="text-[0.7rem] uppercase tracking-[0.25em] text-cyan-300">
              Follow Utopia
            </span>

            <div className="flex items-center gap-4">
              {/* Insta */}
              <motion.a
                href="https://www.instagram.com/utopia.society.pd"
                target="_blank"
                rel="noreferrer"
                className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-300 text-slate-50 shadow-[0_0_18px_rgba(244,114,182,0.7)]"
                whileHover={{
                  scale: 1.1,
                  rotate: 3,
                  boxShadow: "0 0 28px rgba(244,114,182,0.95)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="pointer-events-none absolute inset-[-30%] opacity-40 bg-[conic-gradient(from_180deg,_rgba(15,23,42,0)_0deg,_rgba(15,23,42,0.9)_120deg,_rgba(15,23,42,0)_240deg)] animate-[spin_4s_linear_infinite]" />
                <Instagram className="relative z-10 h-5 w-5" />
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="https://www.facebook.com/utopiasociety.pd"
                target="_blank"
                rel="noreferrer"
                className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-500 to-indigo-500 text-slate-50 shadow-[0_0_18px_rgba(59,130,246,0.7)]"
                whileHover={{
                  scale: 1.1,
                  rotate: -3,
                  boxShadow: "0 0 28px rgba(59,130,246,0.95)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="pointer-events-none absolute inset-[-30%] opacity-40 bg-[radial-gradient(circle_at_10%_0%,rgba(191,219,254,0.9),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(30,64,175,0.85),transparent_55%)] animate-pulse" />
                <Facebook className="relative z-10 h-5 w-5" />
              </motion.a>

              <div className="ml-1 text-[0.7rem] leading-relaxed text-slate-300">
                <p>Scopri lineup, eventi speciali</p>
                <p className="text-[0.65rem] text-slate-400">
                  Story, reel e aggiornamenti in tempo reale.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Form contatti */}
        <motion.form
          {...fadeUp(0.1)}
          className="space-y-4 rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-300">
              Nome
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              placeholder="Il tuo nome"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-300">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              placeholder="name@email.com"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-300">
              Messaggio
            </label>
            <textarea
              rows="4"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm outline-none focus:border-cyan-400"
              placeholder="Scrivici per info su tavoli, eventi o membership..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full text-white bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:brightness-110 transition"
          >
            Invia
          </button>
        </motion.form>
      </div>
    </section>
  );
}

export default ContactSection;
