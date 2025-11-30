import { useEffect, useRef } from "react";
import { useScroll, useSpring } from "framer-motion";
import * as THREE from "three";

// --- AUDIO CONDIVISO A LIVELLO DI MODULO ---
let sharedAudioContext = null;
let sharedAnalyser = null;
let sharedFreqData = null;
let sharedSource = null;

export default function ScrollScene3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // per un po' di "beat detection" sui bassi
  const prevBassRef = useRef(0);
  const lastBeatTimeRef = useRef(0);

  // smoothing per movimenti più morbidi
  const smoothedBassRef = useRef(0);
  const smoothedMidRef = useRef(0);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    mass: 0.3,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = window.innerHeight; // canvas full viewport

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.25);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 80);
    camera.position.set(0, 2, 12);

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

    const pinkLight = new THREE.PointLight(0xec4899, 1.4, 50);
    pinkLight.position.set(-6, 6, 10);
    scene.add(pinkLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.4, 50);
    cyanLight.position.set(6, -4, 10);
    scene.add(cyanLight);

    // === GRUPPI lungo Y: hero / about / membership / contact ===
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, 2.2, 0);
    scene.add(heroGroup);

    const aboutGroup = new THREE.Group();
    aboutGroup.position.set(0, 0, 0);
    scene.add(aboutGroup);

    const membershipGroup = new THREE.Group();
    membershipGroup.position.set(0, -2.3, 0);
    scene.add(membershipGroup);

    const contactGroup = new THREE.Group();
    contactGroup.position.set(0, -4.5, 0);
    scene.add(contactGroup);

    // --- HERO: anello & particelle ---
    const heroTorusGeom = new THREE.TorusGeometry(2.3, 0.12, 32, 200);
    const heroTorusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0f172a,
      metalness: 0.9,
      roughness: 0.25,
      transparent: true,
      opacity: 0.9,
    });
    const heroTorus = new THREE.Mesh(heroTorusGeom, heroTorusMat);
    heroGroup.add(heroTorus);

    const innerGeom = new THREE.TorusGeometry(1.4, 0.08, 32, 160);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0x1e1030,
      metalness: 0.9,
      roughness: 0.18,
      transparent: true,
      opacity: 0.95,
    });
    const innerRing = new THREE.Mesh(innerGeom, innerMat);
    innerRing.rotation.x = Math.PI / 3;
    heroGroup.add(innerRing);

    // particelle intorno al hero
    const heroParticlesCount = 120;
    const heroPositions = new Float32Array(heroParticlesCount * 3);
    for (let i = 0; i < heroParticlesCount; i++) {
      const i3 = i * 3;
      heroPositions[i3] = (Math.random() - 0.5) * 10;
      heroPositions[i3 + 1] = (Math.random() - 0.5) * 5;
      heroPositions[i3 + 2] = -5 + Math.random() * 5;
    }
    const heroParticlesGeom = new THREE.BufferGeometry();
    heroParticlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(heroPositions, 3)
    );
    const heroParticlesMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    const heroParticles = new THREE.Points(heroParticlesGeom, heroParticlesMat);
    heroGroup.add(heroParticles);

    // --- ABOUT: dancefloor + lasers ---
    const grid = new THREE.GridHelper(40, 40, 0x22d3ee, 0x111827);
    grid.position.y = -2.5;
    aboutGroup.add(grid);

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
      mesh.position.set(x, -1.5, -4 - Math.random() * 4);
      aboutGroup.add(mesh);
      lasers.push({ mesh, offset: Math.random() * Math.PI * 2 });
    });

    // --- MEMBERSHIP: blob mutaforma (shader) ---
    const uniforms = {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#0ea5e9") },
      uColor2: { value: new THREE.Color("#ec4899") },
      uColor3: { value: new THREE.Color("#a855f7") },
    };

    const vertexShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPos;

      float hash(vec3 p) {
        float h = dot(p, vec3(127.1, 311.7, 74.7));
        return -1.0 + 2.0 * fract(sin(h) * 43758.5453123);
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
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

        float r = 1.8;
        float n = noise(normal * 2.5 + uTime * 0.7);
        float n2 = noise(normal * 4.0 - uTime * 0.4);
        float displacement = (n + n2) * 0.4;

        vec3 newPosition = normalize(position) * (r + displacement);
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
        vec3 n = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);

        float heightMask = clamp(vPos.y * 0.5 + 0.5, 0.0, 1.0);

        vec3 base = mix(uColor1, uColor2, heightMask);
        base = mix(base, uColor3, fresnel);

        float rim = smoothstep(0.3, 1.0, fresnel);
        vec3 color = base + rim * 0.45;

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const blobMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const blobGeom = new THREE.IcosahedronGeometry(2.1, 5);
    const blob = new THREE.Mesh(blobGeom, blobMaterial);
    membershipGroup.add(blob);

    // particelle vicino al blob
    const memParticlesCount = 260;
    const memPositions = new Float32Array(memParticlesCount * 3);
    for (let i = 0; i < memParticlesCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 4;
      const y = (Math.random() - 0.5) * 4;

      memPositions[i3] = Math.cos(angle) * radius;
      memPositions[i3 + 1] = y;
      memPositions[i3 + 2] = Math.sin(angle) * radius;
    }
    const memParticlesGeom = new THREE.BufferGeometry();
    memParticlesGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(memPositions, 3)
    );
    const memParticlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const memParticles = new THREE.Points(memParticlesGeom, memParticlesMat);
    membershipGroup.add(memParticles);

    // --- CONTACT: equalizer 3D ---
    const planeGeom = new THREE.PlaneGeometry(40, 40, 40, 40);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3.5;
    contactGroup.add(plane);

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
        bar.position.set(x * spacing, -3.8, z * spacing);
        contactGroup.add(bar);

        bars.push({
          mesh: bar,
          band: Math.abs(x) + Math.abs(z),
          height: 0.4,
        });
      }
    }

    // ===== AUDIO: Web Audio API (bassi, medi, equalizer) =====
    let audioContext = null;
    let analyser = null;
    let freqData = null;
    let hasAudio = false;
    let audioEl = null;
    let playListener = null;

    if (typeof window !== "undefined") {
      audioEl = document.getElementById("club-audio");
      const AudioCtx = window.AudioContext || window.webkitAudioContext;

      if (audioEl && AudioCtx) {
        if (sharedAudioContext && sharedAnalyser && sharedFreqData) {
          // riusa il context e l'analyser già creati
          audioContext = sharedAudioContext;
          analyser = sharedAnalyser;
          freqData = sharedFreqData;
          hasAudio = true;
        } else {
          audioContext = new AudioCtx();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          const source = audioContext.createMediaElementSource(audioEl);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          freqData = new Uint8Array(analyser.frequencyBinCount);
          hasAudio = true;

          sharedAudioContext = audioContext;
          sharedAnalyser = analyser;
          sharedFreqData = freqData;
          sharedSource = source;
        }

        playListener = () => {
          if (audioContext.state === "suspended") {
            audioContext.resume();
          }
        };
        audioEl.addEventListener("play", playListener);
      }
    }

    // === LOOP & SCROLL BINDING ===
    let frameId;
    const clock = new THREE.Clock();
    let progress = 0;

    const unsub = smoothProgress.on("change", (v) => {
      progress = v; // 0-1
    });

    const animate = () => {
      const t = clock.getElapsedTime();
      const p = progress; // scroll 0-1

      // === AUDIO: bassi + medi ===
      let bassLevel = 0;
      let midLevel = 0;
      let hasFreq = false;

      if (hasAudio && analyser && freqData) {
        analyser.getByteFrequencyData(freqData);
        hasFreq = true;
        const len = freqData.length;

        const bassEnd = Math.floor(len * 0.15);
        const midStart = bassEnd;
        const midEnd = Math.floor(len * 0.45);

        let bassSum = 0;
        let bassCount = 0;
        let midSum = 0;
        let midCount = 0;

        for (let i = 0; i < bassEnd; i++) {
          bassSum += freqData[i];
          bassCount++;
        }
        for (let i = midStart; i < midEnd; i++) {
          midSum += freqData[i];
          midCount++;
        }

        bassLevel = bassCount ? bassSum / bassCount / 255 : 0;
        midLevel = midCount ? midSum / midCount / 255 : 0;
      } else {
        // fallback se non c'è audio / permessi
        bassLevel = Math.sin(t * 2.0) * 0.5 + 0.5;
        midLevel = Math.cos(t * 1.2) * 0.5 + 0.5;
      }

      // smoothing per movimenti morbidi
      const smoothedBass = smoothedBassRef.current * 0.8 + bassLevel * 0.2;
      const smoothedMid = smoothedMidRef.current * 0.8 + midLevel * 0.2;
      smoothedBassRef.current = smoothedBass;
      smoothedMidRef.current = smoothedMid;

      // beat detection semplice sui bassi (usa valore non smussato)
      const prevBass = prevBassRef.current;
      const bassDelta = bassLevel - prevBass;
      if (bassDelta > 0.18 && bassLevel > 0.35) {
        lastBeatTimeRef.current = t;
      }
      prevBassRef.current = bassLevel;

      const timeSinceBeat = t - lastBeatTimeRef.current;
      const beatPulse = Math.max(0, 1 - timeSinceBeat * 4); // decresce veloce

      // camera che scende lungo i gruppi, leggermente influenzata dall'audio
      const camY = THREE.MathUtils.lerp(2.5, -4.5, p);
      const camZ =
        12 + Math.sin(t * 0.4) * 0.6 - beatPulse * 0.7 - smoothedBass * 0.5;
      camera.position.set(
        Math.sin(t * 0.2) * (0.5 + smoothedMid * 0.4),
        camY + Math.sin(t * 0.3) * 0.3 * (0.6 + smoothedMid * 0.4),
        camZ
      );
      camera.lookAt(0, camY, 0);

      // hero
      heroTorus.rotation.x = Math.sin(t * 0.6) * (0.25 + smoothedMid * 0.25);
      heroTorus.rotation.y = t * (0.25 + 0.4 * smoothedBass);
      innerRing.rotation.y = -t * (0.45 + 0.5 * smoothedBass);
      innerRing.rotation.z = Math.sin(t * 0.5) * (0.18 + smoothedMid * 0.2);

      const heroPulse = 1.0 + 0.15 * smoothedBass + 0.2 * beatPulse;
      heroGroup.scale.set(heroPulse, heroPulse, heroPulse);

      heroParticles.rotation.y = t * 0.1;
      heroParticlesMat.opacity = 0.4 + 0.4 * smoothedMid + 0.2 * beatPulse;

      // about
      grid.rotation.x = Math.PI / 2 + Math.sin(t * 0.35) * 0.08;
      grid.material.opacity = 0.3 + 0.3 * smoothedMid + 0.2 * beatPulse;

      lasers.forEach(({ mesh, offset }, idx) => {
        const base = hasFreq
          ? smoothedMid
          : Math.sin(t * 3 + offset) * 0.5 + 0.5;
        const pulse = 0.4 + 1.0 * base + 0.6 * beatPulse;
        mesh.scale.y = pulse;
        mesh.position.y = -2.5 + pulse * 1.5;
        mesh.rotation.y = Math.sin(t * 0.7 + idx) * 0.4;
        mesh.rotation.z = Math.sin(t * 0.9 + offset) * 0.3;
        mesh.material.emissiveIntensity = 1.1 + base * 1.2 + beatPulse * 0.7;
      });

      // membership blob (fulcro)
      uniforms.uTime.value = t + smoothedMid * 2.0;

      const blobScale = 1.0 + smoothedBass * 0.35 + beatPulse * 0.45;
      blob.scale.set(blobScale, blobScale, blobScale);

      blob.rotation.y = t * (0.25 + smoothedBass * 0.6) + beatPulse * 0.5;
      blob.rotation.x = Math.sin(t * 0.35) * (0.15 + smoothedMid * 0.25);

      memParticles.rotation.y = t * 0.07;
      memParticles.rotation.x = Math.sin(t * 0.2) * 0.1;
      memParticlesMat.size = 0.04 + 0.03 * smoothedMid + 0.02 * beatPulse;

      // contact equalizer -> usa realmente lo spettro
      if (hasFreq && freqData) {
        const len = freqData.length;
        bars.forEach((bar, idx) => {
          const { mesh, band } = bar;
          const bin = Math.floor((idx / bars.length) * (len * 0.6)); // prime bande
          const v = freqData[bin] / 255;
          const targetHeight = 0.25 + v * 3.2 + beatPulse * (1.4 - band * 0.03);

          bar.height = bar.height * 0.7 + targetHeight * 0.3;
          mesh.scale.y = bar.height;
          mesh.position.y = -3.9 + bar.height / 2;
          mesh.rotation.y = (v - 0.5) * 0.6;

          mesh.material.emissiveIntensity = 0.9 + v * 1.6 + beatPulse * 0.8;
        });
      } else {
        // fallback se non c'è audio
        const bpm = 118;
        const beat = (t * bpm * Math.PI) / 60;
        bars.forEach((bar, idx) => {
          const { mesh, band } = bar;
          const v = Math.sin(beat * 0.5 + idx * 0.2) * 0.5 + 0.5;
          const targetHeight = 0.3 + v * 2.8 + beatPulse * (1.2 - band * 0.03);

          bar.height = bar.height * 0.7 + targetHeight * 0.3;
          mesh.scale.y = bar.height;
          mesh.position.y = -3.9 + bar.height / 2;
          mesh.rotation.y = Math.sin(t * 0.4 + idx) * 0.25;
          mesh.material.emissiveIntensity = 1.0 + v * 1.4;
        });
      }

      // luci globali che seguono bassi / beat
      const global = 0.7 + 1.1 * smoothedBass + 0.9 * beatPulse;
      pinkLight.intensity = 1.2 + global;
      cyanLight.intensity = 1.2 + global * (0.7 + smoothedMid * 0.3);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      unsub();
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();

      heroTorusGeom.dispose();
      heroTorusMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      heroParticlesGeom.dispose();
      heroParticlesMat.dispose();

      laserGeom.dispose();
      lasers.forEach(({ mesh }) => {
        mesh.geometry?.dispose?.();
        mesh.material?.dispose?.();
      });

      grid.geometry?.dispose?.();
      grid.material?.dispose?.();

      blobGeom.dispose();
      blobMaterial.dispose();
      memParticlesGeom.dispose();
      memParticlesMat.dispose();

      planeGeom.dispose();
      planeMat.dispose();
      barGeom.dispose();
      bars.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });

      if (audioEl && playListener) {
        audioEl.removeEventListener("play", playListener);
      }
      // NON chiudo sharedAudioContext: è condiviso per tutta l'app
    };
  }, [smoothProgress]);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* leggera tinta per migliorare il contrasto del testo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />
    </div>
  );
}
