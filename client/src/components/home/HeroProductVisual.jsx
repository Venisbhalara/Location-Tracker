import { useState, useEffect, useLayoutEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Navigation,
  Crosshair,
  ShieldCheck,
  Wifi,
  BatteryCharging,
  Radio,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Smartphone,
  Lock,
} from "lucide-react";

/**
 * Waypoints in unified 1000x460 coordinate space.
 * Because the SVG uses viewBox="0 0 1000 460" with preserveAspectRatio="none",
 * any point (X, Y) maps by exact affine projection to CSS (X / 10)%, (Y / 4.6)%.
 */
const ROUTE_WAYPOINTS = [
  {
    x: 220,
    y: 320,
    street: "Montgomery Blvd & 2nd St",
    coords: "37.7874° N, 122.4035° W",
    speed: "21.8",
  },
  {
    x: 350,
    y: 320,
    street: "Montgomery Crossway",
    coords: "37.7881° N, 122.4027° W",
    speed: "19.6",
  },
  {
    x: 350,
    y: 210,
    street: "Market Avenue South",
    coords: "37.7887° N, 122.4020° W",
    speed: "24.2",
  },
  {
    x: 510,
    y: 210,
    street: "452 Market St, Financial District",
    coords: "37.7891° N, 122.4014° W",
    speed: "22.4",
  },
  {
    x: 510,
    y: 125,
    street: "Embarcadero North Plaza",
    coords: "37.7898° N, 122.4006° W",
    speed: "20.9",
  },
  {
    x: 630,
    y: 125,
    street: "Bayfront Transit Promenade",
    coords: "37.7904° N, 122.3998° W",
    speed: "23.5",
  },
];

// Precompute segment Euclidean lengths and headings for zero-allocation rAF loop
const SEGMENTS = [];
let TOTAL_ROUTE_LENGTH = 0;

for (let i = 0; i < ROUTE_WAYPOINTS.length - 1; i++) {
  const a = ROUTE_WAYPOINTS[i];
  const b = ROUTE_WAYPOINTS[i + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  // Navigation icon base orientation is +45deg; atan2(dy, dx) in degrees + 90deg gives north-up heading
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 45;
  SEGMENTS.push({
    startIdx: i,
    endIdx: i + 1,
    ax: a.x,
    ay: a.y,
    bx: b.x,
    by: b.y,
    length,
    cumStart: TOTAL_ROUTE_LENGTH,
    angleDeg,
  });
  TOTAL_ROUTE_LENGTH += length;
}

/**
 * Shortest-arc angular interpolation in degrees
 */
function lerpAngleDeg(a, b, t) {
  const diff = ((((b - a) % 360) + 540) % 360) - 180;
  return a + diff * t;
}

/**
 * Static Cartography SVG Map Layer (1000x460 Affine Coordinate Space)
 * Fully memoized to prevent re-rendering during telemetry updates.
 */
const StaticCartoMap = memo(({ hasGrantedConsent }) => (
  <svg
    viewBox="0 0 1000 460"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full opacity-95 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="cartoGrid"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="rgba(43, 42, 39, 0.035)"
          strokeWidth="1"
        />
      </pattern>

      <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>

      <linearGradient id="handshakeArcGrad" x1="100%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
      </linearGradient>
    </defs>

    <rect width="1000" height="460" fill="url(#cartoGrid)" />

    {/* Architectural Waterway / River Contour */}
    <path
      d="M -40,260 C 180,220 340,340 620,280 C 820,240 920,330 1050,290"
      fill="none"
      stroke="rgba(14, 165, 233, 0.14)"
      strokeWidth="48"
      strokeLinecap="round"
    />
    <path
      d="M -40,260 C 180,220 340,340 620,280 C 820,240 920,330 1050,290"
      fill="none"
      stroke="rgba(14, 165, 233, 0.26)"
      strokeWidth="12"
      strokeLinecap="round"
    />

    {/* Primary Arterial Avenues (Aligned with Waypoints) */}
    <path d="M -20,125 L 1020,125" stroke="rgba(43, 42, 39, 0.075)" strokeWidth="14" />
    <path d="M -20,210 L 1020,210" stroke="rgba(43, 42, 39, 0.085)" strokeWidth="16" />
    <path d="M -20,320 L 1020,320" stroke="rgba(43, 42, 39, 0.075)" strokeWidth="14" />

    <path d="M 220,-20 L 220,480" stroke="rgba(43, 42, 39, 0.07)" strokeWidth="13" />
    <path d="M 350,-20 L 350,480" stroke="rgba(43, 42, 39, 0.08)" strokeWidth="15" />
    <path d="M 510,-20 L 510,480" stroke="rgba(43, 42, 39, 0.085)" strokeWidth="16" />
    <path d="M 630,-20 L 630,480" stroke="rgba(43, 42, 39, 0.065)" strokeWidth="12" />
    <path d="M 790,-20 L 790,480" stroke="rgba(43, 42, 39, 0.06)" strokeWidth="10" />

    {/* Secondary Cross Streets */}
    <path d="M -20,60 L 1020,60" stroke="rgba(43, 42, 39, 0.035)" strokeWidth="6" />
    <path d="M -20,400 L 1020,400" stroke="rgba(43, 42, 39, 0.035)" strokeWidth="6" />
    <path d="M 100,-20 L 100,480" stroke="rgba(43, 42, 39, 0.035)" strokeWidth="6" />

    {/* Architectural City Blocks */}
    <rect x="240" y="140" width="90" height="52" rx="4" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="370" y="140" width="120" height="52" rx="4" fill="rgba(43, 42, 39, 0.035)" />
    <rect x="240" y="230" width="90" height="70" rx="4" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="370" y="230" width="120" height="70" rx="4" fill="rgba(43, 42, 39, 0.028)" />
    <rect x="530" y="140" width="82" height="52" rx="4" fill="rgba(43, 42, 39, 0.032)" />
    <rect x="530" y="55" width="82" height="52" rx="4" fill="rgba(43, 42, 39, 0.028)" />

    {/* Street Typography Labels */}
    <text
      x="115"
      y="310"
      fill="#a8a29e"
      fontSize="9"
      fontFamily="sans-serif"
      fontWeight="600"
      letterSpacing="0.06em"
    >
      MONTGOMERY BLVD
    </text>
    <text
      x="368"
      y="200"
      fill="#a8a29e"
      fontSize="9"
      fontFamily="sans-serif"
      fontWeight="600"
      letterSpacing="0.06em"
    >
      MARKET AVENUE
    </text>
    <text
      x="524"
      y="116"
      fill="#a8a29e"
      fontSize="9"
      fontFamily="sans-serif"
      fontWeight="600"
      letterSpacing="0.06em"
    >
      EMBARCADERO PLAZA
    </text>

    {/* Full Active Geodesic Route Glow */}
    <path
      d="M 220,320 L 350,320 L 350,210 L 510,210 L 510,125 L 630,125"
      fill="none"
      stroke="#6366f1"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.22"
    />

    {/* Animated Telemetry Packet Trail */}
    <path
      d="M 220,320 L 350,320 L 350,210 L 510,210 L 510,125 L 630,125"
      fill="none"
      stroke="url(#routeGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="10 5"
      className="animate-gps-flow"
    />

    {/* Cryptographic Consent Handshake Arc (Fires when 1-Tap Consent is active) */}
    {hasGrantedConsent && (
      <g>
        <path
          d="M 810,330 Q 650,65 510,210"
          fill="none"
          stroke="url(#handshakeArcGrad)"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          className="animate-packet-stream"
        />
        <circle cx="810" cy="330" r="5" fill="#10b981" opacity="0.75" />
      </g>
    )}

    {/* Waypoint Nodes */}
    {ROUTE_WAYPOINTS.map((wp, idx) => (
      <circle
        key={idx}
        cx={wp.x}
        cy={wp.y}
        r={idx === 0 || idx === ROUTE_WAYPOINTS.length - 1 ? "4.5" : "3.2"}
        fill={idx === ROUTE_WAYPOINTS.length - 1 ? "#10b981" : "#4f46e5"}
        stroke="#ffffff"
        strokeWidth="1.8"
      />
    ))}
  </svg>
));

StaticCartoMap.displayName = "StaticCartoMap";

/**
 * 3-Step Journey Bar
 */
const JourneyStepBar = memo(({ activeStep }) => (
  <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/60 bg-white/25 border-t border-white/65 text-center text-xs overflow-hidden">
    <div
      className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent pointer-events-none animate-beam-travel"
      aria-hidden="true"
    />

    <div
      className={`p-3 sm:p-3.5 flex items-center justify-center gap-2 transition-colors ${
        activeStep === 1 ? "bg-indigo-50/50" : ""
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
        1
      </span>
      <span className="text-stone-700">Generate encrypted tracking link</span>
    </div>

    <div
      className={`p-3 sm:p-3.5 flex items-center justify-center gap-2 transition-colors ${
        activeStep === 2 ? "bg-indigo-50/50 font-medium" : ""
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
        2
      </span>
      <span className="text-stone-700">Recipient taps "Allow" in browser</span>
    </div>

    <div
      className={`p-3 sm:p-3.5 flex items-center justify-center gap-2 transition-colors ${
        activeStep === 3 ? "bg-emerald-50/60 font-semibold" : ""
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
        3
      </span>
      <span className="text-stone-800 flex items-center gap-1">
        <span>Live GPS streams to map in &lt;1s</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </span>
    </div>
  </div>
));

JourneyStepBar.displayName = "JourneyStepBar";

/**
 * HeroProductVisual Component — Mathematical Kinematics & Zero-Lag Telemetry Edition
 */
const HeroProductVisual = () => {
  const [hasGrantedConsent, setHasGrantedConsent] = useState(false);
  const [waypointIdx, setWaypointIdx] = useState(3);
  const [pingLatency, setPingLatency] = useState(0.4);
  const [activeStep, setActiveStep] = useState(2);
  const [isRecenterTriggered, setIsRecenterTriggered] = useState(false);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const radarNodeRef = useRef(null);
  const beaconNodeRef = useRef(null);
  const navArrowRef = useRef(null);
  const recenterTimeoutRef = useRef(null);
  const activeWaypointRef = useRef(3);

  const currentWaypoint = ROUTE_WAYPOINTS[waypointIdx] || ROUTE_WAYPOINTS[3];

  // Zero-React-Re-Render 60FPS Parametric Kinematics Engine
  // GPU-composited: the beacon & radar are moved with translate3d (no layout),
  // and the loop automatically pauses when off-screen or when the tab is hidden.
  useLayoutEffect(() => {
    let rafId = null;
    let isVisible = !document.hidden;
    let isInView = true;
    let lastFrameTime = 0;
    let accumulatedTimeMs = 11500; // Start near waypoint 3 (452 Market St)
    let prevTimestamp = performance.now();
    let currentAngle = 45;

    // Cached map viewport size (CSS px) — read once per resize, never per frame
    let mapW = 0;
    let mapH = 0;
    let lastX = ROUTE_WAYPOINTS[3].x;
    let lastY = ROUTE_WAYPOINTS[3].y;

    const frameInterval = 1000 / 60; // Cap at 60Hz for battery & thermal efficiency
    const cycleDurationMs = 22000; // Full smooth round-trip kinematics cycle

    // Exact affine projection of the 1000x460 viewBox (preserveAspectRatio="none")
    // into CSS pixels: identical to the previous (x / 10)%, (y / 4.6)% mapping.
    const applyPosition = (x, y) => {
      lastX = x;
      lastY = y;
      if (!mapW || !mapH) return;
      const t = `translate3d(${((x / 1000) * mapW).toFixed(2)}px, ${((y / 460) * mapH).toFixed(2)}px, 0)`;
      if (beaconNodeRef.current) beaconNodeRef.current.style.transform = t;
      if (radarNodeRef.current) radarNodeRef.current.style.transform = t;
    };

    const measure = () => {
      const el = mapRef.current;
      if (!el) return;
      mapW = el.clientWidth;
      mapH = el.clientHeight;
      applyPosition(lastX, lastY);
    };

    const tick = (now) => {
      if (!isVisible || !isInView) {
        rafId = null;
        return;
      }

      rafId = requestAnimationFrame(tick);

      const dt = Math.min(64, now - prevTimestamp);
      prevTimestamp = now;

      // 1ms tolerance: rAF timestamps jitter around 16.67ms on 60Hz screens; a strict
      // comparison skips every other frame (visible 30fps stutter).
      if (now - lastFrameTime < frameInterval - 1) return;
      lastFrameTime = now;

      accumulatedTimeMs = (accumulatedTimeMs + dt) % cycleDurationMs;

      // Ping-pong normalized parameter u in [0, 1] with smooth sinusoidal turnaround at endpoints
      const rawPhase = (accumulatedTimeMs / cycleDurationMs) * 2;
      const forward = rawPhase <= 1;
      const linearT = forward ? rawPhase : 2 - rawPhase;
      // Smoothstep easing at route endpoints: s(t) = t^2 * (3 - 2t)
      const easedRouteT = linearT * linearT * (3 - 2 * linearT);
      const targetDist = easedRouteT * TOTAL_ROUTE_LENGTH;

      // Locate active street segment via precomputed cumulative arc length
      let activeSeg = SEGMENTS[0];
      for (let i = 0; i < SEGMENTS.length; i++) {
        const s = SEGMENTS[i];
        if (targetDist >= s.cumStart && targetDist <= s.cumStart + s.length) {
          activeSeg = s;
          break;
        }
      }

      const localU =
        activeSeg.length > 0
          ? (targetDist - activeSeg.cumStart) / activeSeg.length
          : 0;

      // Subtle corner deceleration using local smoothstep blend (70% linear + 30% Hermite)
      const hermiteU = localU * localU * (3 - 2 * localU);
      const blendedU = localU * 0.7 + hermiteU * 0.3;

      const x = activeSeg.ax + (activeSeg.bx - activeSeg.ax) * blendedU;
      const y = activeSeg.ay + (activeSeg.by - activeSeg.ay) * blendedU;

      // Exact affine transformation to CSS pixel coordinates (GPU transform)
      applyPosition(x, y);

      // Smoothly bank navigation arrow heading angle
      const desiredAngle = forward
        ? activeSeg.angleDeg
        : (activeSeg.angleDeg + 180) % 360;
      currentAngle = lerpAngleDeg(currentAngle, desiredAngle, 0.14);

      if (navArrowRef.current) {
        navArrowRef.current.style.transform = `rotate(${currentAngle.toFixed(1)}deg) translateY(-1px)`;
      }

      // Only update React HUD state when crossing into a new street waypoint (~every 3.5s)
      const nearestWpIdx =
        localU < 0.5 ? activeSeg.startIdx : activeSeg.endIdx;
      if (nearestWpIdx !== activeWaypointRef.current) {
        activeWaypointRef.current = nearestWpIdx;
        setWaypointIdx(nearestWpIdx);
        setPingLatency(nearestWpIdx % 2 === 0 ? 0.3 : 0.4);
      }
    };

    const startLoop = () => {
      if (!rafId && isVisible && isInView) {
        prevTimestamp = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && isInView) startLoop();
      else stopLoop();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // Initial placement + exact pixel mapping on resize. ResizeObserver delivers its
    // first callback after layout and before paint, so the beacon is placed before
    // the first frame without forcing a synchronous layout during React's commit.
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined" && mapRef.current) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(mapRef.current);
    } else {
      measure();
    }

    let observer = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInView = entry.isIntersecting;
          if (isInView && isVisible) startLoop();
          else stopLoop();
        },
        { rootMargin: "80px" }
      );
      observer.observe(containerRef.current);
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const handleConsentClick = useCallback(() => {
    setHasGrantedConsent(true);
    setActiveStep(3);
  }, []);

  const handleReset = useCallback((e) => {
    e.stopPropagation();
    setHasGrantedConsent(false);
    setActiveStep(2);
  }, []);

  const triggerRecenter = useCallback(() => {
    setIsRecenterTriggered(true);
    if (recenterTimeoutRef.current) clearTimeout(recenterTimeoutRef.current);
    recenterTimeoutRef.current = setTimeout(
      () => setIsRecenterTriggered(false),
      800
    );
  }, []);

  useEffect(() => {
    return () => {
      if (recenterTimeoutRef.current) clearTimeout(recenterTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto mt-8 sm:mt-12 mb-14 lg:mb-20 select-none"
    >
      {/* Dynamic Ambient Luxury Glow behind the frame */}
      <div
        className="absolute -inset-1.5 bg-gradient-to-r from-indigo-200/35 via-emerald-100/25 to-amber-100/35 rounded-3xl blur-lg opacity-70 pointer-events-none"
        style={{ contain: "paint" }}
      />

      {/* Main Container — Desktop Live Map Window Chrome (Pure iPhone Glass) */}
      <div className="glass-content-container rounded-3xl overflow-hidden">
        {/* ── Browser Window Chrome Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/65 bg-white/25">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block shadow-2xs" />
            <span className="hidden sm:inline-block text-[11px] font-semibold text-stone-600 ml-2 tracking-tight">
              NexTrack Telemetry Console
            </span>
          </div>

          {/* Secure URL Bar with SSL indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/55 border border-white/85 text-xs font-mono text-stone-700 max-w-sm w-full mx-4 justify-center shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-stone-800 font-medium truncate">
              nextrack.app/live/alex-travel-session
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30 font-sans font-bold flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              256-bit TLS
            </span>
          </div>

          {/* Live Stream Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono tracking-tight tabular-nums">
                LIVE GPS · {pingLatency}s
              </span>
            </div>
          </div>
        </div>

        {/* ── MAP CANVAS & HUD GRID ── */}
        <div
          ref={mapRef}
          className="relative h-[360px] sm:h-[430px] lg:h-[460px] w-full overflow-hidden bg-white/15"
        >
          {/* Memoized cartography grid & route vectors */}
          <StaticCartoMap hasGrantedConsent={hasGrantedConsent} />

          {/* Concentric Sonar Range Rings & 360° Polar Radar Sweep (Locked to Moving Target) */}
          <div
            ref={radarNodeRef}
            className="absolute left-0 top-0 pointer-events-none"
            style={{
              width: "300px",
              height: "300px",
              marginLeft: "-150px",
              marginTop: "-150px",
              willChange: "transform",
            }}
          >
            <div className="absolute inset-[30%] rounded-full border border-indigo-400/25 border-dashed" />
            <span className="absolute top-[31%] left-1/2 -translate-x-1/2 text-[8px] font-mono text-indigo-400 font-semibold bg-[#fbf9f4]/80 px-1 rounded">
              100m
            </span>

            <div className="absolute inset-[15%] rounded-full border border-indigo-300/30" />
            <span className="absolute top-[16%] left-1/2 -translate-x-1/2 text-[8px] font-mono text-indigo-400 font-semibold bg-[#fbf9f4]/80 px-1 rounded">
              250m
            </span>

            <div className="absolute inset-0 rounded-full border border-indigo-200/40" />
            <span className="absolute top-[2%] left-1/2 -translate-x-1/2 text-[8px] font-mono text-indigo-400 font-semibold bg-[#fbf9f4]/80 px-1 rounded">
              500m
            </span>

            <div
              className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
              style={{
                willChange: "transform",
                transform: "translate3d(0, 0, 0)",
                background: hasGrantedConsent
                  ? "conic-gradient(from 0deg, transparent 0deg, transparent 305deg, rgba(16, 185, 129, 0.08) 330deg, rgba(16, 185, 129, 0.32) 360deg)"
                  : "conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(99, 102, 241, 0.08) 330deg, rgba(99, 102, 241, 0.32) 360deg)",
              }}
            />

            <div
              className={`absolute inset-[38%] rounded-full border-2 animate-sonar-pulse ${
                hasGrantedConsent
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-indigo-500/50 bg-indigo-500/10"
              }`}
            />
          </div>

          {/* ── ACTIVE KINEMATIC GPS TARGET BEACON & CALLOUT ── */}
          {/* GPU positioner (translate3d set by the kinematics loop) */}
          <div
            ref={beaconNodeRef}
            className="absolute left-0 top-0 z-20"
            style={{ willChange: "transform" }}
          >
          <div
            className={`w-max -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-transform duration-500 ${
              isRecenterTriggered ? "scale-115" : "scale-100"
            }`}
          >
            {/* Popover Callout */}
            <div className="-mt-14 mb-2 px-3 py-1.5 rounded-xl bg-white/95 border border-stone-200/90 shadow-xl flex items-center gap-2.5 whitespace-nowrap">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight flex items-center gap-1.5">
                  <span>Alex (Target Phone)</span>
                  <span
                    className={`text-[9px] font-semibold font-mono px-1.5 py-0.2 rounded border ${
                      hasGrantedConsent
                        ? "text-emerald-800 bg-emerald-50 border-emerald-300"
                        : "text-indigo-700 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    {hasGrantedConsent ? "CONSENT LOCKED" : "STREAMING"}
                  </span>
                </p>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5 flex items-center gap-1 tabular-nums">
                  <span>{currentWaypoint.street.split(",")[0]}</span>
                  <span>·</span>
                  <span className="text-indigo-600 font-semibold">
                    {currentWaypoint.speed} km/h
                  </span>
                  <span>·</span>
                  <span>±3.2m</span>
                </p>
              </div>
            </div>

            {/* Active Pin Head with Dynamic Heading Vector */}
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute w-10 h-10 rounded-full animate-ping ${
                  hasGrantedConsent ? "bg-emerald-400/30" : "bg-indigo-400/25"
                }`}
              />
              <div
                className={`relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 transition-colors duration-300 ${
                  hasGrantedConsent
                    ? "bg-gradient-to-tr from-emerald-700 to-emerald-500 ring-emerald-200/70"
                    : "bg-gradient-to-tr from-indigo-700 to-indigo-500 ring-indigo-200/70"
                }`}
              >
                <span
                  ref={navArrowRef}
                  className="inline-flex items-center justify-center"
                  style={{ transform: "rotate(45deg)" }}
                >
                  <Navigation className="w-4 h-4 fill-white" />
                </span>
              </div>
              <div className="absolute -bottom-1 w-3 h-1 bg-stone-900/30 rounded-full" />
            </div>
          </div>
          </div>

          {/* ── HUD OVERLAY 1: Top-Left Target Telemetry Box ── */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-auto sm:w-[248px]">
            {/* Mobile compact pill */}
            <div className="sm:hidden bg-white px-3 py-1.5 border border-stone-200 shadow-sm rounded-xl flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-stone-900 text-[11px] tabular-nums">
                Alex · {currentWaypoint.speed} km/h
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                ±3.2m · 88%
              </span>
            </div>

            {/* Desktop / Tablet expanded telemetry box */}
            <div className="hidden sm:block bg-white/55 backdrop-blur-xl p-3.5 border border-white/85 shadow-xl shadow-stone-900/5 rounded-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/60">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
                    Device Stream
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                    <span>Battery</span>
                  </span>
                  <span className="text-stone-900 font-semibold font-mono">
                    88% ⚡
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Satellites</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-900 font-medium font-mono text-[11px]">
                      9 locked
                    </span>
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-1 h-1.5 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-2 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-2.5 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-3 bg-emerald-500 rounded-2xs" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>Ground Velocity</span>
                  <span className="text-indigo-700 font-bold font-mono tabular-nums bg-indigo-500/15 px-1.5 py-0.2 rounded border border-indigo-500/30">
                    {currentWaypoint.speed} km/h
                  </span>
                </div>

                <div className="flex justify-between items-center text-stone-600">
                  <span>Hardware Mode</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    High-Precision GPS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── HUD OVERLAY 2: Bottom-Left Synchronized Geocode Bar ── */}
          <div className="absolute bottom-4 left-4 z-20 w-[290px] sm:w-[325px] hidden sm:block">
            <div className="bg-white/55 backdrop-blur-xl p-3 border border-white/85 shadow-xl shadow-stone-900/5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="text-indigo-600">📍</span> Reverse Geocoded
                  Vector
                </span>
                <span className="font-mono text-[9px] text-emerald-700 bg-emerald-500/15 px-1.5 rounded border border-emerald-500/30">
                  ±3.2m HDOP
                </span>
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentWaypoint.street}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-semibold text-stone-900 leading-snug truncate"
                >
                  {currentWaypoint.street}
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] text-stone-600 font-mono mt-0.5 flex items-center justify-between tabular-nums">
                <span>{currentWaypoint.coords}</span>
                <span className="text-emerald-700 font-medium">
                  Synced &lt;1s
                </span>
              </p>
            </div>
          </div>

          {/* ── MAP CONTROLS DOCK (Top Right) ── */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-2">
            <button
              onClick={triggerRecenter}
              title="Recenter Camera on Target"
              className="w-8 h-8 rounded-xl bg-white/65 border border-white/85 shadow-md flex items-center justify-center text-stone-700 hover:text-indigo-600 hover:bg-white/85 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
            </button>

            <button
              onClick={triggerRecenter}
              title="Snap View to Target Pin"
              className="w-8 h-8 rounded-xl bg-white/65 border border-white/85 shadow-md flex items-center justify-center text-stone-700 hover:text-indigo-600 hover:bg-white/85 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* ── OVERLAID RECIPIENT PHONE MOCKUP ── */}
          <div className="hidden sm:block absolute right-6 bottom-6 z-30 w-[280px] lg:w-[300px]">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-white/85 bg-white/60 backdrop-blur-xl shadow-2xl shadow-stone-900/10 p-4"
            >
              <div className="flex justify-center mb-3">
                <div className="w-14 h-1.5 rounded-full bg-stone-400/50" />
              </div>

              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-700">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-900 leading-none">
                      Recipient's Phone
                    </p>
                    <p className="text-[9px] text-stone-600 mt-0.5">
                      Opens in Safari or Chrome
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Zero Apps
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/45 border border-white/80 mb-3 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-stone-800">
                    Encrypted Invite
                  </span>
                </div>
                <p className="text-[10px] text-stone-700 leading-snug">
                  "Dad is requesting your live location for safe arrival."
                </p>
              </div>

              <div className="space-y-2">
                {!hasGrantedConsent ? (
                  <motion.button
                    onClick={handleConsentClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer overflow-hidden group transition-all"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <Navigation className="w-3.5 h-3.5 fill-white" />
                    <span>Allow Location (1-Tap)</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 font-bold text-xs flex items-center justify-between shadow-2xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Handshake Locked!</span>
                    </span>
                    <button
                      onClick={handleReset}
                      title="Reset interactive preview"
                      className="text-[10px] font-medium text-stone-600 hover:text-stone-900 p-1 flex items-center gap-0.5 cursor-pointer underline"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset
                    </button>
                  </motion.div>
                )}

                <p className="text-[10px] text-stone-500 text-center">
                  {!hasGrantedConsent
                    ? "Click to trigger cryptographic GPS handshake"
                    : "256-bit WebSocket vector stream active"}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/60 flex items-center justify-center gap-1.5 text-[9px] text-stone-600 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Browser permission only · Revoke anytime</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── MOBILE INTERACTIVE PHONE CARD ── */}
        <div className="sm:hidden p-4 bg-white/25 border-t border-white/65">
          <div className="rounded-2xl border border-white/80 bg-white/50 p-3.5 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-stone-900">
                  Recipient View: 1-Tap Browser Consent
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                0 Apps
              </span>
            </div>

            <p className="text-[11px] text-stone-600 mb-2.5">
              Contact opens link in Safari or Chrome and taps:
            </p>

            {!hasGrantedConsent ? (
              <button
                onClick={handleConsentClick}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-white" />
                <span>Allow Location (1-Tap)</span>
              </button>
            ) : (
              <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Location Shared Live!</span>
                </span>
                <button
                  onClick={handleReset}
                  className="text-[10px] text-stone-500 underline"
                >
                  Reset
                </button>
              </div>
            )}

            <p className="text-[10px] text-stone-500 text-center mt-2 flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5 text-stone-400" />
              <span>
                Encrypted peer stream · Ceases immediately when tab closes
              </span>
            </p>
          </div>
        </div>

        {/* ── 3-STEP JOURNEY WITH FLOWING LIGHT BEAM ── */}
        <JourneyStepBar activeStep={activeStep} />
      </div>

      {/* Caption */}
      <p className="optical-line-blur mx-auto py-0.5 text-center text-xs text-stone-600 mt-3 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>
          Live kinematic simulation · Tap <strong>"Allow Location"</strong> on
          the phone card to test the 1-tap cryptographic handshake.
        </span>
      </p>
    </div>
  );
};

export default memo(HeroProductVisual);
