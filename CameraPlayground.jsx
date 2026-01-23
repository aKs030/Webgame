import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, Box, Circle, Loader, AlertCircle, RotateCw } from "lucide-react";

export default function CameraPlayground({ onBack }) {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shape, setShape] = useState("box"); // box, sphere, torus
  const [autoRotate, setAutoRotate] = useState(true);

  // Refs for accessing Three.js objects inside useEffect
  const meshRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(null);
  const videoRef = useRef(null);

  // Ref to track autoRotate state inside the animation loop
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    // 1. Setup Scene
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(2, 5, 5);
    scene.add(dirLight);

    // 2. Setup Video & Texture
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    // 3. Initial Mesh
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.1,
        metalness: 0.1
    });

    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 4. Start Camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        setLoading(false);
      })
      .catch((err) => {
        console.error("Camera access denied:", err);
        setError("Kamera-Zugriff verweigert oder nicht verfügbar.");
        setLoading(false);
      });

    // 5. Interaction (Mouse Move)
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (e) => {
        const rect = mount.getBoundingClientRect();
        // Normalize -1 to 1
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Simple easing target
        mouseX = x;
        mouseY = y;
    };
    mount.addEventListener("pointermove", onPointerMove);

    // 6. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (meshRef.current) {
         // Auto Rotation using Ref
         if (autoRotateRef.current) {
             meshRef.current.rotation.y += 0.005;
             meshRef.current.rotation.x += 0.002;
         }

         // Mouse Interaction Influence
         meshRef.current.rotation.y += mouseX * 0.02;
         meshRef.current.rotation.x -= mouseY * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Handler
    const handleResize = () => {
        if (!mount) return;
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("pointermove", onPointerMove);

      if (rendererRef.current) {
          rendererRef.current.dispose();
      }

      if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      if (mount) {
          mount.innerHTML = '';
      }
    };
  }, []); // Run once on mount

  // Effect to handle shape changes
  useEffect(() => {
     if (!meshRef.current) return;

     const oldMesh = meshRef.current;
     let newGeo;

     if (shape === "box") newGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
     else if (shape === "sphere") newGeo = new THREE.SphereGeometry(1.5, 64, 64);
     else if (shape === "torus") newGeo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);

     oldMesh.geometry.dispose();
     oldMesh.geometry = newGeo;
  }, [shape]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Camera Playground</h1>
        </div>

        {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl backdrop-blur-md max-w-sm">
                <AlertCircle />
                <p>{error}</p>
            </div>
        )}

        {loading && !error && (
             <div className="flex items-center gap-2 text-white/50 animate-pulse">
                <Loader className="animate-spin" />
                <p>Kamera wird gestartet...</p>
             </div>
        )}

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-wrap gap-3 max-w-sm md:max-w-none">
            <button
                onClick={() => setShape("box")}
                className={`p-3 rounded-lg transition ${shape === 'box' ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
                title="Würfel"
            >
                <Box className="text-white" />
            </button>
             <button
                onClick={() => setShape("sphere")}
                className={`p-3 rounded-lg transition ${shape === 'sphere' ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
                title="Kugel"
            >
                <Circle className="text-white" />
            </button>
            <button
                onClick={() => setShape("torus")}
                className={`p-3 rounded-lg transition ${shape === 'torus' ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
                title="Torus"
            >
                <span className="text-white font-bold text-lg px-1">O</span>
            </button>

            <div className="w-px bg-white/20 mx-1"></div>

            <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-3 rounded-lg transition ${autoRotate ? 'bg-emerald-600' : 'bg-white/10 hover:bg-white/20'}`}
                title="Auto-Rotation umschalten"
            >
                <RotateCw className={`text-white ${autoRotate ? 'animate-spin-slow' : ''}`} />
            </button>
        </div>
      </div>
    </div>
  );
}
