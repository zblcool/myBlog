import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.45, 1),
      new THREE.MeshBasicMaterial({
        color: 0xb24a2f,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      }),
    );

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xf1d3a2,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      }),
    );

    const pointsGeometry = new THREE.BufferGeometry();
    const pointCount = 180;
    const positions = new Float32Array(pointCount * 3);

    for (let index = 0; index < pointCount; index += 1) {
      const stride = index * 3;
      positions[stride] = (Math.random() - 0.5) * 8;
      positions[stride + 1] = (Math.random() - 0.5) * 8;
      positions[stride + 2] = (Math.random() - 0.5) * 8;
    }

    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    const points = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        color: 0xf7f0e2,
        size: 0.06,
        transparent: true,
        opacity: 0.8,
      }),
    );

    const group = new THREE.Group();
    group.add(shell);
    group.add(core);
    scene.add(group);
    scene.add(points);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frameId = 0;
    const tick = () => {
      frameId = window.requestAnimationFrame(tick);
      group.rotation.y += 0.0035;
      group.rotation.x = Math.sin(Date.now() * 0.00035) * 0.18;
      points.rotation.y -= 0.0009;
      points.rotation.x += 0.0007;
      renderer.render(scene, camera);
    };

    tick();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      pointsGeometry.dispose();
      shell.geometry.dispose();
      core.geometry.dispose();
      (shell.material as THREE.Material).dispose();
      (core.material as THREE.Material).dispose();
      (points.material as THREE.Material).dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="three-stage">
      <div className="three-stage__canvas" ref={mountRef} />
      <div className="three-stage__caption">
        <strong>Three.js-ready lane</strong>
        <span>
          This interactive island already lives outside the content layer, so future
          framework migration stays more manageable.
        </span>
      </div>
    </div>
  );
}
