import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/motionPresets";
import * as THREE from "three";

function AboutSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // progressione scroll globale (0 -> 1)
  const scrollProgressRef = useRef(0);

  // 🎚 hook scroll -> aggiorna scrollProgressRef
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const current = doc.scrollTop;
      scrollProgressRef.current =
        total > 0 ? current / total : 0;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🎥 scena Three.js + collegamento allo scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // SCENA BASE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 12);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI
    const ambient = new THREE.AmbientLight(0x4ade80, 0.3);
    scene.add(ambient);

    const pinkLight = new THREE.PointLight(0xec4899, 1.3, 30);
    pinkLight.position.set(-4, 4, 6);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.3, 30);
    cyanLight.position.set(4, -2, 6);
    scene.add(cyanLight);

    // TORUS KNOT CENTRALE
    const torusGeom = new THREE.TorusKnotGeometry(2, 0.5, 220, 40);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true,
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.position.y = 1.2;
    scene.add(torus);

    // GRID DANCEFLOOR
    const grid = new THREE.GridHelper(40, 40, 0x22d3ee, 0x1f2937);
    grid.position.y = -2.5;
    grid.position.z = 0;
    scene.add(grid);

    // LASER VERTICALI
    const lasers = [];
    const laserGeom = new THREE.BoxGeometry(0.1, 4, 0.1);
    const laserColors = [0x22d3ee, 0xec4899, 0xa855f7];

    const laserPositions = [-5, -3, -1, 1, 3, 5];

    laserPositions.forEach((x, index) => {
      const mat = new THREE.MeshStandardMaterial({
        color: laserColors[index % laserColors.length],
        emissive: laserColors[index % laserColors.length],
        emissiveIntensity: 1.8,
        metalness: 0.4,
        roughness: 0.1,
      });
      const mesh = new THREE.Mesh(laserGeom, mat);
      mesh.position.set(x, -0.5, -4 - Math.random() * 4);
      scene.add(mesh);
      lasers.push({ mesh, offset: Math.random() * Math.PI * 2 });
    });

    // PARTICELLE / STELLE
    const particlesCount = 260;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
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
      opacity: 0.85,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // ANIMAZIONE
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const scroll = scrollProgressRef.current; // 0 → 1

      // easing leggero sullo scroll
      const s = Math.pow(scroll, 0.9);

      // CAMERA – parallax vertical + zoom
      camera.position.y = 2 + s * 4;             // si alza scrollando
      camera.position.z = 12 - s * 4;            // si avvicina al dancefloor
      camera.position.x = Math.sin(s * Math.PI) * 1.2; // piccolo drift laterale
      camera.lookAt(0, 0.5, 0);

      // TORUS – più folle con lo scroll
      torus.rotation.x = t * 0.25 + s * Math.PI * 1.2;
      torus.rotation.y = t * 0.35 + s * Math.PI * 1.6;
      const torusScale = 1 + s * 0.6;
      torus.scale.set(torusScale, torusScale, torusScale);
      torus.position.y = 1.2 + Math.sin(t * 0.8 + s * 4.0) * 0.6;

      // PARTICELLE – swirl che si apre
      particles.rotation.y = t * 0.03 + s * 1.2;
      particles.rotation.x = Math.sin(t * 0.08) * 0.05 + s * 0.25;

      // Lasers pulsanti + scroll
      lasers.forEach(({ mesh, offset }, idx) => {
        const pulse = (Math.sin(t * 3 + offset) + 1.5) * 0.6 + 0.4;
        mesh.scale.y = pulse * (1 + s * 0.8); // più alti verso il fondo pagina
        mesh.position.y = -2.5 + pulse * 2 + s * 1.2;
        mesh.rotation.y = Math.sin(t * 0.7 + idx + s * 3.0) * 0.4;
      });

      // Grid – si inclina con lo scroll
      grid.rotation.x = Math.PI / 2 + Math.sin(t * 0.15) * 0.05 + s * 0.25;
      grid.position.y = -2.5 + s * 1.5;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 400;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
      laserGeom.dispose();
      lasers.forEach(({ mesh }) => {
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      });
    };
  }, []);

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Canvas 3D sullo sfondo */}
      <div
        ref={containerRef}
        className="absolute inset-0 -z-10 pointer-events-none"
      >
        <canvas ref={canvasRef} className="h-full w-full" />
        {/* Layer per contrasto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-slate-950/80 to-black/95" />
      </div>

      {/* Contenuto */}
      <div className="relative mx-auto max-w-5xl px-4">
        <motion.h2
          {...fadeUp()}
          className="text-center text-2xl font-semibold tracking-wide"
        >
          About{" "}
          <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
            Utopia
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-4 text-center text-sm text-slate-300 md:text-base"
        >
          Utopia è un club privato situato nel cuore della città. Un ambiente
          esclusivo, curato in ogni dettaglio, dove suoni elettronici,
          installazioni luminose e mixology di alto livello si fondono per
          creare un’esperienza unica.
        </motion.p>

        <motion.div
          {...fadeUp(0.15)}
          className="mt-10 grid gap-6 md:grid-cols-3 perspective-[1200px]"
        >
          {[
            {
              title: "Atmosfera futuristica",
              color: "text-cyan-300",
              text: "Luci al neon, laser e una scenografia digitale che trasforma la pista in un dancefloor virtuale.",
            },
            {
              title: "Musica selezionata",
              color: "text-fuchsia-300",
              text: "DJ resident e guest internazionali con sonorità house, techno, elettronica e contaminazioni moderne.",
            },
            {
              title: "Accesso riservato",
              color: "text-blue-300",
              text: "Ingresso solo per soci e accompagnatori registrati. Compila la domanda di ammissione online in pochi minuti.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
              whileHover={{
                y: -8,
                scale: 1.03,
                rotateX: -6,
                rotateY: 4,
              }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur group transform-gpu"
            >
              {/* bordo glow animato */}
              <div className="pointer-events-none absolute inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.22),transparent_55%)]" />

              {/* highlight diagonale */}
              <div className="pointer-events-none absolute -inset-x-10 -top-10 h-20 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-24 transition duration-700" />

              <div className="relative">
                <h3 className={`text-sm font-semibold ${item.color}`}>
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
