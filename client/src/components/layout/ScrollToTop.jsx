import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { resetLenisScroll, lenisInstance } from "../../hooks/useLenis";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    // 1. If URL has an anchor hash (#how-it-works, #faq, etc.), scroll to target
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        if (lenisInstance) {
          lenisInstance.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
    }

    // On initial mount / refresh: do NOT force a jump if already on page, allow browser & Lenis to initialize smoothly
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      const rafId = requestAnimationFrame(() => {
        lenisInstance?.resize();
      });
      return () => cancelAnimationFrame(rafId);
    }

    // 2. Only reset scroll on actual route navigation
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      resetLenisScroll({ immediate: true });
    }

    // 3. Allow DOM to settle and synchronize Lenis boundary limits
    const rafId = requestAnimationFrame(() => {
      lenisInstance?.resize();
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
