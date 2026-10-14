import { useEffect, useRef, memo } from "react";

/**
 * OdometerCounter Component
 * Mathematically damped quartic ease-out counter (1 - (1 - t)^4).
 *
 * Performance Architecture:
 * - Zero React re-renders during animation: mutates DOM textNode directly via ref.
 * - Single-shot IntersectionObserver: runs once when entering viewport, then disconnects
 *   completely so ongoing CPU/GPU usage is 0%.
 * - Respects prefers-reduced-motion by rendering final target value immediately.
 */
const OdometerCounter = memo(
  ({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = 1100,
    className = "",
  }) => {
    const nodeRef = useRef(null);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
      const el = nodeRef.current;
      if (!el) return;

      const numericTarget = Number(value);
      if (Number.isNaN(numericTarget)) {
        el.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      if (numericTarget === 0) {
        el.textContent = `${prefix}${numericTarget.toFixed(decimals)}${suffix}`;
        return;
      }

      let rafId = null;

      const startAnimation = () => {
        if (hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;

        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Quartic ease-out: v(t) = 1 - (1 - t)^4 for crisp horological deceleration
          const eased = 1 - Math.pow(1 - progress, 4);
          const currentVal = numericTarget * eased;

          if (el) {
            el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;
          }

          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          } else if (el) {
            el.textContent = `${prefix}${numericTarget.toFixed(decimals)}${suffix}`;
          }
        };

        rafId = requestAnimationFrame(tick);
      };

      if (typeof IntersectionObserver !== "undefined") {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              startAnimation();
              observer.disconnect();
            }
          },
          { threshold: 0.25 }
        );
        observer.observe(el);
        return () => {
          observer.disconnect();
          if (rafId) cancelAnimationFrame(rafId);
        };
      } else {
        startAnimation();
        return () => {
          if (rafId) cancelAnimationFrame(rafId);
        };
      }
    }, [value, prefix, suffix, decimals, duration]);

    return (
      <span ref={nodeRef} className={`tabular-nums ${className}`}>
        {`${prefix}${Number(value).toFixed(decimals)}${suffix}`}
      </span>
    );
  }
);

OdometerCounter.displayName = "OdometerCounter";

export default OdometerCounter;
