// src/components/HeroSection.jsx
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import * as THREE from "three";

// --- MINI SCENA 3D PER IL BOX LOGO ---
function HeroLogoBackground3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 288; // ~ w-72
    let height = container.clientHeight || 288; // ~ h-72

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.4);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI FUTURISTICHE
    const ambient = new THREE.AmbientLight(0x64748b, 0.4);
    scene.add(ambient);

    const pinkLight = new THREE.PointLight(0xec4899, 1.4, 40);
    pinkLight.position.set(-4, 3, 8);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.4, 40);
    cyanLight.position.set(4, -3, 8);
    scene.add(cyanLight);

    // TORUS “ANELLO” DIETRO AL LOGO
    const torusGeom = new THREE.TorusGeometry(2.3, 0.12, 32, 200);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    scene.add(torus);

    // ANELLO INTERNO FUCHSIA
    const innerGeom = new THREE.TorusGeometry(1.4, 0.08, 32, 160);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0x1e1030,
      metalness: 0.9,
      roughness: 0.18,
      transparent: true,
      opacity: 0.9,
    });
    const innerRing = new THREE.Mesh(innerGeom, innerMat);
    innerRing.rotation.x = Math.PI / 3;
    scene.add(innerRing);

    // PARTICELLE FLOTTANTI
    const particlesCount = 140;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 6;
      positions[i3 + 2] = -4 + Math.random() * 4;
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
      opacity: 0.9,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // rotazione anelli
      torus.rotation.x = Math.sin(t * 0.6) * 0.4;
      torus.rotation.y = t * 0.4;

      innerRing.rotation.y = -t * 0.6;
      innerRing.rotation.z = Math.sin(t * 0.5) * 0.3;

      // particelle
      particles.rotation.y = t * 0.12;
      particles.rotation.x = Math.sin(t * 0.25) * 0.08;

      // breathing camera
      camera.position.z = 10 + Math.sin(t * 0.6) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 288;
      height = container.clientHeight || 288;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* leggera tinta per unire col resto del layout */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.2),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.25),transparent_55%)]" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_60%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-24 pt-24 md:flex-row md:pt-24">
        <motion.div
          {...fadeUp()}
          className="flex-1 text-center md:text-left space-y-5"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Night Club • Members Only
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Benvenuto in{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Utopia
            </span>
            .
          </h1>
          <p className="max-w-xl text-sm text-slate-300 md:text-base">
            Un club privato dove luci, musica e design futuristico si
            incontrano. Accesso riservato ai soci, esperienze fuori dal
            quotidiano.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <a
              href="/ammissione-socio"
              className="inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_0_25px_rgba(56,189,248,0.75)] hover:brightness-110 transition"
            >
              Diventa socio
            </a>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="flex-1 flex justify-center">
          <div className="relative h-72 w-72 rounded-[2.5rem] border border-cyan-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] overflow-hidden">
            {/* SFONDO 3D */}
            <HeroLogoBackground3D />

            {/* LOGO ANIMATO SOPRA LA SCENA 3D */}
            <motion.img
              src="/img/logo-small.png"
              alt="Utopia Logo"
              className="absolute inset-0 m-auto w-40 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(56,189,248,0.8)]"
              animate={{
                x: [0, -10, 8, -6, 0],
                y: [0, -8, 6, -4, 0],
                rotate: [0, 2, -2, 1, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Testi orari */}
            <span className="absolute bottom-5 left-6 text-xs font-medium tracking-[0.2em] uppercase text-slate-200">
              Friday / Saturday
            </span>
            <span className="absolute bottom-5 right-8 text-xs text-cyan-200">
              23:30 – Late
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
