import { useEffect, useState, useRef, memo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { lenisInstance } from "../../hooks/useLenis";

/**
 * Apple iPadOS Style "Magnetic Fluid" Cursor
 *
 * Flawless Scroll & Text Tracking Edition:
 * 1. Words Show Effect Preserved: Shows sleek 2.5px vertical I-beam indicator on text/words.
 * 2. Zero Scroll Glitches / No Stuck State: Dynamically tracks scroll & wheel events.
 *    When you scroll, the cursor immediately releases any text or magnetic lock so the
 *    effect never persists or bleeds into other sections.
 * 3. Intelligent Settling: Once scrolling settles (50ms), re-evaluates the exact element
 *    under the cursor. If resting on text, resumes text mode; if on empty space, remains default.
 * 4. 100% Crisp Typography: Zero `backdrop-blur` filters.
 * 5. Touchscreen Bypass: Auto-disabled on mobile / touch devices.
 */
export const AppleMagneticCursor = memo(() => {
  const [cursorMode, setCursorMode] = useState("default"); // "default" | "magnetic" | "hover" | "text"
  const [magneticDimensions, setMagneticDimensions] = useState({
    width: 18,
    height: 18,
    borderRadius: 9999,
  });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Target coordinates for outer fluid morphing capsule
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);

  // Direct instantaneous 1:1 mouse position
  const directMouseX = useMotionValue(-100);
  const directMouseY = useMotionValue(-100);

  // Snappy iPadOS spring physics (high stiffness, critical damping)
  const springConfig = { damping: 28, stiffness: 420, mass: 0.35 };
  const smoothX = useSpring(targetX, springConfig);
  const smoothY = useSpring(targetY, springConfig);

  const activeElementRef = useRef(null);
  const lastPosRef = useRef({ x: -100, y: -100 });
  const cursorModeRef = useRef("default");
  const isScrollingRef = useRef(false);
  const scrollDebounceTimerRef = useRef(null);

  const applyCursorMode = (mode) => {
    if (cursorModeRef.current !== mode) {
      cursorModeRef.current = mode;
      setCursorMode(mode);
    }
  };

  useEffect(() => {
    // Only activate on pointer devices with fine mouse/trackpad control
    if (typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches) {
      setIsTouchDevice(false);
    } else {
      return;
    }

    // Unified target evaluator for any (x, y) coordinates
    const evaluateTargetAtPoint = (clientX, clientY, targetElement = null) => {
      if (clientX < 0 || clientY < 0) return;

      const target =
        targetElement ||
        (typeof document !== "undefined"
          ? document.elementFromPoint(clientX, clientY)
          : null);

      if (!target || !(target instanceof Element)) {
        activeElementRef.current = null;
        targetX.set(clientX);
        targetY.set(clientY);
        applyCursorMode("default");
        return;
      }

      // 1. Check for compact interactive targets (buttons, links, pills)
      const isSummaryOrWide = Boolean(target.closest("summary, details"));
      const interactiveTarget = !isSummaryOrWide
        ? target.closest(
            'button, a, .eyebrow-pill, [role="button"], .cursor-pointer, [data-cursor="magnetic"]'
          )
        : null;

      if (interactiveTarget) {
        const rect = interactiveTarget.getBoundingClientRect();

        // Snap to compact buttons (width <= 320px)
        if (rect.width <= 320 && rect.height <= 85) {
          activeElementRef.current = interactiveTarget;
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Apple elastic magnetic drag
          const magneticPullX = centerX + (clientX - centerX) * 0.22;
          const magneticPullY = centerY + (clientY - centerY) * 0.22;

          targetX.set(magneticPullX);
          targetY.set(magneticPullY);

          const computedStyle = window.getComputedStyle(interactiveTarget);
          const br = parseFloat(computedStyle.borderRadius) || 12;

          setMagneticDimensions({
            width: rect.width + 8,
            height: rect.height + 6,
            borderRadius: Math.min(br + 3, 32),
          });
          applyCursorMode("magnetic");
          return;
        } else {
          // Over wide buttons/links: fluid hover circle that doesn't cover text
          activeElementRef.current = null;
          targetX.set(clientX);
          targetY.set(clientY);
          applyCursorMode("hover");
          return;
        }
      }

      // If over FAQ summary or clickable row, provide subtle hover circle
      if (isSummaryOrWide) {
        activeElementRef.current = null;
        targetX.set(clientX);
        targetY.set(clientY);
        applyCursorMode("hover");
        return;
      }

      // 2. Check for text content zones (words)
      // Must be actual text container, and NOT have cursor: pointer
      const isTextContainer = target.closest("p, h1, h2, h3, h4, h5, h6, blockquote, code, span, li, label, strong, em, b, i");
      const isNotClickable = !target.closest("button, a, [role='button'], summary");

      if (isTextContainer && isNotClickable) {
        const computed = window.getComputedStyle(target);
        if (computed.cursor !== "pointer") {
          activeElementRef.current = null;
          targetX.set(clientX);
          targetY.set(clientY);
          applyCursorMode("text"); // Word/Text I-Beam effect active!
          return;
        }
      }

      // 3. Default free floating state
      activeElementRef.current = null;
      targetX.set(clientX);
      targetY.set(clientY);
      applyCursorMode("default");
    };

    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      lastPosRef.current = { x: clientX, y: clientY };
      directMouseX.set(clientX);
      directMouseY.set(clientY);

      if (!isVisible) setIsVisible(true);

      evaluateTargetAtPoint(clientX, clientY, e.target);
    };

    // Scroll & Wheel handler: throttled to avoid any React re-render spikes during scroll
    const handleScrollOrWheel = () => {
      const { x, y } = lastPosRef.current;
      if (x < 0 || y < 0) return;

      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
        targetX.set(x);
        targetY.set(y);
        activeElementRef.current = null;
        applyCursorMode("default");
      }

      // When scroll settles (after 60ms), re-evaluate what is currently under the pointer
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
      scrollDebounceTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        evaluateTargetAtPoint(x, y);
      }, 60);
    };


    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setCursorMode("default");
      activeElementRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScrollOrWheel, { passive: true });
    window.addEventListener("wheel", handleScrollOrWheel, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Also attach to lenisInstance if available
    let lenisUnsub = null;
    if (lenisInstance && typeof lenisInstance.on === "function") {
      lenisUnsub = lenisInstance.on("scroll", handleScrollOrWheel);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScrollOrWheel);
      window.removeEventListener("wheel", handleScrollOrWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
      if (typeof lenisUnsub === "function") {
        lenisUnsub();
      }
    };
  }, [isVisible, targetX, targetY, directMouseX, directMouseY]);

  if (isTouchDevice) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.2s ease" }}
      aria-hidden="true"
    >
      {/* ── Main Morphing Fluid Capsule (ZERO BLUR to keep text 100% crisp) ── */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform, width, height",
        }}
        animate={{
          width:
            cursorMode === "magnetic"
              ? magneticDimensions.width
              : cursorMode === "hover"
              ? 34
              : cursorMode === "text"
              ? 2.5
              : 18,
          height:
            cursorMode === "magnetic"
              ? magneticDimensions.height
              : cursorMode === "hover"
              ? 34
              : cursorMode === "text"
              ? 22
              : 18,
          borderRadius:
            cursorMode === "magnetic"
              ? `${magneticDimensions.borderRadius}px`
              : cursorMode === "text"
              ? "3px"
              : "9999px",
          scale: isClicking ? 0.9 : 1,
          backgroundColor:
            cursorMode === "magnetic"
              ? "rgba(99, 102, 241, 0.08)" // 100% transparent crystal tint — ZERO blur!
              : cursorMode === "hover"
              ? "rgba(99, 102, 241, 0.12)"
              : cursorMode === "text"
              ? "rgba(79, 70, 229, 0.9)" // Words show effect: Crisp Indigo I-Beam
              : "rgba(35, 33, 30, 0.22)",
          borderColor:
            cursorMode === "magnetic" || cursorMode === "hover"
              ? "rgba(99, 102, 241, 0.35)"
              : "rgba(255, 255, 255, 0.6)",
        }}
        transition={{
          type: "spring",
          stiffness: 440,
          damping: 30,
          mass: 0.35,
        }}
        className="fixed top-0 left-0 border pointer-events-none shadow-xs"
      />

      {/* ── Precision Center Core Dot ── */}
      <motion.div
        style={{
          x: directMouseX,
          y: directMouseY,
          translateX: "-50%",
          translateY: "-50%",
          willChange: "transform",
        }}
        animate={{
          scale: cursorMode === "default" || cursorMode === "hover" ? (isClicking ? 1.4 : 1) : 0,
          opacity: cursorMode === "default" ? 1 : cursorMode === "hover" ? 0.6 : 0,
        }}
        transition={{ duration: 0.12 }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-stone-900/80 pointer-events-none"
      />
    </div>
  );
});

AppleMagneticCursor.displayName = "AppleMagneticCursor";

export default AppleMagneticCursor;
