/**
 * The booth's screens show the product, not stock renders: the explainer app on the big
 * screen (cycling Solid → X-ray → Section → Exploded like a kiosk attract loop), the same app
 * in sales mode on the tablet, and a customer's product page with the explainer embedded on
 * the laptop. All drawn on canvases from the site's own copy and renders, so they localise.
 */
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";
import { drawLockupAt, drawMark } from "./textures";

export type ViewId = "solid" | "xray" | "section" | "exploded";
const VIEWS: ViewId[] = ["solid", "xray", "section", "exploded"];

export interface ScreenCopy {
  device: string;
  quote: string;
  hint: string;
  live: string;
  ask: string;
  views: Record<ViewId, string>;
  parts: { key: string; title: string; summary: string; specs: [string, string][] }[];
  hotspots: { key: string; x: number; y: number }[];
  /** Renders per view, site paths without the base. */
  shots: Record<ViewId, string>;
  site: { brand: string; url: string; eyebrow: string; lead: string; explore: string; nav: string[] };
  modules: string[];
  desk: string;
}

const NAVY = "#16202a";
const INK = "#0e151c";
const ORANGE = "#f2a250";
const STEEL = "#7496b7";
const TEXT = "#eef1f4";
const MUTED = "#9aa7b4";
const font = (weight: number, size: number, mono = false) =>
  `${weight} ${size}px ${mono ? '"JetBrains Mono", ui-monospace, monospace' : "Montserrat, system-ui, sans-serif"}`;

type Ctx = CanvasRenderingContext2D;

function rounded(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: Ctx, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  // CJK has no spaces: break per character there, per word elsewhere.
  const tokens = /\s/.test(text) ? text.split(/(\s+)/) : [...text];
  let line = "";
  let lines = 0;
  for (const token of tokens) {
    const next = line + token;
    if (ctx.measureText(next).width > maxWidth && line.trim()) {
      if (lines === maxLines - 1) {
        ctx.fillText(`${line.trim()}…`, x, y + lines * lineHeight);
        return;
      }
      ctx.fillText(line.trim(), x, y + lines * lineHeight);
      lines++;
      line = token.trimStart();
    } else {
      line = next;
    }
  }
  ctx.fillText(line.trim(), x, y + lines * lineHeight);
}

/** Draw an image to cover a rect; returns where it landed (for hotspot positions). */
function cover(ctx: Ctx, img: HTMLImageElement | undefined, x: number, y: number, w: number, h: number, alpha = 1) {
  if (!img) return { dx: x, dy: y, dw: w, dh: h };
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
  return { dx, dy, dw, dh };
}

function pill(ctx: Ctx, x: number, y: number, label: string, size: number, stroke: string, fill: string, color: string) {
  ctx.font = font(600, size);
  const w = ctx.measureText(label).width + size * 1.4;
  const h = size * 1.9;
  rounded(ctx, x, y, w, h, size * 0.4);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + size * 0.7, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return w;
}

function segmented(ctx: Ctx, x: number, y: number, labels: string[], active: number, size: number) {
  ctx.font = font(500, size);
  const pad = size * 0.9;
  const widths = labels.map((l) => ctx.measureText(l).width + pad * 2);
  const h = size * 2.2;
  const total = widths.reduce((a, b) => a + b, 0) + 8;
  rounded(ctx, x, y, total, h + 8, size * 0.5);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  let cx = x + 4;
  labels.forEach((label, i) => {
    if (i === active) {
      rounded(ctx, cx, y + 4, widths[i], h, size * 0.4);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fill();
    }
    ctx.fillStyle = i === active ? "#ffffff" : MUTED;
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx + pad, y + 4 + h / 2 + 1);
    cx += widths[i];
  });
  ctx.textBaseline = "alphabetic";
  return total;
}

// ---------------------------------------------------------------------------- the app

interface AppState {
  view: ViewId;
  part: number;
}

/** The explainer as it runs on a stand screen: bar, render, numbered parts, part panel, views. */
function drawApp(ctx: Ctx, copy: ScreenCopy, images: Partial<Record<ViewId, HTMLImageElement>>, state: AppState, fade?: { from: ViewId; t: number }) {
  const W = 1600;
  const H = 1000;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  const area = { x: 0, y: 72, w: W, h: H - 72 - 92 };
  let rect = cover(ctx, images[fade ? fade.from : state.view], area.x, area.y, area.w, area.h);
  if (fade) rect = cover(ctx, images[state.view], area.x, area.y, area.w, area.h, fade.t);

  // Top bar
  ctx.fillStyle = "rgba(22,32,42,0.97)";
  ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, 71, W, 1);
  drawLockupAt(ctx, 30, 36, 32, "onDark", 0.62);
  pill(ctx, 300, 15, `${copy.device}  ▾`, 21, "rgba(116,150,183,0.5)", "rgba(116,150,183,0.14)", TEXT);
  ctx.font = font(600, 21);
  const qw = ctx.measureText(copy.quote).width + 30;
  pill(ctx, W - 30 - qw, 15, copy.quote, 21, "rgba(242,162,80,0.7)", "rgba(242,162,80,0.14)", ORANGE);

  // Numbered parts (solid view only, as in the app)
  if (state.view === "solid") {
    copy.hotspots.forEach((spot, i) => {
      const x = rect.dx + (spot.x / 100) * rect.dw;
      const y = rect.dy + (spot.y / 100) * rect.dh;
      const active = i === state.part;
      ctx.beginPath();
      ctx.arc(x, y, active ? 24 : 21, 0, Math.PI * 2);
      ctx.fillStyle = active ? ORANGE : "rgba(22,32,42,0.88)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = active ? "rgba(242,162,80,0.35)" : "rgba(255,255,255,0.85)";
      ctx.stroke();
      ctx.fillStyle = active ? NAVY : "#ffffff";
      ctx.font = font(700, 20);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), x, y + 1);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    });
  }

  // Part panel
  const part = copy.parts[state.part % copy.parts.length];
  const px = W - 30 - 440;
  const py = 100;
  const specs = part.specs.slice(0, 2);
  const ph = 300 + specs.length * 56;
  rounded(ctx, px, py, 440, ph, 22);
  ctx.fillStyle = "rgba(22,32,42,0.93)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = ORANGE;
  ctx.font = font(500, 20, true);
  ctx.fillText(String(state.part + 1).padStart(2, "0"), px + 32, py + 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(600, 34);
  wrap(ctx, part.title, px + 32, py + 100, 380, 40, 1);
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 21);
  wrap(ctx, part.summary, px + 32, py + 146, 380, 31, 3);
  let sy = py + 262;
  for (const [label, value] of specs) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(px + 32, sy - 30, 376, 1);
    ctx.font = font(400, 19);
    ctx.fillStyle = MUTED;
    ctx.fillText(label, px + 32, sy);
    ctx.fillStyle = TEXT;
    ctx.textAlign = "right";
    ctx.fillText(value, px + 408, sy);
    ctx.textAlign = "left";
    sy += 56;
  }
  ctx.fillStyle = ORANGE;
  ctx.font = font(600, 20);
  ctx.fillText(copy.ask, px + 32, py + ph - 30);

  // Toolbar
  ctx.fillStyle = "rgba(22,32,42,0.97)";
  ctx.fillRect(0, H - 92, W, 92);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, H - 92, W, 1);
  const segW = segmented(ctx, 30, H - 74, VIEWS.map((v) => copy.views[v]), VIEWS.indexOf(state.view), 21);
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 19);
  ctx.fillText(copy.hint, 30 + segW + 36, H - 38);
  ctx.font = font(600, 20);
  const lw = ctx.measureText(copy.live).width;
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(W - 30 - lw - 22, H - 45, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TEXT;
  ctx.fillText(copy.live, W - 30 - lw, H - 38);
}

/** The same explainer in sales mode on a tablet: status bar, render, part card, view rail. */
function drawTablet(ctx: Ctx, copy: ScreenCopy, img: HTMLImageElement | undefined) {
  const W = 1024;
  const H = 768;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  cover(ctx, img, 0, 0, W, H);
  ctx.fillStyle = "rgba(14,21,28,0.75)";
  ctx.fillRect(0, 0, W, 30);
  ctx.fillStyle = TEXT;
  ctx.font = font(600, 16);
  ctx.fillText("9:41", 20, 21);
  ctx.textAlign = "right";
  ctx.fillText("100%", W - 20, 21);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(22,32,42,0.92)";
  ctx.fillRect(0, 30, W, 62);
  drawLockupAt(ctx, 22, 61, 26, "onDark", 0.62);
  pill(ctx, 250, 44, `${copy.device}  ▾`, 17, "rgba(116,150,183,0.5)", "rgba(116,150,183,0.14)", TEXT);

  // View rail
  VIEWS.forEach((view, i) => {
    const y = 130 + i * 70;
    rounded(ctx, W - 150, y, 128, 52, 14);
    ctx.fillStyle = view === "section" ? "rgba(242,162,80,0.9)" : "rgba(22,32,42,0.85)";
    ctx.fill();
    ctx.fillStyle = view === "section" ? NAVY : TEXT;
    ctx.font = font(600, 17);
    ctx.textAlign = "center";
    ctx.fillText(copy.views[view], W - 86, y + 32);
    ctx.textAlign = "left";
  });

  // Part card
  const part = copy.parts[0];
  rounded(ctx, 24, H - 254, 520, 230, 20);
  ctx.fillStyle = "rgba(22,32,42,0.94)";
  ctx.fill();
  ctx.fillStyle = ORANGE;
  ctx.font = font(500, 17, true);
  ctx.fillText("01", 52, H - 212);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(600, 30);
  wrap(ctx, part.title, 52, H - 170, 460, 34, 1);
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 18);
  wrap(ctx, part.summary, 52, H - 132, 460, 27, 2);
  rounded(ctx, 52, H - 86, 250, 46, 12);
  ctx.fillStyle = ORANGE;
  ctx.fill();
  ctx.fillStyle = NAVY;
  ctx.font = font(600, 18);
  ctx.fillText(copy.ask, 70, H - 56);
}

/** A customer's product page with the explainer embedded: the "your website" surface. */
function drawSite(ctx: Ctx, copy: ScreenCopy, img: HTMLImageElement | undefined) {
  const W = 1280;
  const H = 800;
  const s = copy.site;
  ctx.fillStyle = "#f3f4f5";
  ctx.fillRect(0, 0, W, H);
  // Browser chrome
  ctx.fillStyle = "#dde2e7";
  ctx.fillRect(0, 0, W, 46);
  for (const [i, c] of ["#ff5f57", "#febc2e", "#28c840"].entries()) {
    ctx.beginPath();
    ctx.arc(26 + i * 22, 23, 7, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  }
  rounded(ctx, 110, 8, 330, 38, 10);
  ctx.fillStyle = "#f3f4f5";
  ctx.fill();
  ctx.fillStyle = "#4b5967";
  ctx.font = font(500, 16);
  wrap(ctx, `${copy.device} · ${s.brand}`, 128, 33, 290, 20, 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 46, W, 50);
  rounded(ctx, 24, 54, W - 48, 34, 17);
  ctx.fillStyle = "#eef1f4";
  ctx.fill();
  ctx.fillStyle = "#4b5967";
  ctx.font = font(400, 16);
  ctx.fillText(s.url, 48, 77);
  // Site header
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 96, W, 72);
  ctx.fillStyle = "#e0e4e8";
  ctx.fillRect(0, 167, W, 1);
  ctx.fillStyle = NAVY;
  ctx.font = font(700, 24);
  ctx.fillText(s.brand.toUpperCase(), 60, 141);
  ctx.font = font(500, 17);
  ctx.fillStyle = "#4b5967";
  let nx = W - 60;
  for (const item of [...s.nav].reverse()) {
    const w = ctx.measureText(item).width;
    nx -= w;
    ctx.fillText(item, nx, 139);
    nx -= 36;
  }
  // Hero copy
  ctx.fillStyle = "#597592";
  ctx.font = font(600, 15);
  ctx.fillText(s.eyebrow.toUpperCase(), 60, 240);
  ctx.fillStyle = NAVY;
  ctx.font = font(600, 46);
  wrap(ctx, copy.device, 60, 300, 470, 54, 2);
  ctx.fillStyle = "#4b5967";
  ctx.font = font(400, 19);
  wrap(ctx, s.lead, 60, 430, 460, 30, 4);
  rounded(ctx, 60, 570, 200, 54, 12);
  ctx.fillStyle = ORANGE;
  ctx.fill();
  ctx.fillStyle = NAVY;
  ctx.font = font(600, 18);
  ctx.fillText(copy.quote, 84, 603);
  rounded(ctx, 276, 570, 210, 54, 12);
  ctx.strokeStyle = "#c9d0d6";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.fillText(s.explore, 298, 603);
  // Embedded explainer
  const vx = 580;
  const vy = 206;
  const vw = W - 60 - vx;
  const vh = 520;
  ctx.save();
  rounded(ctx, vx, vy, vw, vh, 18);
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.fillRect(vx, vy, vw, vh);
  cover(ctx, img, vx, vy, vw, vh - 64);
  ctx.fillStyle = "rgba(22,32,42,0.96)";
  ctx.fillRect(vx, vy + vh - 64, vw, 64);
  segmented(ctx, vx + 18, vy + vh - 54, VIEWS.map((v) => copy.views[v]), 0, 15);
  ctx.restore();
  pill(ctx, vx + 18, vy + 18, `● ${copy.live}`, 15, "rgba(242,162,80,0.6)", "rgba(14,21,28,0.7)", ORANGE);
  drawMark(ctx, vx + vw - 52, vy + 20, 26, "onDark");
}

/** Boot splash, shown for a beat when the screens power on. */
function drawSplash(ctx: Ctx) {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);
  drawLockupAt(ctx, W / 2 - H * 0.22, H / 2, H * 0.09, "onDark", 0.62);
  rounded(ctx, W * 0.38, H * 0.62, W * 0.24, 6, 3);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fill();
  rounded(ctx, W * 0.38, H * 0.62, W * 0.24 * 0.6, 6, 3);
  ctx.fillStyle = ORANGE;
  ctx.fill();
}

// ---------------------------------------------------------------------------- print

/** Brochure covers for the literature rack: one per platform module, side by side. */
function drawBrochures(ctx: Ctx, modules: string[]) {
  const { height: H } = ctx.canvas;
  const w = Math.round(H * 0.707);
  modules.forEach((name, i) => {
    const x = i * w;
    const g = ctx.createLinearGradient(x, 0, x + w, H);
    g.addColorStop(0, i === 1 ? "#22303d" : NAVY);
    g.addColorStop(1, INK);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, w, H);
    ctx.fillStyle = [ORANGE, STEEL, "#c9d0d6"][i % 3];
    ctx.fillRect(x, 0, w, 10);
    drawMark(ctx, x + 18, 30, 26, "onDark");
    ctx.fillStyle = "#ffffff";
    ctx.font = font(700, 30);
    wrap(ctx, name, x + 18, H - 70, w - 36, 34, 2);
    ctx.fillStyle = MUTED;
    ctx.font = font(500, 14);
    ctx.fillText("Ashmartisan", x + 18, H - 22);
  });
}

/** Acrylic desk sign on the counter. */
function drawDesk(ctx: Ctx, label: string) {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = "#f5f6f7";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(0, H - 12, W, 12);
  ctx.fillStyle = NAVY;
  ctx.font = font(700, 54);
  wrap(ctx, `${label} →`, 34, 104, W - 68, 60, 2);
  drawLockupAt(ctx, 34, H - 52, 34, "onLight", 0.62);
}

// ---------------------------------------------------------------------------- the set

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function texture(name: string, width: number, height: number, scene: Scene, alpha = false) {
  const t = new DynamicTexture(name, { width, height }, scene, true);
  t.hasAlpha = alpha;
  return t;
}

const STEP_MS = 3200;
const FADE_STEPS = [0.34, 0.67, 1];

export async function createScreens(scene: Scene, copy: ScreenCopy, url: (path: string) => string) {
  const app = texture("app-screen", 1600, 1000, scene);
  const tablet = texture("tablet-screen", 1024, 768, scene);
  const site = texture("site-screen", 1280, 800, scene);
  const brochures = texture("brochures", Math.round(256 * 0.707) * copy.modules.length, 256, scene);
  const desk = texture("desk-sign", 512, 256, scene);
  const ctx = (t: DynamicTexture) => t.getContext() as unknown as Ctx;

  const images: Partial<Record<ViewId, HTMLImageElement>> = {};
  // The solid view (and the section view for the tablet) before the screens boot; the rest after.
  const first = await Promise.allSettled([loadImage(url(copy.shots.solid)), loadImage(url(copy.shots.section))]);
  if (first[0].status === "fulfilled") images.solid = first[0].value;
  if (first[1].status === "fulfilled") images.section = first[1].value;
  for (const view of ["xray", "exploded"] as const) {
    loadImage(url(copy.shots[view])).then((img) => (images[view] = img), () => undefined);
  }

  drawBrochures(ctx(brochures), copy.modules);
  brochures.update();
  drawDesk(ctx(desk), copy.desk);
  desk.update();

  // Screens start dark; boot() shows the splash, then the apps.
  for (const t of [app, tablet, site]) {
    const c = ctx(t);
    c.fillStyle = "#000";
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    t.update();
  }

  const sequence: AppState[] = [
    { view: "solid", part: 1 },
    { view: "solid", part: 0 },
    { view: "xray", part: 0 },
    { view: "section", part: 2 },
    { view: "exploded", part: 4 },
    { view: "solid", part: 3 },
  ];
  let step = 0;
  let state = sequence[0];
  let running = false;
  let nextAt = 0;
  let fade: { from: ViewId; i: number; at: number } | null = null;

  const paintApp = (f?: { from: ViewId; t: number }) => {
    drawApp(ctx(app), copy, images, state, f);
    app.update();
  };
  const paintAll = () => {
    paintApp();
    drawTablet(ctx(tablet), copy, images.section);
    tablet.update();
    drawSite(ctx(site), copy, images.solid);
    site.update();
  };

  return {
    app,
    tablet,
    site,
    brochures,
    desk,
    /** Power-on: splash first, apps a beat later. */
    boot(skipSplash = false) {
      if (skipSplash) {
        paintAll();
        running = true;
        nextAt = performance.now() + STEP_MS;
        return;
      }
      for (const t of [app, tablet, site]) {
        drawSplash(ctx(t));
        t.update();
      }
      setTimeout(() => {
        paintAll();
        running = true;
        nextAt = performance.now() + STEP_MS;
      }, 650);
    },
    /** Advance the attract loop. Returns true when a texture changed (the scene needs a frame). */
    tick(now: number): boolean {
      if (!running) return false;
      if (fade && now >= fade.at) {
        const t = FADE_STEPS[fade.i];
        paintApp(t < 1 ? { from: fade.from, t } : undefined);
        fade = t < 1 ? { ...fade, i: fade.i + 1, at: now + 70 } : null;
        return true;
      }
      if (now < nextAt) return false;
      nextAt = now + STEP_MS;
      const previous = state.view;
      step = (step + 1) % sequence.length;
      state = sequence[step];
      if (!images[state.view]) state = { ...state, view: "solid" };
      if (state.view !== previous) {
        fade = { from: previous, i: 0, at: now };
        return this.tick(now);
      }
      paintApp();
      return true;
    },
  };
}

export type Screens = Awaited<ReturnType<typeof createScreens>>;
