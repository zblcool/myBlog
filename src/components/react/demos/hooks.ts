import { useEffect, useRef, useState, type RefObject } from "react";

const scriptCache = new Map<string, Promise<void>>();

/** Load an external script once and resolve when it has executed. */
export function loadScript(src: string) {
  let pending = scriptCache.get(src);

  if (!pending) {
    pending = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(el);
    });
    scriptCache.set(src, pending);
  }

  return pending;
}

export function loadStyle(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) {
    return;
  }

  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  document.head.appendChild(el);
}

/**
 * Tracks whether the element is on screen. `started` flips true on first
 * sight (use it to lazy-load); `visibleRef` stays current (use it to pause).
 */
export function useInView(ref: RefObject<HTMLElement | null>) {
  const [started, setStarted] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref]);

  return { started, visibleRef };
}
