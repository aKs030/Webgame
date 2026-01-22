import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { RefreshCw, Square, Circle, Triangle, Box, Eraser, Move, Plus } from 'lucide-react';

export default function App() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [gravity, setGravity] = useState(1);

  useEffect(() => {
    // Module aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    // Create engine
    const engine = Engine.create();
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: '#0f172a',
        wireframes: false,
        showAngleIndicator: false,
      }
    });

    // Add walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#334155' } };
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 30, window.innerWidth, 60, wallOptions);
    const leftWall = Bodies.rectangle(-30, window.innerHeight / 2, 60, window.innerHeight, wallOptions);
    const rightWall = Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 60, window.innerHeight, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    Composite.add(engine.world, mouseConstraint);

    // Keep the mouse in sync with rendering
    render.mouse = mouse;

    // Run the renderer
    Render.run(render);

    // Create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Resize handler
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;

      // Update ground position
      Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 30 });
      Matter.Body.setPosition(rightWall, { x: window.innerWidth + 30, y: window.innerHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        sceneRef.current.innerHTML = '';
      }
    };
  }, []);

  const spawnBox = () => {
    if (!engineRef.current) return;
    const box = Matter.Bodies.rectangle(
      Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
      50,
      50,
      50,
      {
        restitution: 0.9,
        render: { fillStyle: '#6366f1' } // Indigo 500
      }
    );
    Matter.Composite.add(engineRef.current.world, box);
  };

  const spawnCircle = () => {
    if (!engineRef.current) return;
    const circle = Matter.Bodies.circle(
      Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
      50,
      25,
      {
        restitution: 0.9,
        render: { fillStyle: '#10b981' } // Emerald 500
      }
    );
    Matter.Composite.add(engineRef.current.world, circle);
  };

  const spawnTriangle = () => {
    if (!engineRef.current) return;
    const poly = Matter.Bodies.polygon(
      Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
      50,
      3,
      30,
      {
        restitution: 0.9,
        render: { fillStyle: '#f43f5e' } // Rose 500
      }
    );
    Matter.Composite.add(engineRef.current.world, poly);
  };

  const spawnStack = () => {
    if (!engineRef.current) return;
    const stack = Matter.Composites.stack(
      window.innerWidth / 2 - 100,
      100,
      4,
      4,
      0,
      0,
      (x, y) => Matter.Bodies.rectangle(x, y, 40, 40, { render: { fillStyle: '#eab308' } }) // Yellow 500
    );
    Matter.Composite.add(engineRef.current.world, stack);
  }

  const clearWorld = () => {
    if (!engineRef.current) return;
    const bodies = Matter.Composite.allBodies(engineRef.current.world);
    // Keep static bodies (walls)
    const toRemove = bodies.filter(b => !b.isStatic);
    Matter.Composite.remove(engineRef.current.world, toRemove);
  };

  const toggleGravity = () => {
    if (!engineRef.current) return;
    const newG = gravity === 1 ? 0 : 1;
    setGravity(newG);
    engineRef.current.gravity.y = newG;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Physics Canvas Container */}
      <div ref={sceneRef} className="absolute inset-0" />

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-white drop-shadow-md">Physics Sandbox</h1>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-wrap gap-3 max-w-sm md:max-w-none">

          <button onClick={spawnBox} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition group" title="Spawn Box">
            <Square className="text-white group-hover:scale-110 transition-transform" />
          </button>

          <button onClick={spawnCircle} className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition group" title="Spawn Circle">
            <Circle className="text-white group-hover:scale-110 transition-transform" />
          </button>

          <button onClick={spawnTriangle} className="p-3 bg-rose-600 hover:bg-rose-500 rounded-lg transition group" title="Spawn Triangle">
            <Triangle className="text-white group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-px bg-white/20 mx-1"></div>

          <button onClick={spawnStack} className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition group" title="Spawn Stack">
            <div className="flex -space-x-1">
              <Square size={16} className="text-white" />
              <Square size={16} className="text-white" />
            </div>
          </button>

          <div className="w-px bg-white/20 mx-1"></div>

          <button onClick={toggleGravity} className={`p-3 rounded-lg transition group ${gravity === 0 ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`} title="Toggle Gravity">
            <Move className={`text-white group-hover:scale-110 transition-transform ${gravity === 0 ? 'animate-pulse' : ''}`} />
          </button>

          <button onClick={clearWorld} className="p-3 bg-red-600 hover:bg-red-500 rounded-lg transition group ml-auto md:ml-0" title="Clear All">
            <Eraser className="text-white group-hover:rotate-12 transition-transform" />
          </button>

        </div>
        <p className="text-white/50 text-sm pl-1">
          Klicke und ziehe Objekte. Benutze die Buttons, um Chaos zu erzeugen.
        </p>
      </div>
    </div>
  )
}
