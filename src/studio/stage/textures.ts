/**
 * Procedural textures for the booth: drawn on a canvas once, so the stage ships no image
 * files beyond the screen renders it borrows from /studio/shots.
 */
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
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

/**
 * A tiling grey texture built from pixel values, not a canvas: Safari's fingerprinting protection
 * adds coloured noise to canvas pixels, which shows up as confetti on a tiled floor.
 */
function rawTexture(name: string, width: number, height: number, scene: Scene, grey: (index: number) => number, alpha?: (index: number) => number) {
  const data = new Uint8Array(width * height * 4);
  for (let k = 0; k < width * height; k++) {
    const v = Math.round(grey(k));
    data[k * 4] = data[k * 4 + 1] = data[k * 4 + 2] = v;
    data[k * 4 + 3] = alpha ? Math.round(alpha(k)) : 255;
  }
  const texture = RawTexture.CreateRGBATexture(data, width, height, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
  texture.name = name;
  texture.hasAlpha = !!alpha;
  texture.wrapU = texture.wrapV = Texture.WRAP_ADDRESSMODE;
  return texture;
}

/** Piecewise-linear lookup through gradient stops [at, value]. */
function ramp(stops: [number, number][], t: number) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [a, va] = stops[i - 1];
    const [b, vb] = stops[i];
    if (t <= b) return va + ((vb - va) * (t - a)) / (b - a || 1);
  }
  return stops[stops.length - 1][1];
}

/** Soft radial falloff (white, alpha by stop): contact shadows, light spill. */
export function radialTexture(name: string, scene: Scene, stops: [number, number][]) {
  const size = 256;
  const texture = rawTexture(name, size, size, scene, () => 255, (k) => {
    const t = Math.hypot((k % size) + 0.5 - size / 2, Math.floor(k / size) + 0.5 - size / 2) / (size / 2);
    return 255 * ramp(stops, t);
  });
  texture.wrapU = texture.wrapV = Texture.CLAMP_ADDRESSMODE;
  return texture;
}

/** Vertical LED wash: from a floor cove (bright at the bottom) or a fascia strip (`fromTop`). */
export function washTexture(name: string, scene: Scene, fromTop = false) {
  const stops: [number, number][] = [[0, 1], [0.06, 0.4], [0.3, 0.06], [1, 0]];
  // Row 0 is the bottom of the texture (v = 0): a fascia strip is bright at the top.
  const texture = rawTexture(name, 8, 256, scene, (k) => {
    const row = Math.floor(k / 8) + 0.5;
    return 255 * ramp(stops, (fromTop ? 256 - row : row) / 256);
  });
  texture.wrapU = texture.wrapV = Texture.CLAMP_ADDRESSMODE;
  return texture;
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
  const size = 512;
  const px = new Float32Array(size * size).fill(230);
  // Soft light and dark blotches (radial falloff, composited "over").
  for (let i = 0; i < 90; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 30 + rnd() * 120;
    const shade = rnd() < 0.5 ? 255 : 190;
    const peak = 0.05 + rnd() * 0.08;
    for (let py = Math.max(0, Math.floor(y - r)); py < Math.min(size, Math.ceil(y + r)); py++) {
      for (let pxl = Math.max(0, Math.floor(x - r)); pxl < Math.min(size, Math.ceil(x + r)); pxl++) {
        const t = Math.hypot(pxl + 0.5 - x, py + 0.5 - y) / r;
        if (t >= 1) continue;
        const a = peak * (1 - t);
        const k = py * size + pxl;
        px[k] += (shade - px[k]) * a;
      }
    }
  }
  // Slab joints along two edges.
  for (let k = 0; k < size * 2; k++) {
    const top = k, left = (k % size) * size + Math.floor(k / size);
    px[top] += (60 - px[top]) * 0.55;
    px[left] += (60 - px[left]) * 0.55;
  }
  const texture = rawTexture("concrete", size, size, scene, (k) => px[k]);
  texture.anisotropicFilteringLevel = 8;
  return texture;
}

/** Booth carpet: fine fibre noise. */
export function carpetTexture(scene: Scene) {
  const rnd = random(11);
  const texture = rawTexture("carpet", 256, 256, scene, () => 205 + rnd() * 50);
  texture.anisotropicFilteringLevel = 8;
  return texture;
}

/** The "A" mark, `h` tall, top-left at (x, y). */
export function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, variant: MarkVariant, mono?: string) {
  const scale = h / markViewBox.height;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-markViewBox.x, -markViewBox.y);
  ctx.lineJoin = "round";
  ctx.lineWidth = 6;
  for (const { part, d } of markPaths) {
    const path = new Path2D(d);
    let paint: string | CanvasGradient = mono ?? "";
    if (!mono) {
      const g = markGradients[part];
      const [c0, c1] = markColors[variant][part];
      const { x: bx, y: by, width: w, height: bh } = markViewBox;
      paint = ctx.createLinearGradient(bx + g.x1 * w, by, bx + g.x2 * w, by + g.y2 * bh);
      paint.addColorStop(0, c0);
      paint.addColorStop(1, c1);
    }
    ctx.fillStyle = paint;
    ctx.strokeStyle = paint;
    ctx.fill(path);
    ctx.stroke(path);
  }
  ctx.restore();
}

/** The lockup (mark + "Ashmartisan") from `left`, vertically centred on `centerY`. Returns its width. */
export function drawLockupAt(
  ctx: CanvasRenderingContext2D,
  left: number,
  centerY: number,
  markH: number,
  variant: MarkVariant,
  textScale = 0.645,
) {
  const markW = (markViewBox.width / markViewBox.height) * markH;
  const ink = variant === "onDark" ? ["#ffffff", "#c9d0d6"] : ["#16202a", "#597592"];
  const px = Math.round(markH * textScale);
  const font = (weight: number) => `${weight} ${px}px Montserrat, system-ui, sans-serif`;
  const gap = markH * 0.38;
  drawMark(ctx, left, centerY - markH / 2, markH, variant);
  const baseline = centerY + px * 0.36;
  ctx.textBaseline = "alphabetic";
  ctx.font = font(600);
  ctx.fillStyle = ink[0];
  ctx.fillText("Ash", left + markW + gap, baseline);
  const bold = ctx.measureText("Ash").width;
  ctx.font = font(400);
  ctx.fillStyle = ink[1];
  ctx.fillText("martisan", left + markW + gap + bold, baseline);
  return markW + gap + bold + ctx.measureText("martisan").width;
}

/** The lockup, centred, on a transparent canvas. */
export function drawLockup(ctx: CanvasRenderingContext2D, variant: MarkVariant) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const markH = height * 0.62;
  // Measure off-canvas first, then centre.
  ctx.save();
  ctx.globalAlpha = 0;
  const w = drawLockupAt(ctx, 0, height / 2, markH, variant);
  ctx.restore();
  drawLockupAt(ctx, (width - w) / 2, height / 2, markH, variant);
}

/** The mark alone in one flat colour, for an inlay (alpha from the shape). */
export function markTexture(name: string, scene: Scene) {
  return canvasTexture(name, 256, 256, scene, (ctx) => {
    ctx.clearRect(0, 0, 256, 256);
    const h = 200;
    const w = (markViewBox.width / markViewBox.height) * h;
    drawMark(ctx, (256 - w) / 2, 28, h, "onDark", "#ffffff");
  });
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

/** A laptop keyboard well: dark keys on a darker deck, function row, wide space bar. */
export function keyboardTexture(scene: Scene) {
  return canvasTexture("keyboard", 1024, 420, scene, (ctx) => {
    ctx.fillStyle = "#1c2025";
    ctx.fillRect(0, 0, 1024, 420);
    const key = (x: number, y: number, w: number, h: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 7);
      ctx.fillStyle = "#0c0e10";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(x + 3, y + 2, w - 6, 2);
    };
    const pad = 8;
    const unit = (1024 - pad * 2) / 14.5;
    const gap = 7;
    // Function row (half height), then five full rows.
    for (let i = 0; i < 14; i++) key(pad + i * (unit * 1.0357) + gap / 2, pad, unit - gap, unit * 0.5);
    const rows: number[][] = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7],
      [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2],
      [1, 1, 1, 1.25, 5.25, 1.25, 1, 1, 1],
    ];
    rows.forEach((row, r) => {
      const total = row.reduce((a, b) => a + b, 0);
      const scale = (1024 - pad * 2) / total;
      let x = pad;
      const y = pad + unit * 0.6 + r * unit * 0.92;
      for (const w of row) {
        key(x + gap / 2, y, w * scale - gap, unit * 0.92 - gap);
        x += w * scale;
      }
    });
  });
}

/** A black rounded rectangle on transparency: cover glass for a device of this aspect ratio. */
export function roundedPanelTexture(name: string, scene: Scene, aspect: number, radius: number) {
  const width = 512;
  const height = Math.round(width / aspect);
  return canvasTexture(name, width, height, scene, (ctx) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, radius * width);
    ctx.fillStyle = "#08090b";
    ctx.fill();
  });
}
