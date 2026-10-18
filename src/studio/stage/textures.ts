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
