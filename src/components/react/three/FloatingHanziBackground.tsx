import { useEffect, useRef } from "react";
import * as THREE from "three";

type FloatingToken = {
  kind: "glyph" | "tag";
  text: string;
};

type Actor = {
  group: THREE.Group;
  radius: number;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  bobPhase: number;
  bobSpeed: number;
  driftBias: number;
  depthBias: number;
  kind: FloatingToken["kind"];
};

type Mist = {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
};

type TextTextureResult = {
  texture: THREE.CanvasTexture;
  widthUnits: number;
  heightUnits: number;
};

const GLYPHS = ["汉", "字", "工", "坊", "文", "心", "月", "山", "木", "田", "雨", "火", "人", "明", "休", "忍"];
const PALETTE = ["#f2a93b", "#30c6be", "#e4674d", "#5d84ff", "#7ccf6b", "#f0d66b"];

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

function buildFloatingTokens(tags: string[], actorCount: number) {
  const glyphTokens = shuffleArray(GLYPHS).map<FloatingToken>((text) => ({
    kind: "glyph",
    text,
  }));
  const tagTokens = shuffleArray(
    [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))],
  ).map<FloatingToken>((text) => ({
    kind: "tag",
    text,
  }));

  const tokens: FloatingToken[] = [];
  let glyphIndex = 0;
  let tagIndex = 0;

  while (tokens.length < actorCount) {
    const shouldUseTag =
      tagTokens.length > 0 &&
      (tokens.length % 3 !== 0 || glyphIndex >= glyphTokens.length);

    if (shouldUseTag) {
      tokens.push(tagTokens[tagIndex % tagTokens.length]);
      tagIndex += 1;
      continue;
    }

    tokens.push(glyphTokens[glyphIndex % glyphTokens.length]);
    glyphIndex += 1;
  }

  return tokens;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const corner = Math.min(radius, width * 0.5, height * 0.5);

  ctx.beginPath();
  ctx.moveTo(x + corner, y);
  ctx.lineTo(x + width - corner, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
  ctx.lineTo(x + width, y + height - corner);
  ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
  ctx.lineTo(x + corner, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
  ctx.lineTo(x, y + corner);
  ctx.quadraticCurveTo(x, y, x + corner, y);
  ctx.closePath();
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
    scene.fog = new THREE.FogExp2(0x071319, 0.048);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
    camera.position.set(0, 0, 12);

    const tokens = buildFloatingTokens(tags, actorCount);
    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const textTextureCache = new Map<string, TextTextureResult>();
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

    const createTokenTexture = (token: FloatingToken, color: string) => {
      const cacheKey = `${token.kind}-${token.text}-${color}`;
      const cached = textTextureCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const textureCanvas = document.createElement("canvas");
      const ctx = textureCanvas.getContext("2d");
      if (!ctx) {
        return null;
      }

      if (token.kind === "glyph") {
        textureCanvas.width = 256;
        textureCanvas.height = 256;
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
        glow.addColorStop(0.4, `${color}88`);
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
        ctx.fillText(token.text, 0, 0);

        const texture = new THREE.CanvasTexture(textureCanvas);
        applySrgbSpace(texture);
        const result = {
          texture,
          widthUnits: 1.62,
          heightUnits: 1.62,
        };
        textTextureCache.set(cacheKey, result);
        return result;
      }

      const textLength = token.text.length;
      const fontSize = textLength > 18 ? 58 : textLength > 12 ? 70 : 82;
      const horizontalPadding = textLength > 16 ? 68 : 60;
      ctx.font = `700 ${fontSize}px "SF Pro Display", "PingFang SC", "Noto Sans CJK SC", sans-serif`;
      const measuredWidth = ctx.measureText(token.text).width;
      const width = clampBetween(
        Math.ceil(measuredWidth + horizontalPadding * 2),
        360,
        960,
      );
      const height = 220;
      textureCanvas.width = width;
      textureCanvas.height = height;

      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(6, 14, 20, 0.82)");
      gradient.addColorStop(1, "rgba(18, 31, 42, 0.58)");
      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, 12, 20, width - 24, height - 40, 46);
      ctx.fill();

      ctx.strokeStyle = `${color}cc`;
      ctx.lineWidth = 4;
      drawRoundedRect(ctx, 12, 20, width - 24, height - 40, 46);
      ctx.stroke();

      const glow = ctx.createLinearGradient(0, 0, width, height);
      glow.addColorStop(0, `${color}24`);
      glow.addColorStop(0.5, "rgba(255,255,255,0.04)");
      glow.addColorStop(1, `${color}12`);
      ctx.fillStyle = glow;
      drawRoundedRect(ctx, 24, 32, width - 48, height - 64, 34);
      ctx.fill();

      ctx.fillStyle = "rgba(248, 241, 231, 0.96)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${fontSize}px "SF Pro Display", "PingFang SC", "Noto Sans CJK SC", sans-serif`;
      ctx.shadowColor = `${color}bb`;
      ctx.shadowBlur = 16;
      ctx.fillText(token.text, width * 0.5, height * 0.54);

      const texture = new THREE.CanvasTexture(textureCanvas);
      applySrgbSpace(texture);
      const result = {
        texture,
        widthUnits: clampBetween(1.8 + textLength * 0.16, 2.6, 5.9),
        heightUnits: 0.92,
      };
      textTextureCache.set(cacheKey, result);
      return result;
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
      gradient.addColorStop(0.25, `${color}88`);
      gradient.addColorStop(0.6, `${color}30`);
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
      const token = tokens[index % tokens.length];
      const color = PALETTE[index % PALETTE.length];
      const geometry =
        token.kind === "tag"
          ? new THREE.BoxGeometry(
              clampBetween(1.8 + token.text.length * 0.18, 2.5, 5.8),
              0.82,
              0.52,
            )
          : shapes[index % shapes.length]();

      const solid = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.13,
          depthWrite: false,
        }),
      );
      if (token.kind === "tag") {
        solid.scale.set(
          randomBetween(0.92, 1.08),
          randomBetween(0.92, 1.04),
          randomBetween(0.92, 1.08),
        );
      } else {
        solid.scale.setScalar(randomBetween(0.76, 0.94));
      }
      group.add(solid);

      const shell = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.34,
          wireframe: Math.random() > 0.28,
          depthWrite: false,
        }),
      );
      if (token.kind === "tag") {
        shell.scale.set(
          randomBetween(1.04, 1.16),
          randomBetween(1.08, 1.16),
          randomBetween(1.02, 1.12),
        );
      } else {
        shell.scale.setScalar(randomBetween(1, 1.28));
      }
      group.add(shell);

      const glowTexture = createGlowTexture(color);
      if (glowTexture) {
        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            opacity: randomBetween(0.24, 0.34),
            depthWrite: false,
          }),
        );
        const glowScale = randomBetween(2.6, 3.8);
        glow.scale.set(glowScale, glowScale, 1);
        group.add(glow);
      }

      const textTexture = createTokenTexture(token, color);
      if (textTexture) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: textTexture.texture,
            transparent: true,
            opacity: token.kind === "tag" ? randomBetween(0.92, 0.98) : randomBetween(0.92, 1),
            depthWrite: false,
          }),
        );
        const scaleVariance = randomBetween(0.92, 1.08);
        sprite.scale.set(
          textTexture.widthUnits * scaleVariance,
          textTexture.heightUnits * scaleVariance,
          1,
        );
        sprite.position.z = token.kind === "tag" ? randomBetween(0.18, 0.28) : randomBetween(0.16, 0.48);
        group.add(sprite);
      }

      group.position.set(
        randomBetween(-bounds.x, bounds.x),
        randomBetween(-bounds.y, bounds.y),
        randomBetween(-bounds.z, bounds.z),
      );
      if (token.kind === "tag") {
        group.rotation.set(
          randomBetween(-0.18, 0.18),
          randomBetween(-0.42, 0.42),
          randomBetween(-0.14, 0.14),
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
        radius:
          token.kind === "tag"
            ? clampBetween(1.2 + token.text.length * 0.11, 1.8, 3.2)
            : randomBetween(1.15, 1.72),
        velocity: new THREE.Vector3(
          randomBetween(-0.24, 0.24),
          randomBetween(-0.16, 0.16),
          randomBetween(-0.12, 0.12),
        ),
        spin: new THREE.Vector3(
          token.kind === "tag" ? randomBetween(-0.14, 0.14) : randomBetween(-0.28, 0.28),
          token.kind === "tag" ? randomBetween(-0.18, 0.18) : randomBetween(-0.22, 0.22),
          token.kind === "tag" ? randomBetween(-0.12, 0.12) : randomBetween(-0.18, 0.18),
        ),
        bobPhase: randomBetween(0, Math.PI * 2),
        bobSpeed: randomBetween(0.18, 0.32),
        driftBias: randomBetween(-1, 1),
        depthBias: randomBetween(-1, 1),
        kind: token.kind,
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
          opacity: randomBetween(0.08, 0.14),
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
    let jarScrollVelocity = 0;
    let previousTime = performance.now();
    const render = (timestamp: number) => {
      const dt = Math.min((timestamp - previousTime) / 1000, 1 / 30);
      previousTime = timestamp;
      const elapsed = timestamp / 1000;
      jarScrollVelocity = THREE.MathUtils.lerp(jarScrollVelocity, 0, 0.06);

      pointerCurrent.lerp(pointerTarget, 0.035);
      camera.position.x = pointerCurrent.x * 0.8 + Math.sin(elapsed * 0.08) * 0.34;
      camera.position.y =
        pointerCurrent.y * 0.56 + Math.cos(elapsed * 0.06) * 0.24 + jarScrollVelocity * 0.8;
      camera.lookAt(pointerCurrent.x * 0.24, pointerCurrent.y * 0.18 + jarScrollVelocity * 0.14, 0);

      resolveActorCollisions();

      actors.forEach((actor, index) => {
        actor.group.position.addScaledVector(actor.velocity, dt);
        actor.group.rotation.x += actor.spin.x * dt;
        actor.group.rotation.y += actor.spin.y * dt;
        actor.group.rotation.z += actor.spin.z * dt;
        actor.group.position.y +=
          Math.sin(elapsed * actor.bobSpeed + actor.bobPhase) * 0.0032;
        actor.velocity.multiplyScalar(actor.kind === "tag" ? 0.9985 : 0.9992);
        actor.velocity.y += jarScrollVelocity * (actor.kind === "tag" ? 0.0018 : 0.0013);
        actor.velocity.x += actor.driftBias * Math.abs(jarScrollVelocity) * 0.0011;
        actor.velocity.z += actor.depthBias * Math.abs(jarScrollVelocity) * 0.0005;
        actor.velocity.x += Math.sin(elapsed * 0.11 + index) * 0.0006;
        actor.velocity.y += Math.cos(elapsed * 0.13 + index * 0.5) * 0.0004;
        actor.velocity.z += Math.sin(elapsed * 0.09 + index * 0.32) * 0.00025;
        applyBounds(actor);
      });

      mists.forEach((mist, index) => {
        mist.sprite.position.addScaledVector(mist.velocity, dt);
        (mist.sprite.material as THREE.SpriteMaterial).rotation +=
          dt * (index % 2 === 0 ? 0.02 : -0.02);
        mist.velocity.y += jarScrollVelocity * 0.0008;
        mist.velocity.x += Math.sin(elapsed * 0.08 + index) * 0.00008;
        mist.velocity.multiplyScalar(0.9993);
        applyBounds(mist, 1.2);
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

      const impulseY = clampBetween(-deltaY * 0.0018, -0.24, 0.24);
      const impulseX = clampBetween(-deltaX * 0.0015, -0.14, 0.14);
      if (impulseX === 0 && impulseY === 0) {
        return;
      }

      jarScrollVelocity = clampBetween(jarScrollVelocity + impulseY * 0.9, -0.34, 0.34);

      actors.forEach((actor, index) => {
        const lateralSwing = actor.driftBias * Math.abs(impulseY) * 0.2;
        actor.velocity.y += impulseY * (actor.kind === "tag" ? 1.3 : 1);
        actor.velocity.x += impulseX * 0.8 + lateralSwing;
        actor.velocity.z += actor.depthBias * Math.abs(impulseY) * 0.08;
        actor.spin.z += impulseY * (actor.kind === "tag" ? 0.35 : 0.22);
        actor.spin.x += actor.driftBias * impulseY * 0.2;

        if (index % 2 === 0) {
          actor.velocity.x += impulseY * 0.08;
        } else {
          actor.velocity.x -= impulseY * 0.08;
        }
      });

      mists.forEach((mist, index) => {
        const sign = index % 2 === 0 ? 1 : -1;
        mist.velocity.y += impulseY * 0.34;
        mist.velocity.x += impulseX * 0.2 + sign * Math.abs(impulseY) * 0.03;
      });
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

      textTextureCache.forEach((entry) => entry.texture.dispose());
      glowTextureCache.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [tags]);

  return <canvas ref={canvasRef} className="site-background__canvas" aria-hidden="true" />;
}
