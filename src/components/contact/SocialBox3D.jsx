
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function SocialBox3D() {
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
