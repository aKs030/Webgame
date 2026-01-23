import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import PhysicsSandbox from "./PhysicsSandbox";
import CameraPlayground from "./CameraPlayground";
import "./index.css"; // Stelle sicher, dass Tailwind oder dein CSS eingebunden ist

export default function App() {
  const [view, setView] = useState("home"); // 'home' | 'physics-sandbox' | 'camera-playground'

  if (view === "physics-sandbox") {
    return <PhysicsSandbox onBack={() => setView("home")} />;
  }

  if (view === "camera-playground") {
    return <CameraPlayground onBack={() => setView("home")} />;
  }

  return (
    <div className="min-h-screen h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      <Section id={1} bgColor="from-indigo-900 via-indigo-700 to-indigo-600" objectType="torus" title="Section 1 - Torus" />
      <Section id={2} bgColor="from-emerald-900 via-emerald-700 to-emerald-600" objectType="sphere" title="Section 2 - Sphere" />
      <Section id={3} bgColor="from-rose-900 via-rose-700 to-rose-600" objectType="box" title="Section 3 - Box" />
      <Section id={4} bgColor="from-purple-900 via-purple-700 to-purple-600" objectType="apps" title="Mini Apps" setView={setView} />

      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        <Indicator index={1} />
        <Indicator index={2} />
        <Indicator index={3} />
        <Indicator index={4} />
      </div>
    </div>
  );
}

function Section({ id, bgColor, objectType, title, setView }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    let mesh;
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6, roughness: 0.2 });

    if (objectType === "torus") {
      mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.16, 160, 32), mat);
    } else if (objectType === "sphere") {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 64), mat);
    } else if (objectType === "apps") {
      mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), mat);
    } else {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), mat);
    }

    scene.add(mesh);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
      mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    mount.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let req;
    const animate = () => {
      const t = clock.getElapsedTime();
      mesh.rotation.x = 0.3 * Math.sin(t * 0.7) + 0.2;
      mesh.rotation.y += 0.01 + 0.005 * Math.sin(t * 0.9);

      camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onMove);
      renderer.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [objectType]);

  return (
    <section className={`h-screen w-full snap-start flex items-center justify-center bg-gradient-to-b ${bgColor}`}>
      <div className="container mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 text-center md:text-left text-white z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4">{title}</h2>
          {objectType === "apps" ? (
            <div className="flex flex-col gap-4">
               <p className="opacity-90 max-w-xl mb-4">
                Entdecke unsere Sammlung von interaktiven Mini-Apps und Experimenten.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button onClick={() => setView("physics-sandbox")} className="px-5 py-3 bg-white text-indigo-900 font-bold rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition transform">
                  Physics Sandbox (Neu!)
                </button>
                <button onClick={() => setView("camera-playground")} className="px-5 py-3 bg-white text-indigo-900 font-bold rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition transform">
                  Camera Playground (Neu!)
                </button>
                <a href="/apps/todo-liste/index.html" className="px-5 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:scale-105 transition transform">
                  To-Do Liste
                </a>
                <a href="/apps/color-changer/index.html" className="px-5 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:scale-105 transition transform">
                  Color Changer
                </a>
                <a href="/apps/zahlen-raten/index.html" className="px-5 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:scale-105 transition transform">
                  Zahlen Raten
                </a>
                 <a href="/apps/schere-stein-papier/index.html" className="px-5 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:scale-105 transition transform">
                  Schere Stein Papier
                </a>
              </div>
            </div>
          ) : (
            <p className="opacity-90 max-w-xl">
              Interaktive 3D-Szene mit Three.js — scroll nach unten für die nächsten Abschnitte. Mausbewegung erzeugt sanfte Parallax-Effekte.
            </p>
          )}
        </div>

        <div className="w-full md:w-1/2 h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-2xl bg-black/20 backdrop-blur-sm">
          <div ref={mountRef} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}

function Indicator({ index }) {
  const go = () => {
    const el = document.querySelectorAll("section")[index - 1];
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <button onClick={go} aria-label={`Gehe zu Abschnitt ${index}`} className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/60 hover:bg-white/90 shadow-lg" />
  );
}

/*
Anleitung:
1. Erstelle ein neues React-Projekt (z. B. mit Vite oder CRA).
2. Installiere three: `npm install three`.
3. Optional: Installiere Tailwind und aktiviere Scroll-Snap im CSS.
4. Ersetze App.jsx durch diesen Code.
5. Starte mit `npm run dev` oder `npm start`.
Fertig — du hast drei 3D-animierte Scroll-Snap-Sektionen!
*/