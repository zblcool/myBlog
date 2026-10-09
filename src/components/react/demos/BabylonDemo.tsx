import { useEffect, useRef, useState } from "react";
import { loadScript, useInView } from "./hooks";

const BABYLON_SRC = "https://cdn.jsdelivr.net/npm/babylonjs@7.31.0/babylon.js";

export default function BabylonDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { started, visibleRef } = useInView(rootRef);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!started || !canvas) {
      return undefined;
    }

    let disposed = false;
    let cleanup = () => {};

    loadScript(BABYLON_SRC)
      .then(() => {
        if (disposed) {
          return;
        }

        const B = (window as any).BABYLON;
        const engine = new B.Engine(canvas, true, { alpha: true });
        const scene = new B.Scene(engine);
        scene.clearColor = new B.Color4(0, 0, 0, 0);

        const camera = new B.ArcRotateCamera("cam", 1.1, 1.15, 7.5, B.Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 10;
        camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
        camera.attachControl(canvas, true);
        camera.useAutoRotationBehavior = true;

        const fill = new B.HemisphericLight("fill", new B.Vector3(0, 1, 0), scene);
        fill.intensity = 0.55;
        fill.groundColor = new B.Color3(0.25, 0.1, 0.06);
        const key = new B.PointLight("key", new B.Vector3(4, 4, -4), scene);
        key.diffuse = B.Color3.FromHexString("#ffb27a");
        key.intensity = 1.6;
        const rim = new B.PointLight("rim", new B.Vector3(-4, -2, 4), scene);
        rim.diffuse = B.Color3.FromHexString("#d4401a");
        rim.intensity = 1.2;

        const knot = B.MeshBuilder.CreateTorusKnot(
          "knot",
          { radius: 1.4, tube: 0.45, radialSegments: 160, tubularSegments: 36, p: 2, q: 3 },
          scene,
        );
        const material = new B.StandardMaterial("mat", scene);
        material.diffuseColor = B.Color3.FromHexString("#a8330f");
        material.specularColor = new B.Color3(1, 0.9, 0.8);
        material.specularPower = 80;
        material.emissiveFresnelParameters = new B.FresnelParameters({
          bias: 0.05,
          power: 2,
          leftColor: B.Color3.FromHexString("#d4401a"),
          rightColor: B.Color3.Black(),
        });
        knot.material = material;

        const glow = new B.GlowLayer("glow", scene, { blurKernelSize: 32 });
        glow.intensity = 0.4;

        scene.onBeforeRenderObservable.add(() => {
          knot.rotation.y += 0.004;
        });

        engine.runRenderLoop(() => {
          if (visibleRef.current) {
            scene.render();
          }
        });

        const observer = new ResizeObserver(() => engine.resize());
        observer.observe(canvas);
        setReady(true);

        cleanup = () => {
          observer.disconnect();
          engine.stopRenderLoop();
          scene.dispose();
          engine.dispose();
        };
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [started, visibleRef]);

  return (
    <div className="demo" ref={rootRef}>
      <canvas ref={canvasRef} style={{ touchAction: "pan-y" }} />
      {failed && <span className="demo__status">Demo unavailable offline</span>}
      {started && !ready && !failed && (
        <span className="demo__status demo__status--loading">Loading Babylon.js</span>
      )}
    </div>
  );
}
