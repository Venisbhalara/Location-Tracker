import { useEffect } from "react";

/**
 * Off-screen CSS animation pauser.
 *
 * The site uses many infinite CSS animations (sonar pulses, radar sweeps,
 * SVG packet-stream dashes, orbit rings, light beams...). Browsers keep ticking
 * these every frame even when they are far off-screen, which costs main-thread
 * style recalcs + SVG layout invalidations on every scroll frame. Because Lenis
 * smooth scrolling runs on the main thread, that work directly causes scroll jank.
 *
 * This hook observes every page <section> / <footer> and toggles a
 * `data-offscreen` attribute. CSS (index.css) sets
 * `animation-play-state: paused` inside off-screen sections only, so every
 * animation still plays exactly as before whenever it's visible (with a 200px
 * pre-roll margin so it is already running before it scrolls into view).
 */
const SELECTOR = "main section, main [data-pause-offscreen], footer";

export function useOffscreenAnimationPause(routeKey) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.removeAttribute("data-offscreen");
          } else {
            entry.target.setAttribute("data-offscreen", "");
          }
        }
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );

    const observed = new WeakSet();
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };

    scan();

    // Lazy routes / Suspense boundaries mount content after this effect runs,
    // so watch <main> for newly added sections (batched to one scan per frame).
    let rafId = null;
    const mo = new MutationObserver(() => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        scan();
      });
    });
    const main = document.querySelector("main") || document.body;
    mo.observe(main, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      mo.disconnect();
      io.disconnect();
    };
  }, [routeKey]);
}
