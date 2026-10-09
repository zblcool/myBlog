import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useInView } from "./hooks";

const SHAPES = ["Knot", "Gem", "Ring", "Cube"] as const;
type Shape = (typeof SHAPES)[number];

const COLORS = ["#d4401a", "#f1d3a2", "#3a7bd5", "#2fa37a", "#f4f1ea"];

function createGeometry(shape: Shape): THREE.BufferGeometry {
  switch (shape) {
    case "Gem":
      return new THREE.IcosahedronGeometry(1.5, 0);
    case "Ring":
      return new THREE.TorusGeometry(1.25, 0.5, 48, 96);
    case "Cube":
      return new THREE.BoxGeometry(2, 2, 2);
    default:
      return new THREE.TorusKnotGeometry(1.1, 0.4, 160, 24);
  }
}

export default function ConfiguratorDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { started, visibleRef } = useInView(rootRef);

  const [shape, setShape] = useState<Shape>("Knot");
  const [color, setColor] = useState(COLORS[0]);
  const [roughness, setRoughness] = useState(0.35);
  const [wireframe, setWireframe] = useState(false);

  // Live values read by the render loop, so React state never restarts the scene.
  const live = useRef({ shape, color, roughness, wireframe });
  live.current = { shape, color, roughness, wireframe };
  const scene = useRef<{ swap: (shape: Shape) => void } | null>(null);

  useEffect(() => {
    scene.current?.swap(shape);
  }, [shape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!started || !canvas) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const stage = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 8.5);

    stage.add(new THREE.HemisphereLight(0xffffff, 0x331a10, 0.6));
    const key = new THREE.DirectionalLight(0xffe2c4, 1.6);
    key.position.set(3, 4, 5);
    stage.add(key);
    const rim = new THREE.PointLight(0x6aa0ff, 1.1, 20);
    rim.position.set(-4, -2, -3);
    stage.add(rim);

    const material = new THREE.MeshStandardMaterial({
      color: live.current.color,
      roughness: live.current.roughness,
      metalness: 0.35,
      flatShading: live.current.shape === "Gem",
    });
    const mesh = new THREE.Mesh(createGeometry(live.current.shape), material);
    mesh.position.y = 0.5;
    stage.add(mesh);

    scene.current = {
      swap(next) {
        mesh.geometry.dispose();
        mesh.geometry = createGeometry(next);
        material.flatShading = next === "Gem";
        material.needsUpdate = true;
        mesh.scale.setScalar(0.6);
      },
    };

    const drag = { active: false, x: 0, y: 0, vx: 0, vy: 0 };
    const onDown = (event: PointerEvent) => {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!drag.active) {
        return;
      }
      drag.vy = (event.clientX - drag.x) * 0.01;
      drag.vx = (event.clientY - drag.y) * 0.01;
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const onUp = () => {
      drag.active = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const target = new THREE.Color();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visibleRef.current) {
        return;
      }

      const { color: nextColor, roughness: nextRoughness, wireframe: nextWire } = live.current;
      target.set(nextColor);
      material.color.lerp(target, 0.12);
      material.roughness += (nextRoughness - material.roughness) * 0.2;
      material.wireframe = nextWire;
      mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);

      mesh.rotation.y += drag.active ? drag.vy : 0.006 + drag.vy;
      mesh.rotation.x += drag.vx;
      drag.vx *= 0.92;
      drag.vy *= 0.92;

      renderer.render(stage, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      scene.current = null;
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [started, visibleRef]);

  return (
    <div className="demo configurator" ref={rootRef}>
      <canvas ref={canvasRef} style={{ touchAction: "pan-y" }} />

      <div className="configurator__panel">
        <div className="configurator__row">
          <div className="configurator__seg" role="group" aria-label="Shape">
            {SHAPES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={shape === item}
                onClick={() => setShape(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="configurator__swatches" role="group" aria-label="Colour">
            {COLORS.map((item) => (
              <button
                key={item}
                type="button"
                aria-label={item}
                aria-pressed={color === item}
                style={{ background: item }}
                onClick={() => setColor(item)}
              />
            ))}
          </div>
        </div>
        <div className="configurator__row">
          <label className="configurator__slider">
            <span>Rough</span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(event) => setRoughness(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            className="configurator__toggle"
            aria-pressed={wireframe}
            onClick={() => setWireframe((value) => !value)}
          >
            Wire
          </button>
        </div>
      </div>
    </div>
  );
}
