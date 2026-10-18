/**
 * Procedural textures for the booth: drawn on a canvas once, so the stage ships no image
 * files beyond the screen renders it borrows from /studio/shots.
 */
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import { markColors, markGradients, markPaths, markViewBox, type MarkVariant } from "@/studio/data/brandMark";

export function canvasTexture(
  name: string,
  width: number,
  height: number,
  scene: Scene,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const texture = new DynamicTexture(name, { width, height }, scene, true);
  texture.hasAlpha = true;
  draw(texture.getContext() as unknown as CanvasRenderingContext2D);
  texture.update();
  return texture;
}

/** Soft radial falloff (white, alpha by stop): contact shadows, light spill. */
export function radialTexture(name: string, scene: Scene, stops: [number, number][]) {
  return canvasTexture(name, 256, 256, scene, (ctx) => {
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    for (const [at, alpha] of stops) g.addColorStop(at, `rgba(255,255,255,${alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  });
}

/** Vertical LED wash: from a floor cove (bright at the bottom) or a fascia strip (`fromTop`). */
export function washTexture(name: string, scene: Scene, fromTop = false) {
  return canvasTexture(name, 8, 256, scene, (ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 8, 256);
    const g = fromTop ? ctx.createLinearGradient(0, 0, 0, 256) : ctx.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.06, "rgba(255,255,255,0.4)");
    g.addColorStop(0.3, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 8, 256);
  });
}

/** Seeded, so the floor looks the same on every visit (and in the poster). */
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

/**
 * Hall floor: sealed concrete, one 6 m slab per tile with a saw-cut joint on its edges.
 * Near-white values, tinted by the material's albedo colour.
 */
export function concreteTexture(scene: Scene) {
  const rnd = random(7);
  const texture = canvasTexture("concrete", 512, 512, scene, (ctx) => {
    ctx.fillStyle = "#e6e6e6";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 512;
      const y = rnd() * 512;
      const r = 30 + rnd() * 120;
      const shade = rnd() < 0.5 ? "255,255,255" : "190,190,190";
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${shade},${0.05 + rnd() * 0.08})`);
      g.addColorStop(1, `rgba(${shade},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.fillStyle = "rgba(60,60,60,0.55)";
    ctx.fillRect(0, 0, 512, 2);
    ctx.fillRect(0, 0, 2, 512);
  });
  texture.hasAlpha = false;
  texture.wrapU = texture.wrapV = Texture.WRAP_ADDRESSMODE;
  texture.anisotropicFilteringLevel = 8;
  return texture;
}

/** Booth carpet: fine fibre noise. */
export function carpetTexture(scene: Scene) {
  const rnd = random(11);
  const texture = canvasTexture("carpet", 256, 256, scene, (ctx) => {
    const image = ctx.createImageData(256, 256);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = 205 + rnd() * 50;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
  });
  texture.hasAlpha = false;
  texture.wrapU = texture.wrapV = Texture.WRAP_ADDRESSMODE;
  texture.anisotropicFilteringLevel = 8;
  return texture;
}

/** The lockup (mark + "Ashmartisan"), centred, on a transparent canvas. */
export function drawLockup(ctx: CanvasRenderingContext2D, variant: MarkVariant, scaleText = 0.4) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const markH = height * 0.62;
  const scale = markH / markViewBox.height;
  const markW = markViewBox.width * scale;
  const ink = variant === "onDark" ? ["#ffffff", "#c9d0d6"] : ["#16202a", "#597592"];
  const px = Math.round(height * scaleText);
  const font = (weight: number) => `${weight} ${px}px Montserrat, system-ui, sans-serif`;

  ctx.font = font(600);
  const bold = ctx.measureText("Ash").width;
  ctx.font = font(400);
  const regular = ctx.measureText("martisan").width;
  const gap = markH * 0.38;
  const left = (width - (markW + gap + bold + regular)) / 2;
  const top = (height - markH) / 2;

  ctx.save();
  ctx.translate(left, top);
  ctx.scale(scale, scale);
  ctx.translate(-markViewBox.x, -markViewBox.y);
  ctx.lineJoin = "round";
  ctx.lineWidth = 6;
  for (const { part, d } of markPaths) {
    const path = new Path2D(d);
    const g = markGradients[part];
    const [c0, c1] = markColors[variant][part];
    const { x, y, width: w, height: h } = markViewBox;
    const gradient = ctx.createLinearGradient(x + g.x1 * w, y, x + g.x2 * w, y + g.y2 * h);
    gradient.addColorStop(0, c0);
    gradient.addColorStop(1, c1);
    ctx.fillStyle = gradient;
    ctx.strokeStyle = gradient;
    ctx.fill(path);
    ctx.stroke(path);
  }
  ctx.restore();

  const baseline = height / 2 + px * 0.36;
  ctx.textBaseline = "alphabetic";
  ctx.font = font(600);
  ctx.fillStyle = ink[0];
  ctx.fillText("Ash", left + markW + gap, baseline);
  ctx.font = font(400);
  ctx.fillStyle = ink[1];
  ctx.fillText("martisan", left + markW + gap + bold, baseline);
}

/** A lockup texture that can be repainted for dark or light surfaces. */
export function lockupTexture(name: string, width: number, height: number, scene: Scene) {
  const texture = new DynamicTexture(name, { width, height }, scene, true);
  texture.hasAlpha = true;
  let painted: MarkVariant | null = null;
  return {
    texture,
    paint(variant: MarkVariant) {
      if (painted === variant) return false;
      painted = variant;
      drawLockup(texture.getContext() as unknown as CanvasRenderingContext2D, variant);
      texture.update();
      return true;
    },
  };
}
