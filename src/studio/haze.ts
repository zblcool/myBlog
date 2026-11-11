/**
 * Drives one Hazeglow canvas (studio/data/haze.ts) with hazeglow/core: no React on the page.
 * It animates only while `watch` is on screen and the tab is visible, holds a still frame under
 * reduced motion (or when `still` is set), and renders at most 1x device pixels: a soft, grainy
 * gradient gains cost, not detail, from more. Resolves false when there is no WebGL2 on a GPU
 * (Hazeglow refuses software rendering), so the caller's CSS background stays.
 */
import { createRenderer } from "hazeglow/core";
import { hazeConfig } from "@/studio/data/haze";

export function mountHaze(canvas: HTMLCanvasElement, watch: Element, options: { still?: boolean } = {}): Promise<boolean> {
  const renderer = createRenderer(canvas);
  if (!renderer) return Promise.resolve(false);

  const still = options.still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scale = () => Math.min(devicePixelRatio || 1, matchMedia("(max-width: 720px)").matches ? 0.75 : 1);
  let visible = false;
  let frame = 0;
  let clock = 0;
  let last = 0;

  const draw = () => renderer.render(hazeConfig, clock);
  const resize = () => {
    const s = scale();
    const max = renderer.maxSize;
    renderer.resize(Math.min(Math.round(canvas.clientWidth * s), max), Math.min(Math.round(canvas.clientHeight * s), max));
    draw();
  };
  const tick = (now: number) => {
    clock += Math.min((now - last) / 1000, 0.1);
    last = now;
    draw();
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (frame || still || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  return renderer.ready.then((ok) => {
    if (!ok) return false;
    resize();
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(watch);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return true;
  });
}
