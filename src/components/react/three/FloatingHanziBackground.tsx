import { useEffect, useRef } from "react";
import * as THREE from "three";

type ShapeKind = "ring" | "poly" | "shard" | "rod" | "slab";

type FloatingShape = {
  kind: ShapeKind;
  stretch: number;
  color: string;
  softness: number;
  variant: number;
};

type Actor = {
  group: THREE.Group;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  bobPhase: number;
  bobSpeed: number;
  driftBias: number;
  depthBias: number;
  shape: ShapeKind;
};

type Mist = {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
};

const PALETTE = ["#f2a93b", "#30c6be", "#e4674d", "#5d84ff", "#7ccf6b", "#f0d66b"];
const FALLBACK_LENGTHS = [2, 4, 5, 7, 8, 10, 12, 14];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clampBetween(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function shuffleArray<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
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

function buildFloatingShapes(tags: string[], actorCount: number) {
  const tagLengths = shuffleArray(
    [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].map((tag) => tag.length),
  );
  const lengths = tagLengths.length > 0 ? tagLengths : FALLBACK_LENGTHS;
  const shapes: FloatingShape[] = [];

  for (let index = 0; index < actorCount; index += 1) {
    const length = lengths[index % lengths.length];
    const isLong = length >= 8;
    const kindPool: ShapeKind[] = isLong
      ? ["rod", "slab", "ring", "poly", "shard"]
      : ["poly", "shard", "ring", "slab", "rod"];
    const kind = kindPool[(index + length) % kindPool.length];

    shapes.push({
      kind,
      stretch: isLong ? clampBetween(1.12 + length * 0.08, 1.4, 2.8) : randomBetween(0.92, 1.32),
      color: PALETTE[(index + length) % PALETTE.length],
      softness: randomBetween(0.88, 1.16),
      variant: (index + length) % 3,
    });
  }

  return shuffleArray(shapes);
}

function createGeometry(shape: FloatingShape) {
  switch (shape.kind) {
    case "ring":
      return new THREE.TorusGeometry(
        0.44 * shape.softness,
        clampBetween(0.1 + shape.stretch * 0.03, 0.1, 0.18),
        12,
        28,
      );
    case "rod":
      return new THREE.CylinderGeometry(
        0.14 * shape.softness,
        0.14 * shape.softness,
        clampBetween(1.5 * shape.stretch, 1.5, 3.6),
        14,
        1,
        true,
      );
    case "slab":
      return new THREE.BoxGeometry(
        clampBetween(1.1 * shape.stretch, 1.4, 3.8),
        0.26 * shape.softness,
        0.38 * shape.softness,
      );
    case "shard":
      return shape.variant % 2 === 0
        ? new THREE.OctahedronGeometry(0.68 * shape.softness, 0)
        : new THREE.ConeGeometry(0.34 * shape.softness, 1.2 * shape.softness, 5, 1, true);
    case "poly":
    default:
      return shape.variant % 2 === 0
        ? new THREE.IcosahedronGeometry(0.62 * shape.softness, 0)
        : new THREE.DodecahedronGeometry(0.6 * shape.softness, 0);
  }
}

function isElongated(kind: ShapeKind) {
  return kind === "rod" || kind === "slab";
}

type FloatingHanziBackgroundProps = {
  tags?: string[];
};

export default function FloatingHanziBackground({
  tags = [],
}: FloatingHanziBackgroundProps) {
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
      ? { x: 6.4, y: 4, z: 3.6 }
      : { x: 8.4, y: 4.8, z: 4.5 };
    const actorCount = prefersReducedMotion ? 7 : coarsePointer ? 9 : 12;
    const mistCount = prefersReducedMotion ? 3 : coarsePointer ? 3 : 4;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.warn("Floating geometry background disabled:", error);
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, coarsePointer ? 1 : 1.2),
    );
    applySrgbSpace(renderer);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071319, 0.052);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0, 12);

    const shapes = buildFloatingShapes(tags, actorCount);
    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const glowTextureCache = new Map<string, THREE.CanvasTexture>();
    const actors: Actor[] = [];
    const mists: Mist[] = [];

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
      gradient.addColorStop(0, "rgba(255,255,255,0.68)");
      gradient.addColorStop(0.24, `${color}74`);
      gradient.addColorStop(0.58, `${color}26`);
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
      const shape = shapes[index % shapes.length];
      const geometry = createGeometry(shape);
      const elongated = isElongated(shape.kind);

      const solid = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: shape.color,
          transparent: true,
          opacity: elongated ? 0.1 : 0.12,
          depthWrite: false,
        }),
      );
      solid.scale.set(
        elongated ? randomBetween(0.96, 1.08) : randomBetween(0.84, 0.98),
        elongated ? randomBetween(0.92, 1.04) : randomBetween(0.84, 0.98),
        randomBetween(0.92, 1.08),
      );
      group.add(solid);

      const shell = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: shape.color,
          transparent: true,
          opacity: elongated ? 0.24 : 0.3,
          wireframe: shape.kind !== "slab" && Math.random() > 0.42,
          depthWrite: false,
        }),
      );
      shell.scale.set(
        elongated ? randomBetween(1.04, 1.12) : randomBetween(1.02, 1.18),
        elongated ? randomBetween(1.08, 1.16) : randomBetween(1.02, 1.18),
        randomBetween(1.02, 1.14),
      );
      group.add(shell);

      if (!elongated && shape.kind !== "ring") {
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(randomBetween(0.1, 0.16), 12, 12),
          new THREE.MeshBasicMaterial({
            color: "#f9f1df",
            transparent: true,
            opacity: randomBetween(0.28, 0.42),
            depthWrite: false,
          }),
        );
        group.add(core);
      }

      const glowTexture = createGlowTexture(shape.color);
      if (glowTexture) {
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            opacity: elongated ? randomBetween(0.12, 0.18) : randomBetween(0.16, 0.22),
            depthWrite: false,
          }),
        );
        const glowScale = elongated ? randomBetween(2.4, 3.2) : randomBetween(2.2, 3);
        glow.scale.set(glowScale, glowScale, 1);
        group.add(glow);
      }

      group.position.set(
        randomBetween(-bounds.x, bounds.x),
        randomBetween(-bounds.y, bounds.y),
        randomBetween(-bounds.z, bounds.z),
      );

      if (elongated) {
        group.rotation.set(
          randomBetween(-0.42, 0.42),
          randomBetween(-0.72, 0.72),
          randomBetween(-0.54, 0.54),
        );
      } else {
        group.rotation.set(
          randomBetween(0, Math.PI),
          randomBetween(0, Math.PI),
          randomBetween(0, Math.PI),
        );
      }

      scene.add(group);
      actors.push({
        group,
        velocity: new THREE.Vector3(
          randomBetween(-0.22, 0.22),
          randomBetween(-0.14, 0.14),
          randomBetween(-0.1, 0.1),
        ),
        spin: new THREE.Vector3(
          elongated ? randomBetween(-0.12, 0.12) : randomBetween(-0.22, 0.22),
          elongated ? randomBetween(-0.14, 0.14) : randomBetween(-0.2, 0.2),
          elongated ? randomBetween(-0.1, 0.1) : randomBetween(-0.16, 0.16),
        ),
        bobPhase: randomBetween(0, Math.PI * 2),
        bobSpeed: randomBetween(0.16, 0.28),
        driftBias: randomBetween(-1, 1),
        depthBias: randomBetween(-1, 1),
        shape: shape.kind,
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
          opacity: randomBetween(0.06, 0.1),
          depthWrite: false,
        }),
      );

      const scale = randomBetween(5.2, 8.4);
      sprite.scale.set(scale, scale, 1);
      sprite.position.set(
        randomBetween(-bounds.x * 1.15, bounds.x * 1.15),
        randomBetween(-bounds.y * 1.05, bounds.y * 1.05),
        randomBetween(-bounds.z * 1.35, bounds.z * 1.35),
      );

      scene.add(sprite);
      mists.push({
        sprite,
        velocity: new THREE.Vector3(
          randomBetween(-0.05, 0.05),
          randomBetween(-0.03, 0.03),
          randomBetween(-0.025, 0.025),
        ),
      });
    };

    const applyBounds = (
      item:
        | { group: THREE.Group; velocity: THREE.Vector3 }
        | { sprite: THREE.Sprite; velocity: THREE.Vector3 },
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
    let jarScrollVelocity = 0;
    let pendingScrollImpulseX = 0;
    let pendingScrollImpulseY = 0;
    let previousTime = performance.now();
    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - previousTime) / 1000, 1 / 30);
      previousTime = timestamp;
      const elapsed = timestamp / 1000;
      jarScrollVelocity = THREE.MathUtils.lerp(jarScrollVelocity, 0, 0.06);
      pendingScrollImpulseX *= 0.82;
      pendingScrollImpulseY *= 0.82;

      pointerCurrent.lerp(pointerTarget, 0.035);
      camera.position.x = pointerCurrent.x * 0.8 + Math.sin(elapsed * 0.08) * 0.34;
      camera.position.y =
        pointerCurrent.y * 0.56 + Math.cos(elapsed * 0.06) * 0.24 + jarScrollVelocity * 0.74;
      camera.lookAt(pointerCurrent.x * 0.24, pointerCurrent.y * 0.18 + jarScrollVelocity * 0.12, 0);

      if (Math.abs(pendingScrollImpulseX) > 0.0001 || Math.abs(pendingScrollImpulseY) > 0.0001) {
        jarScrollVelocity = clampBetween(
          jarScrollVelocity + pendingScrollImpulseY * 0.52,
          -0.26,
          0.26,
        );

        actors.forEach((actor, index) => {
          const elongated = isElongated(actor.shape);
          const lateralSwing = actor.driftBias * Math.abs(pendingScrollImpulseY) * 0.16;
          actor.velocity.y += pendingScrollImpulseY * (elongated ? 0.64 : 0.5);
          actor.velocity.x += pendingScrollImpulseX * 0.44 + lateralSwing;
          actor.velocity.z += actor.depthBias * Math.abs(pendingScrollImpulseY) * 0.045;
          actor.spin.z += pendingScrollImpulseY * (elongated ? 0.09 : 0.06);
          actor.spin.x += actor.driftBias * pendingScrollImpulseY * 0.06;

          if (index % 2 === 0) {
            actor.velocity.x += pendingScrollImpulseY * 0.025;
          } else {
            actor.velocity.x -= pendingScrollImpulseY * 0.025;
          }
        });

        mists.forEach((mist, index) => {
          const sign = index % 2 === 0 ? 1 : -1;
          mist.velocity.y += pendingScrollImpulseY * 0.14;
          mist.velocity.x += pendingScrollImpulseX * 0.1 + sign * Math.abs(pendingScrollImpulseY) * 0.012;
        });
      }

      actors.forEach((actor, index) => {
        const elongated = isElongated(actor.shape);
        actor.group.position.addScaledVector(actor.velocity, dt);
        actor.group.rotation.x += actor.spin.x * dt;
        actor.group.rotation.y += actor.spin.y * dt;
        actor.group.rotation.z += actor.spin.z * dt;
        actor.group.position.y += Math.sin(elapsed * actor.bobSpeed + actor.bobPhase) * 0.0028;
        actor.velocity.multiplyScalar(elongated ? 0.9985 : 0.9991);
        actor.velocity.y += jarScrollVelocity * (elongated ? 0.0017 : 0.0012);
        actor.velocity.x += actor.driftBias * Math.abs(jarScrollVelocity) * 0.001;
        actor.velocity.z += actor.depthBias * Math.abs(jarScrollVelocity) * 0.00046;
        actor.velocity.x += Math.sin(elapsed * 0.11 + index) * 0.0005;
        actor.velocity.y += Math.cos(elapsed * 0.13 + index * 0.5) * 0.00036;
        actor.velocity.z += Math.sin(elapsed * 0.09 + index * 0.32) * 0.00022;
        applyBounds(actor);
      });

      mists.forEach((mist, index) => {
        mist.sprite.position.addScaledVector(mist.velocity, dt);
        (mist.sprite.material as THREE.SpriteMaterial).rotation +=
          dt * (index % 2 === 0 ? 0.018 : -0.018);
        mist.velocity.y += jarScrollVelocity * 0.0007;
        mist.velocity.x += Math.sin(elapsed * 0.08 + index) * 0.00006;
        mist.velocity.multiplyScalar(0.9993);
        applyBounds(mist, 1.18);
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (0.5 - event.clientY / window.innerHeight) * 2;
    };

    let lastScrollX = window.scrollX;
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const nextScrollX = window.scrollX;
      const nextScrollY = window.scrollY;
      const deltaX = nextScrollX - lastScrollX;
      const deltaY = nextScrollY - lastScrollY;
      lastScrollX = nextScrollX;
      lastScrollY = nextScrollY;

      const impulseY = clampBetween(-deltaY * 0.0018, -0.22, 0.22);
      const impulseX = clampBetween(-deltaX * 0.0014, -0.12, 0.12);
      if (impulseX === 0 && impulseY === 0) {
        return;
      }

      pendingScrollImpulseX = clampBetween(pendingScrollImpulseX + impulseX, -0.14, 0.14);
      pendingScrollImpulseY = clampBetween(pendingScrollImpulseY + impulseY, -0.18, 0.18);
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
    window.addEventListener("scroll", handleScroll, { passive: true });
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
      window.removeEventListener("scroll", handleScroll);
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

      glowTextureCache.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [tags]);

  return <canvas ref={canvasRef} className="site-background__canvas" aria-hidden="true" />;
}
