// src/components/FooterBackground3D.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

function FooterBackground3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 220; // altezza approx footer

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.35);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 80);
    camera.position.set(0, 4, 16);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI
    const ambient = new THREE.AmbientLight(0x64748b, 0.4);
    scene.add(ambient);

    const pinkLight = new THREE.PointLight(0xec4899, 1.1, 50);
    pinkLight.position.set(-6, 6, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.1, 50);
    cyanLight.position.set(6, 2, 10);
    scene.add(cyanLight);

    // GRID / DANCEFLOOR
    const grid = new THREE.GridHelper(40, 40, 0x22d3ee, 0x111827);
    grid.position.y = -1.5;
    grid.position.z = 0;
    scene.add(grid);

    // PICCOLI PILASTRI NEON (molto low-key)
    const columns = [];
    const colGeom = new THREE.CylinderGeometry(0.06, 0.06, 3, 16);
    const colColors = [0x22d3ee, 0xec4899, 0xa855f7];

    for (let i = -4; i <= 4; i += 2) {
      const colMat = new THREE.MeshStandardMaterial({
        color: colColors[((i + 4) / 2) % colColors.length],
        emissive: colColors[((i + 4) / 2) % colColors.length],
        emissiveIntensity: 1.4,
        metalness: 0.4,
        roughness: 0.2,
      });
      const col = new THREE.Mesh(colGeom, colMat);
      col.position.set(i, 0, -6 - Math.random() * 3);
      scene.add(col);
      columns.push({ mesh: col, offset: Math.random() * Math.PI * 2 });
    }

    // PARTICELLE
    const particlesCount = 180;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = Math.random() * 6;
      positions[i3 + 2] = -12 + Math.random() * 10;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      // leggera oscillazione camera
      camera.position.x = Math.sin(t * 0.25) * 0.8;
      camera.position.y = 3.8 + Math.sin(t * 0.3) * 0.3;
      camera.lookAt(0, 0, -4);

      // grid “respiro”
      grid.rotation.x = Math.PI / 2 + Math.sin(t * 0.35) * 0.08;

      // colonne pulsanti
      columns.forEach(({ mesh, offset }, idx) => {
        const pulse = (Math.sin(t * 3 + offset) + 1.5) * 0.25 + 0.6;
        mesh.scale.y = pulse;
        mesh.position.y = -1.5 + pulse * 1.5;
        mesh.rotation.y = Math.sin(t * 0.6 + idx) * 0.3;
      });

      // particelle
      particles.rotation.y = t * 0.12;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 220;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      grid.geometry?.dispose?.();
      grid.material?.dispose?.();
      colGeom.dispose();
      columns.forEach(({ mesh }) => {
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      });
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
      {/* layer per mantenere contrasto su testo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/75 to-transparent" />
    </div>
  );
}

export default FooterBackground3D;
