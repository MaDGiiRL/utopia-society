
import { useEffect, useRef } from "react";
import * as THREE from "three";

function MembershipBackground3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 600;

    // SCENA BASE
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.24);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // LUCI AMBIENTE LEGGERA
    const ambient = new THREE.AmbientLight(0x38bdf8, 0.5);
    scene.add(ambient);

    // SHADER BLOB MUTAFORMA
    const uniforms = {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#0ea5e9") }, // cyan
      uColor2: { value: new THREE.Color("#ec4899") }, // fucsia
      uColor3: { value: new THREE.Color("#a855f7") }, // violet
    };

    const vertexShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPos;

      // semplice noise fake
      float hash(vec3 p) {
        p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                 dot(p, vec3(269.5, 183.3, 246.1)),
                 dot(p, vec3(113.5, 271.9, 124.6)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        // smoothstep
        vec3 u = f*f*(3.0-2.0*f);

        float n000 = hash(i + vec3(0.,0.,0.));
        float n001 = hash(i + vec3(0.,0.,1.));
        float n010 = hash(i + vec3(0.,1.,0.));
        float n011 = hash(i + vec3(0.,1.,1.));
        float n100 = hash(i + vec3(1.,0.,0.));
        float n101 = hash(i + vec3(1.,0.,1.));
        float n110 = hash(i + vec3(1.,1.,0.));
        float n111 = hash(i + vec3(1.,1.,1.));

        float nx00 = mix(n000, n100, u.x);
        float nx01 = mix(n001, n101, u.x);
        float nx10 = mix(n010, n110, u.x);
        float nx11 = mix(n011, n111, u.x);

        float nxy0 = mix(nx00, nx10, u.y);
        float nxy1 = mix(nx01, nx11, u.y);

        return mix(nxy0, nxy1, u.z);
      }

      void main() {
        vNormal = normal;
        vPos = position;

        // raggio base
        float r = 1.8;

        // noise animato sul raggio
        float n = noise(normal * 2.5 + uTime * 0.7);
        float n2 = noise(normal * 4.0 - uTime * 0.4);
        float displacement = (n + n2) * 0.4;

        vec3 newPosition = normalize(position) * (r + displacement);

        // leggero respiro globale
        float breathe = 0.08 * sin(uTime * 0.8);
        newPosition *= (1.0 + breathe);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec3 vNormal;
      varying vec3 vPos;

      void main() {
        // normal in spazio view approx
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);

        float heightMask = clamp(vPos.y * 0.5 + 0.5, 0.0, 1.0);

        vec3 base = mix(uColor1, uColor2, heightMask);
        base = mix(base, uColor3, fresnel);

        // glow edge
        float rim = smoothstep(0.3, 1.0, fresnel);
        vec3 color = base + rim * 0.45;

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.IcosahedronGeometry(2.1, 5);
    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    // PARTICELLE AROUND
    const particlesCount = 360;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 5;
      const y = (Math.random() - 0.5) * 4;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // LOOP ANIMAZIONE
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      blob.rotation.y = t * 0.35;
      blob.rotation.x = Math.sin(t * 0.25) * 0.2;

      particles.rotation.y = t * 0.08;

      camera.position.z = 8 + Math.sin(t * 0.3) * 0.4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
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
      {/* Layer per tenere leggibile il form */}
      <div className="absolute inset-0" />
    </div>
  );
}

export default MembershipBackground3D;
