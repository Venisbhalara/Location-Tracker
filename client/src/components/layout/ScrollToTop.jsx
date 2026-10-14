import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetLenisScroll, lenisInstance } from "../../hooks/useLenis";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

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

    // 2. Default route navigation: reset scroll to top immediately
    resetLenisScroll({ immediate: true });

    // 3. Allow DOM to settle and synchronize Lenis boundary limits
    const rafId = requestAnimationFrame(() => {
      lenisInstance?.resize();
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
