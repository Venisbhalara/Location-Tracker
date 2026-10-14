import { memo, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { lenisInstance, subscribeLenisScroll } from "../../hooks/useLenis";

/**
 * ScrollProgressBar Component
 * Minimalist 2px hairline scroll progress indicator.
 *
 * Driven directly by Lenis' precomputed `progress` (scroll / limit) on every
 * Lenis frame — no DOM reads, so it never forces a synchronous layout.
 * (framer-motion's useScroll re-reads scrollHeight/clientHeight on every scroll
 * event, which forced a layout flush per frame while Lenis was scrolling.)
 * Rendered with a GPU-composited scaleX transform.
 */
export const ScrollProgressBar = memo(() => {
  const scrollYProgress = useMotionValue(0);

  useEffect(() => {
    const unsubLenis = subscribeLenisScroll((e) => {
      if (typeof e?.progress === "number" && Number.isFinite(e.progress)) {
        scrollYProgress.set(Math.min(Math.max(e.progress, 0), 1));
      }
    });

    // Native fallback (only when Lenis isn't running, e.g. reduced environments)
    const handleNativeScroll = () => {
      if (lenisInstance) return;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollYProgress.set(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0);
    };

    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    handleNativeScroll();

    return () => {
      unsubLenis();
      window.removeEventListener("scroll", handleNativeScroll);
    };
  }, [scrollYProgress]);

  return (
    <motion.div
      style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-600 to-emerald-400 z-[100] pointer-events-none opacity-90"
      aria-hidden="true"
    />
  );
});

ScrollProgressBar.displayName = "ScrollProgressBar";

export default ScrollProgressBar;
