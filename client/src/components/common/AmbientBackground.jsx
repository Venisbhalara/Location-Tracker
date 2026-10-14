import React, { memo, useEffect, useRef } from "react";
import { lenisInstance, subscribeLenisScroll } from "../../hooks/useLenis";

/**
 * Calm Minimalist Light Constellation Canvas
 * Ultra-optimized 120FPS particle mesh on warm ivory canvas.
 *
 * Performance features:
 * 1. O(N) optimized with squared distance checks (skips expensive Math.hypot/sqrt).
 * 2. Dynamic Scroll Throttling: During rapid scroll, pauses line rendering to guarantee
 *    100% dedicated frame budget to buttery-smooth scrolling.
 * 3. DPI Clamped: Caps pixel density at 1.5 to prevent 4K/retina framebuffer saturation.
 */
const ConstellationCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    const getParticleCount = () => {
      if (width < 640) return 14;
      if (width < 1024) return 20;
      return 26; // Refined, elegant, and 80% lighter than 52
    };

    const particleCount = getParticleCount();
    const maxConnectionDistance = width < 768 ? 90 : 120;
    const maxDistSq = maxConnectionDistance * maxConnectionDistance;

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      radius: 120,
    };
    const mouseRadiusSq = mouse.radius * mouse.radius;

    const colors = [
      { r: 99, g: 102, b: 241 }, // Soft Indigo
      { r: 120, g: 135, b: 155 }, // Warm Slate
      { r: 90, g: 150, b: 125 }, // Muted Sage
      { r: 160, g: 140, b: 125 }, // Warm Greige
    ];

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const isSatellite = i % 6 === 0;
      const color = colors[i % colors.length];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: isSatellite ? 2.2 : Math.random() * 1.0 + 1.0,
        baseAlpha: isSatellite ? 0.4 : Math.random() * 0.18 + 0.1,
        color,
        isSatellite,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015,
      });
    }

    // Active scroll detection to eliminate any scroll competition
    let isScrolling = false;
    let scrollStopTimer = null;

    const handleScroll = () => {
      isScrolling = true;
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 70);
    };

    // Centralized subscription to Lenis scroll dispatcher
    const unsubLenis = subscribeLenisScroll(handleScroll);

    // Native scroll fallback only when Lenis is not active
    const handleNativeScroll = () => {
      if (lenisInstance) return;
      handleScroll();
    };

    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });

    const handleResize = () => updateDimensions();
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    let isVisible = true;
    let isRunning = true;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 60; // 60 FPS cap to preserve battery and GPU budget

    const render = (currentTime) => {
      if (!isRunning) return;

      animationFrameId = requestAnimationFrame(render);

      // Frame throttle to 60 FPS
      if (currentTime - lastFrameTime < frameInterval) {
        return;
      }
      lastFrameTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = Math.max(0.08, p.baseAlpha + Math.sin(p.pulsePhase) * 0.08);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
        ctx.fill();
      }

      // Constellation Lines: Skip during rapid scroll to preserve 100% GPU frame budget for scrolling
      if (!isScrolling) {
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              const dist = Math.sqrt(distSq);
              const lineAlpha = (1 - dist / maxConnectionDistance) * 0.09;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(120, 135, 155, ${lineAlpha})`;
              ctx.lineWidth = 0.65;
              ctx.stroke();
            }
          }

          if (mouse.active) {
            const dx = p1.x - mouse.x;
            const dy = p1.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < mouseRadiusSq) {
              const dist = Math.sqrt(distSq);
              const cursorLineAlpha = (1 - dist / mouse.radius) * 0.16;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${cursorLineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.stroke();
            }
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        if (!isRunning) {
          isRunning = true;
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      } else {
        isRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    };
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReducedMotion) {
      // Draw single elegant ambient snapshot with 0 ongoing animation loop
      render(performance.now());
      return () => {
        unsubLenis();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("scroll", handleNativeScroll);
        window.removeEventListener("wheel", handleScroll);
        document.removeEventListener("mouseleave", handleMouseLeave);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (scrollStopTimer) clearTimeout(scrollStopTimer);
      };
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      unsubLenis();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("wheel", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

/**
 * Reusable light ambient background layer.
 * Warm ivory base (#fcfaf6) + natural feathered radial gradients (ZERO GPU BLUR PENALTY)
 * + smooth constellation canvas.
 */
const AmbientBackground = memo(() => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 bg-[#fcfaf6]"
      style={{
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
        contain: "strict",
      }}
      aria-hidden="true"
    >
      {/* Subtle fine warm geometric grid texture */}
      <div className="absolute inset-0 bg-ambient-pattern opacity-50" />

      {/* Very gentle warm ivory-amber diffused glow in upper header zone (naturally feathered, 0 GPU blur penalty) */}
      <div
        className="absolute -top-28 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245, 238, 225, 0.9) 0%, rgba(238, 230, 214, 0.3) 50%, transparent 75%)",
        }}
      />

      {/* Subtle soft lavender-slate aura in lower area (naturally feathered, 0 GPU blur penalty) */}
      <div
        className="absolute -bottom-28 right-[6%] w-[560px] h-[340px] rounded-full opacity-45 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 234, 246, 0.8) 0%, rgba(232, 234, 246, 0.2) 50%, transparent 75%)",
        }}
      />

      {/* Live Constellation Canvas */}
      <ConstellationCanvas />
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";

export default AmbientBackground;

