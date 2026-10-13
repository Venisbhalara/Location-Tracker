import { memo } from "react";
import { motion, useScroll } from "framer-motion";

/**
 * ScrollProgressBar Component
 * Minimalist 2px hairline scroll progress indicator.
 * Directly mapped to scrollYProgress without heavy useSpring physics solver for 120 FPS performance.
 */
export const ScrollProgressBar = memo(() => {
  const { scrollYProgress } = useScroll();

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
