import React, { useRef, useEffect } from "react";
import * as THREE from "three";
export default function NavbarBackground3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 64; // altezza approx header

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.6);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI SOFT
    const pinkLight = new THREE.PointLight(0xec4899, 0.9, 25);
    pinkLight.position.set(-6, 2, 8);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 0.9, 25);
    cyanLight.position.set(6, -2, 8);
    scene.add(cyanLight);

    // SOLO PARTICELLE (NO GEOMETRIE EVIDENTI)
    const particlesCount = 90;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 26; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 6; // y
      positions[i3 + 2] = -8 + Math.random() * 4; // z
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
      opacity: 0.85,
    });

    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // leggero movimento camera
      camera.position.x = Math.sin(t * 0.25) * 0.4;
      camera.lookAt(0, 0, 0);

      // rotazione lenta field
      particles.rotation.y = t * 0.12;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 64;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Layer per leggere testo sopra */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
    </div>
  );
}
