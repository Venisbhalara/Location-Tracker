import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * OpticalReveal Component
 * Ultra-Smooth 120FPS GPU-Composited Luxury Reveal.
 *
 * Performance guarantees:
 * 1. 100% GPU Compositor Thread: Strictly animates transform (y, scale) and opacity.
 *    Completely avoids runtime Gaussian blur rasterization which causes severe scroll jank.
 * 2. Zero Repaints / Zero Reflows: Uses `translate3d` and GPU layer promotion.
 * 3. Proactive Viewport Margin: Triggers early before entering center screen so elements
 *    are already rendered cleanly without pop-in.
 * 4. Single-trigger: viewport `once: true` ensures 0 CPU/GPU overhead on subsequent scrolls.
 */
export const OpticalReveal = memo(
  ({
    children,
    delay = 0,
    duration = 0.55,
    distance = 18,
    className = "",
    as = "div",
    style = {},
  }) => {
    const prefersReducedMotion = useReducedMotion();
    const MotionComponent = motion[as] || motion.div;

    if (prefersReducedMotion) {
      return (
        <MotionComponent
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25, delay }}
          className={className}
          style={style}
        >
          {children}
        </MotionComponent>
      );
    }

    return (
      <MotionComponent
        initial={{
          opacity: 0,
          y: distance,
          scale: 0.988,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
          transitionEnd: {
            willChange: "auto",
          },
        }}
        viewport={{ once: true, margin: "0px 0px -30px 0px" }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // Apple-grade crisp deceleration curve
        }}
        className={className}
        style={{
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform, opacity",
          ...style,
        }}
      >
        {children}
      </MotionComponent>
    );
  }
);

OpticalReveal.displayName = "OpticalReveal";

/**
 * Stagger Container variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delay || 0,
      staggerChildren: custom.stagger || 0.06,
    },
  }),
};

/**
 * OpticalStaggerContainer
 * Coordinates sequential, wave-like GPU-accelerated reveals across child items.
 */
export const OpticalStaggerContainer = memo(
  ({
    children,
    delay = 0,
    stagger = 0.06,
    className = "",
    style = {},
  }) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <motion.div
        variants={containerVariants}
        custom={{ delay, stagger }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -30px 0px" }}
        className={className}
        style={{
          transform: prefersReducedMotion ? "none" : "translate3d(0, 0, 0)",
          ...style,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

OpticalStaggerContainer.displayName = "OpticalStaggerContainer";

const itemVariants = {
  hidden: (custom = {}) => ({
    opacity: 0,
    y: custom.distance || 16,
    scale: 0.988,
  }),
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: custom.duration || 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
    transitionEnd: {
      willChange: "auto",
    },
  }),
};

const reducedMotionItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25 },
  },
};

/**
 * OpticalStaggerItem
 * Individual element inside an OpticalStaggerContainer.
 */
export const OpticalStaggerItem = memo(
  ({
    children,
    distance = 16,
    duration = 0.5,
    className = "",
    style = {},
  }) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <motion.div
        variants={prefersReducedMotion ? reducedMotionItemVariants : itemVariants}
        custom={{ distance, duration }}
        className={className}
        style={{
          transform: prefersReducedMotion ? "none" : "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform, opacity",
          ...style,
        }}
      >
        {children}
      </motion.div>
    );
  }
);

OpticalStaggerItem.displayName = "OpticalStaggerItem";

export default OpticalReveal;

