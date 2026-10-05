import React, { memo, useEffect, useRef } from "react";

/**
 * Connected Nodes & Satellite Constellation Canvas
 * High-performance 60FPS particle mesh with GPS satellite telemetry pulses,
 * dynamic distance connections, and gentle cursor interactivity.
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

    // Retina / High-DPI support
    const updateDimensions = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    // Responsive particle count: ensures silky smooth 60fps on mobile & high-end screens
    const getParticleCount = () => {
      if (width < 640) return 30; // Mobile
      if (width < 1024) return 50; // Tablet
      return 75; // Desktop
    };

    const particleCount = getParticleCount();
    const maxConnectionDistance = width < 768 ? 100 : 135;

    // Mouse telemetry tracking
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      radius: 140,
    };

    // Generate Particles
    const particles = [];
    const colors = [
      { r: 99, g: 102, b: 241 }, // Indigo
      { r: 56, g: 189, b: 248 }, // Sky / Cyan
      { r: 168, g: 85, b: 247 }, // Purple
      { r: 45, g: 212, b: 191 }, // Teal
    ];

    for (let i = 0; i < particleCount; i++) {
      // 1 in ~8 nodes is designated as an active GPS Satellite node
      const isSatellite = i % 8 === 0;
      const color = colors[i % colors.length];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: isSatellite ? 2.8 : Math.random() * 1.4 + 1.2,
        baseAlpha: isSatellite ? 0.85 : Math.random() * 0.35 + 0.3,
        alpha: isSatellite ? 0.85 : Math.random() * 0.35 + 0.3,
        color,
        isSatellite,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        // Satellite specific properties
        pingRadius: 0,
        pingMaxRadius: 55 + Math.random() * 25,
        pingActive: isSatellite && Math.random() > 0.5,
        pingCooldown: Math.floor(Math.random() * 200) + 100,
        orbitAngle: Math.random() * Math.PI * 2,
      });
    }

    // Event listeners
    const handleResize = () => {
      updateDimensions();
    };

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
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animation Loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinate interpolation
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      // ── 1. Update and Draw Particle Positions ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Soft screen edge bounce/wrapping
        if (p.x < -15) p.x = width + 15;
        else if (p.x > width + 15) p.x = -15;
        if (p.y < -15) p.y = height + 15;
        else if (p.y > height + 15) p.y = -15;

        // Gentle breathing pulsation
        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase);
        const currentAlpha = p.baseAlpha + pulse * 0.18;

        // Mouse gentle repel / attraction effect
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 0.025;
            p.x += dx * force;
            p.y += dy * force;
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();

        // ── 2. Special GPS Satellite Telemetry Visuals ──
        if (p.isSatellite) {
          p.orbitAngle += 0.015;

          // Tiny satellite orbital ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.08, currentAlpha * 0.35)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();

          // Satellite micro beacon dot on orbit
          const satOrbX = p.x + Math.cos(p.orbitAngle) * 7.5;
          const satOrbY = p.y + Math.sin(p.orbitAngle) * 7.5;
          ctx.beginPath();
          ctx.arc(satOrbX, satOrbY, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.9})`;
          ctx.fill();

          // Radar telemetry ping cycle
          if (!p.pingActive) {
            p.pingCooldown--;
            if (p.pingCooldown <= 0) {
              p.pingActive = true;
              p.pingRadius = 2;
              p.pingCooldown = Math.floor(Math.random() * 260) + 160;
            }
          } else {
            p.pingRadius += 0.7;
            const progress = p.pingRadius / p.pingMaxRadius;
            const pingAlpha = (1 - progress) * 0.45;

            if (progress >= 1) {
              p.pingActive = false;
            } else {
              // Radiating sonar ripple wave
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.pingRadius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(56, 189, 248, ${pingAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      }

      // ── 3. Constellation Connections (Lines between nearby nodes) ──
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Connect with other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectionDistance) {
            const lineAlpha = (1 - dist / maxConnectionDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect with user cursor if active & nearby
        if (mouse.active) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const cursorLineAlpha = (1 - dist / mouse.radius) * 0.32;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${cursorLineAlpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // ── 4. Interactive Cursor Crosshair / Reticle ──
      if (mouse.active && mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

let globalAmbientMounted = false;

/**
 * Reusable ambient background layer.
 * Combines:
 * 1. Deep cosmic gradient base & subtle cyber grid
 * 2. Breathing aurora orbs (Indigo & Cyan)
 * 3. 60FPS Connected Nodes & Satellite Constellation Canvas
 *
 * Synchronous singleton protected: only 1 instance ever mounts into the DOM.
 */
const AmbientBackground = memo(() => {
  const isPrimary = useRef(false);

  if (!globalAmbientMounted) {
    globalAmbientMounted = true;
    isPrimary.current = true;
  }

  useEffect(() => {
    return () => {
      if (isPrimary.current) {
        globalAmbientMounted = false;
      }
    };
  }, []);

  if (!isPrimary.current) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none -z-10 bg-[#070710]"
      aria-hidden="true"
    >
      {/* Subtle fine cyber grid texture */}
      <div className="absolute inset-0 bg-ambient-pattern opacity-40" />

      {/* Gentle top focal radial glow (Indigo/Violet) */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[480px] rounded-full opacity-20 blur-[130px] animate-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 80%)",
          animationDuration: "9s",
        }}
      />

      {/* Subtle secondary ambient fill in bottom right (Cyan/Sky) */}
      <div
        className="absolute -bottom-40 right-[10%] w-[600px] h-[420px] rounded-full opacity-15 blur-[140px] animate-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)",
          animationDuration: "12s",
        }}
      />

      {/* 🌐 Live Connected Nodes & Satellite Constellation Canvas */}
      <ConstellationCanvas />
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";

export default AmbientBackground;
