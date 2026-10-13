import { useEffect } from 'react'
import Lenis from 'lenis'

let lenisInstance = null

export function useLenis() {
  useEffect(() => {
    // 1. Ensure browser does not fight Lenis scroll position on page refresh
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // 2. High-performance, instant-response Lenis instance
    // Uses Apple-grade exponential deceleration curve:
    // Moves INSTANTLY on first touch/wheel notch (zero lag), then coasts with velvety softness
    const lenis = new Lenis({
      duration: 0.85, // Snappy response, prevents floaty/delayed feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // 100% native instant 1:1 on touch/trackpad
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      autoRaf: false,
    })

    lenisInstance = lenis

    // Synchronize immediate scroll position with current viewport
    if (typeof window !== 'undefined') {
      lenis.scrollTo(window.scrollY, { immediate: true })
    }

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}

export { lenisInstance }

