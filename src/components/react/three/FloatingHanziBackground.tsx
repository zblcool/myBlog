import { useEffect, useRef } from "react";
import * as THREE from "three";

type Actor = {
  group: THREE.Group;
  radius: number;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  bobPhase: number;
  bobSpeed: number;
};

type Mist = {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
};

const GLYPHS = ["汉", "字", "工", "坊", "文", "心", "月", "山", "木", "田", "雨", "火", "人", "明", "休", "忍"];
const PALETTE = ["#f2b45a", "#8fd8d0", "#d87e63", "#88aee6", "#f1dfb4"];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((entry) => disposeMaterial(entry));
    return;
  }

  const textureKeys = ["map", "alphaMap", "emissiveMap", "aoMap"];
  for (const key of textureKeys) {
    const texture = material[key as keyof THREE.Material] as THREE.Texture | null | undefined;
    texture?.dispose?.();
  }
  material.dispose();
}

function applySrgbSpace(target: THREE.WebGLRenderer | THREE.Texture) {
  const typedTarget = target as THREE.WebGLRenderer &
    THREE.Texture & {
      outputColorSpace?: unknown;
      outputEncoding?: unknown;
      colorSpace?: unknown;
      encoding?: unknown;
    };
  const threeCompat = THREE as typeof THREE & {
    SRGBColorSpace?: unknown;
    sRGBEncoding?: unknown;
  };

  if ("outputColorSpace" in typedTarget && threeCompat.SRGBColorSpace) {
    typedTarget.outputColorSpace = threeCompat.SRGBColorSpace;
    return;
  }
  if ("outputEncoding" in typedTarget && threeCompat.sRGBEncoding) {
    typedTarget.outputEncoding = threeCompat.sRGBEncoding;
  }

  if ("colorSpace" in typedTarget && threeCompat.SRGBColorSpace) {
    typedTarget.colorSpace = threeCompat.SRGBColorSpace;
    return;
  }
  if ("encoding" in typedTarget && threeCompat.sRGBEncoding) {
    typedTarget.encoding = threeCompat.sRGBEncoding;
  }
}

export default function FloatingHanziBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    const bounds = coarsePointer
      ? { x: 6.8, y: 4.2, z: 3.8 }
      : { x: 8.8, y: 5.1, z: 4.8 };
    const actorCount = prefersReducedMotion ? 10 : coarsePointer ? 14 : 18;
    const mistCount = prefersReducedMotion ? 4 : coarsePointer ? 5 : 7;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("Floating hanzi background disabled:", error);
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.15 : 1.5),
    );
    applySrgbSpace(renderer);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071319, 0.065);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0, 12);

    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const glyphTextureCache = new Map<string, THREE.CanvasTexture>();
    const glowTextureCache = new Map<string, THREE.CanvasTexture>();
    const shapes = [
      () => new THREE.TorusGeometry(0.55, 0.16, 10, 24),
      () => new THREE.OctahedronGeometry(0.72, 0),
      () => new THREE.IcosahedronGeometry(0.68, 0),
      () => new THREE.BoxGeometry(1.06, 1.06, 1.06),
      () => new THREE.TetrahedronGeometry(0.82, 0),
    ];

    const tempDelta = new THREE.Vector3();
    const actors: Actor[] = [];
    const mists: Mist[] = [];

    const createGlyphTexture = (glyph: string, color: string) => {
      const cacheKey = `${glyph}-${color}`;
      const cached = glyphTextureCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 256;
      textureCanvas.height = 256;
      const ctx = textureCanvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      ctx.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
      ctx.translate(textureCanvas.width * 0.5, textureCanvas.height * 0.5);

      const glow = ctx.createRadialGradient(
        0,
        0,
        20,
        0,
        0,
        textureCanvas.width * 0.42,
      );
      glow.addColorStop(0, "rgba(255,255,255,0.42)");
      glow.addColorStop(0.4, `${color}66`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, textureCanvas.width * 0.32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${textureCanvas.width * 0.42}px "Songti SC", "Noto Serif SC", "Source Han Serif SC", serif`;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillText(glyph, 0, 0);

      const texture = new THREE.CanvasTexture(textureCanvas);
      applySrgbSpace(texture);
      glyphTextureCache.set(cacheKey, texture);
      return texture;
    };

    const createGlowTexture = (color: string) => {
      const cached = glowTextureCache.get(color);
      if (cached) {
        return cached;
      }

      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 128;
      textureCanvas.height = 128;
      const ctx = textureCanvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      const gradient = ctx.createRadialGradient(64, 64, 6, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255,255,255,0.72)");
      gradient.addColorStop(0.25, `${color}66`);
      gradient.addColorStop(0.6, `${color}24`);
      gradient.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);

      const texture = new THREE.CanvasTexture(textureCanvas);
      applySrgbSpace(texture);
      glowTextureCache.set(color, texture);
      return texture;
    };

    const createActor = (index: number) => {
      const group = new THREE.Group();
      const color = PALETTE[index % PALETTE.length];
      const geometry = shapes[index % shapes.length]();

      const solid = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
        }),
      );
      solid.scale.setScalar(randomBetween(0.76, 0.94));
      group.add(solid);

      const shell = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.24,
          wireframe: Math.random() > 0.28,
          depthWrite: false,
        }),
      );
      shell.scale.setScalar(randomBetween(1, 1.28));
      group.add(shell);

      const glowTexture = createGlowTexture(color);
      if (glowTexture) {
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            opacity: randomBetween(0.16, 0.22),
            depthWrite: false,
          }),
        );
        const glowScale = randomBetween(2.6, 3.8);
        glow.scale.set(glowScale, glowScale, 1);
        group.add(glow);
      }

      const glyphTexture = createGlyphTexture(GLYPHS[index % GLYPHS.length], color);
      if (glyphTexture) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glyphTexture,
            transparent: true,
            opacity: randomBetween(0.8, 0.94),
            depthWrite: false,
          }),
        );
        const spriteScale = randomBetween(1.4, 1.9);
        sprite.scale.set(spriteScale, spriteScale, 1);
        sprite.position.z = randomBetween(0.16, 0.48);
        group.add(sprite);
      }

      group.position.set(
        randomBetween(-bounds.x, bounds.x),
        randomBetween(-bounds.y, bounds.y),
        randomBetween(-bounds.z, bounds.z),
      );
      group.rotation.set(
        randomBetween(0, Math.PI),
        randomBetween(0, Math.PI),
        randomBetween(0, Math.PI),
      );

      scene.add(group);
      actors.push({
        group,
        radius: randomBetween(1.15, 1.72),
        velocity: new THREE.Vector3(
          randomBetween(-0.28, 0.28),
          randomBetween(-0.18, 0.18),
          randomBetween(-0.14, 0.14),
        ),
        spin: new THREE.Vector3(
          randomBetween(-0.28, 0.28),
          randomBetween(-0.22, 0.22),
          randomBetween(-0.18, 0.18),
        ),
        bobPhase: randomBetween(0, Math.PI * 2),
        bobSpeed: randomBetween(0.18, 0.32),
      });
    };

    const createMist = (index: number) => {
      const color = PALETTE[(index + 1) % PALETTE.length];
      const glowTexture = createGlowTexture(color);
      if (!glowTexture) {
        return;
      }

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          opacity: randomBetween(0.06, 0.12),
          depthWrite: false,
        }),
      );

      const scale = randomBetween(5.5, 9.2);
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        randomBetween(-bounds.x * 1.15, bounds.x * 1.15),
        randomBetween(-bounds.y * 1.05, bounds.y * 1.05),
        randomBetween(-bounds.z * 1.4, bounds.z * 1.4),
      );

      scene.add(sprite);
      mists.push({
        sprite,
        velocity: new THREE.Vector3(
          randomBetween(-0.06, 0.06),
          randomBetween(-0.04, 0.04),
          randomBetween(-0.03, 0.03),
        ),
      });
    };

    const applyBounds = (
      item: { group: THREE.Group; velocity: THREE.Vector3 } | { sprite: THREE.Sprite; velocity: THREE.Vector3 },
      limitMultiplier = 1,
    ) => {
      const limitX = bounds.x * limitMultiplier;
      const limitY = bounds.y * limitMultiplier;
      const limitZ = bounds.z * limitMultiplier;
      const position = "group" in item ? item.group.position : item.sprite.position;

      if (position.x > limitX || position.x < -limitX) {
        item.velocity.x *= -1;
        position.x = THREE.MathUtils.clamp(position.x, -limitX, limitX);
      }
      if (position.y > limitY || position.y < -limitY) {
        item.velocity.y *= -1;
        position.y = THREE.MathUtils.clamp(position.y, -limitY, limitY);
      }
      if (position.z > limitZ || position.z < -limitZ) {
        item.velocity.z *= -1;
        position.z = THREE.MathUtils.clamp(position.z, -limitZ, limitZ);
      }
    };

    const resolveActorCollisions = () => {
      for (let i = 0; i < actors.length; i += 1) {
        for (let j = i + 1; j < actors.length; j += 1) {
          const left = actors[i];
          const right = actors[j];
          tempDelta.subVectors(right.group.position, left.group.position);
          const distance = tempDelta.length();
          const minDistance = left.radius + right.radius;

          if (distance === 0 || distance >= minDistance) {
            continue;
          }

          const normal = tempDelta.normalize();
          const overlap = minDistance - distance;
          left.group.position.addScaledVector(normal, -overlap * 0.5);
          right.group.position.addScaledVector(normal, overlap * 0.5);
          left.velocity.addScaledVector(normal, -overlap * 0.1);
          right.velocity.addScaledVector(normal, overlap * 0.1);
        }
      }
    };

    const resize = () => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    for (let index = 0; index < actorCount; index += 1) {
      createActor(index);
    }

    for (let index = 0; index < mistCount; index += 1) {
      createMist(index);
    }

    resize();

    let frameId = 0;
    let previousTime = performance.now();
    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - previousTime) / 1000, 1 / 30);
      previousTime = timestamp;
      const elapsed = timestamp / 1000;

      pointerCurrent.lerp(pointerTarget, 0.035);
      camera.position.x = pointerCurrent.x * 0.8 + Math.sin(elapsed * 0.08) * 0.34;
      camera.position.y = pointerCurrent.y * 0.56 + Math.cos(elapsed * 0.06) * 0.24;
      camera.lookAt(pointerCurrent.x * 0.24, pointerCurrent.y * 0.18, 0);

      resolveActorCollisions();

      actors.forEach((actor, index) => {
        actor.group.position.addScaledVector(actor.velocity, dt);
        actor.group.rotation.x += actor.spin.x * dt;
        actor.group.rotation.y += actor.spin.y * dt;
        actor.group.rotation.z += actor.spin.z * dt;
        actor.group.position.y +=
          Math.sin(elapsed * actor.bobSpeed + actor.bobPhase) * 0.0032;
        actor.velocity.multiplyScalar(0.9992);
        actor.velocity.x += Math.sin(elapsed * 0.11 + index) * 0.0006;
        actor.velocity.y += Math.cos(elapsed * 0.13 + index * 0.5) * 0.0004;
        actor.velocity.z += Math.sin(elapsed * 0.09 + index * 0.32) * 0.00025;
        applyBounds(actor);
      });

      mists.forEach((mist, index) => {
        mist.sprite.position.addScaledVector(mist.velocity, dt);
        (mist.sprite.material as THREE.SpriteMaterial).rotation +=
          dt * (index % 2 === 0 ? 0.02 : -0.02);
        applyBounds(mist, 1.2);
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (0.5 - event.clientY / window.innerHeight) * 2;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = 0;
        }
        return;
      }

      previousTime = performance.now();
      if (!prefersReducedMotion && !frameId) {
        frameId = window.requestAnimationFrame(render);
      } else if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!prefersReducedMotion) {
      frameId = window.requestAnimationFrame(render);
    } else {
      renderer.render(scene, camera);
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      actors.forEach((actor) => {
        actor.group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            disposeMaterial(child.material);
          }
          if (child instanceof THREE.Sprite) {
            disposeMaterial(child.material);
          }
        });
        scene.remove(actor.group);
      });

      mists.forEach((mist) => {
        disposeMaterial(mist.sprite.material);
        scene.remove(mist.sprite);
      });

      glyphTextureCache.forEach((texture) => texture.dispose());
      glowTextureCache.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="site-background__canvas" aria-hidden="true" />;
}
