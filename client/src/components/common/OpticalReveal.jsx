import {
  createContext,
  memo,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * OpticalReveal Component
 * Smooth GPU-Composited Scroll Reveal Animation.
 * Animates opacity and translateY as elements scroll into the viewport,
 * then settles to `transform: none` so iPhone Liquid Glass `backdrop-filter`
 * layers inside remain 100% active and crystal-clear.
 *
 * Performance architecture:
 * - Uses the native Web Animations API (element.animate) for opacity + transform,
 *   which Chrome/Safari/Firefox run entirely on the compositor thread.
 *   → Zero main-thread JS per frame (previously ~30 JS-driven springs at once).
 * - No permanent `will-change` → no layer explosion; the browser only promotes
 *   an element to its own layer while its animation is actually running.
 * - One-shot IntersectionObserver per reveal that disconnects after triggering.
 */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const VIEWPORT_MARGIN = "0px 0px -40px 0px";

const canAnimate = () =>
  typeof window !== "undefined" &&
  typeof Element !== "undefined" &&
  typeof Element.prototype.animate === "function";

/**
 * Plays the reveal animation on an element and clears the hidden inline styles
 * so the element's resting state is its natural CSS (opacity: 1, transform: none).
 */
function playReveal(el, { distance, duration, delay }) {
  if (!el) return;
  // Resting state: clear hidden inline styles first
  el.style.opacity = "";
  el.style.transform = "";

  if (!canAnimate()) return;

  el.animate(
    [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: "translateY(0px)" },
    ],
    {
      duration: duration * 1000,
      delay: delay * 1000,
      easing: EASE,
      // Keep the hidden first keyframe applied during the delay period
      fill: "backwards",
    }
  );
}

function observeOnce(el, onEnter) {
  if (typeof IntersectionObserver === "undefined") {
    onEnter();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect();
          onEnter();
          break;
        }
      }
    },
    { rootMargin: VIEWPORT_MARGIN, threshold: 0 }
  );
  observer.observe(el);
  return () => observer.disconnect();
}

const hiddenStyle = (distance) => ({
  opacity: 0,
  transform: `translateY(${distance}px)`,
});

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
    const Component = as || "div";
    const ref = useRef(null);
    const [revealed, setRevealed] = useState(false);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      return observeOnce(el, () => {
        playReveal(el, { distance, duration, delay });
        setRevealed(true);
      });
      // Reveal parameters are fixed per mount (matches previous `once: true` behavior)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Component
        ref={ref}
        className={className}
        style={revealed ? style : { ...style, ...hiddenStyle(distance) }}
      >
        {children}
      </Component>
    );
  }
);

OpticalReveal.displayName = "OpticalReveal";

/* ── Stagger system ─────────────────────────────────────────────────────── */

const StaggerContext = createContext(null);

/**
 * OpticalStaggerContainer
 * Coordinates sequential, wave-like GPU-accelerated scroll reveals across child items.
 */
export const OpticalStaggerContainer = memo(
  ({ children, delay = 0, stagger = 0.05, className = "", style = {} }) => {
    const ref = useRef(null);
    const itemsRef = useRef([]); // registered in DOM order
    const revealedRef = useRef(false);
    const settingsRef = useRef({ delay, stagger });
    const [revealed, setRevealed] = useState(false);

    useLayoutEffect(() => {
      settingsRef.current = { delay, stagger };
    });

    // Stable registry object shared with items via context
    const [registry] = useState(() => ({
      register(item) {
        itemsRef.current.push(item);
        // Item mounted after the container already revealed → reveal immediately
        if (revealedRef.current) {
          item.reveal(0);
        }
        return () => {
          itemsRef.current = itemsRef.current.filter((i) => i !== item);
        };
      },
      isRevealed: () => revealedRef.current,
    }));

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      return observeOnce(el, () => {
        revealedRef.current = true;
        const { delay: d, stagger: s } = settingsRef.current;

        // Container fades in (matches previous `hidden: { opacity: 0 }` variant)
        el.style.opacity = "";
        if (canAnimate()) {
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 300,
            easing: "ease-out",
          });
        }

        // Children cascade in DOM order
        itemsRef.current.forEach((item, i) => item.reveal(d + i * s));
        setRevealed(true);
      });
    }, []);

    return (
      <StaggerContext.Provider value={registry}>
        <div
          ref={ref}
          className={className}
          style={revealed ? style : { ...style, opacity: 0 }}
        >
          {children}
        </div>
      </StaggerContext.Provider>
    );
  }
);

OpticalStaggerContainer.displayName = "OpticalStaggerContainer";

/**
 * OpticalStaggerItem
 * Individual element inside an OpticalStaggerContainer.
 */
export const OpticalStaggerItem = memo(
  ({ children, distance = 16, duration = 0.5, className = "", style = {} }) => {
    const ref = useRef(null);
    const registry = useContext(StaggerContext);
    // Items mounted after their container already revealed render visible immediately
    const [revealed, setRevealed] = useState(() =>
      registry ? registry.isRevealed() : false
    );
    const doneRef = useRef(false);

    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      doneRef.current = revealed;

      const reveal = (delay) => {
        if (doneRef.current) return;
        doneRef.current = true;
        playReveal(el, { distance, duration, delay });
        setRevealed(true);
      };

      if (registry) {
        return registry.register({ reveal });
      }

      // Used outside a container: behave like a standalone reveal
      return observeOnce(el, () => reveal(0));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={ref}
        className={className}
        style={revealed ? style : { ...style, ...hiddenStyle(distance) }}
      >
        {children}
      </div>
    );
  }
);

OpticalStaggerItem.displayName = "OpticalStaggerItem";

export default OpticalReveal;
