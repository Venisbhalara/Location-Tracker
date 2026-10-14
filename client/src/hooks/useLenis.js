import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance = null;
const scrollListeners = new Set();

/**
 * Register a scroll callback with the centralized Lenis dispatcher.
 * Handles child-component mount race conditions reliably without timeouts.
 */
export function subscribeLenisScroll(callback) {
  scrollListeners.add(callback);
  return () => {
    scrollListeners.delete(callback);
  };
}

/**
 * Reset scroll position smoothly or immediately (used during route navigation).
 */
export function resetLenisScroll(options = { immediate: true }) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, options);
  } else if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
}

export function useLenis() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. High-performance, single-instance Lenis controller
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      autoRaf: true,
    });

    lenisInstance = lenis;

    // Synchronize initial scroll position cleanly only if restored
    if (typeof window !== 'undefined' && window.scrollY > 0) {
      lenis.scrollTo(window.scrollY, { immediate: true });
    }

    const handleLoad = () => {
      lenis.resize();
    };
    window.addEventListener('load', handleLoad, { once: true });

    // 3. Single centralized scroll event dispatcher for all registered subscribers
    const unsubLenis = lenis.on('scroll', (e) => {
      scrollListeners.forEach((callback) => {
        try {
          callback(e);
        } catch (err) {
          console.error('[Lenis] Listener error:', err);
        }
      });
    });

    return () => {
      window.removeEventListener('load', handleLoad);
      unsubLenis();
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export { lenisInstance };

