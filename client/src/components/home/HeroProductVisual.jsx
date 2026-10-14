import { useState, useEffect, useRef, useCallback, memo } from "react";
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
 * Static Cartography SVG Map Layer
 * Fully memoized to prevent re-rendering during telemetry speed/ping ticks.
 */
const StaticCartoMap = memo(() => (
  <svg
    className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
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

      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" fill="url(#cartoGrid)" />

    <path
      d="M-50,230 C170,190 320,300 610,250 C860,210 990,320 1200,270"
      fill="none"
      stroke="rgba(14, 165, 233, 0.16)"
      strokeWidth="52"
      strokeLinecap="round"
    />
    <path
      d="M-50,230 C170,190 320,300 610,250 C860,210 990,320 1200,270"
      fill="none"
      stroke="rgba(14, 165, 233, 0.28)"
      strokeWidth="14"
      strokeLinecap="round"
    />

    <path
      d="M-20,90 L1150,90"
      stroke="rgba(43, 42, 39, 0.075)"
      strokeWidth="16"
    />
    <path
      d="M-20,290 L1150,290"
      stroke="rgba(43, 42, 39, 0.07)"
      strokeWidth="14"
    />
    <path
      d="M160,-20 L160,520"
      stroke="rgba(43, 42, 39, 0.075)"
      strokeWidth="14"
    />
    <path
      d="M440,-20 L440,520"
      stroke="rgba(43, 42, 39, 0.085)"
      strokeWidth="18"
    />
    <path
      d="M740,-20 L740,520"
      stroke="rgba(43, 42, 39, 0.065)"
      strokeWidth="12"
    />

    <path
      d="M-20,190 L1150,190"
      stroke="rgba(43, 42, 39, 0.04)"
      strokeWidth="6"
    />
    <path
      d="M-20,390 L1150,390"
      stroke="rgba(43, 42, 39, 0.04)"
      strokeWidth="6"
    />
    <path
      d="M290,-20 L290,520"
      stroke="rgba(43, 42, 39, 0.04)"
      strokeWidth="6"
    />
    <path
      d="M580,-20 L580,520"
      stroke="rgba(43, 42, 39, 0.04)"
      strokeWidth="6"
    />

    <rect x="70" y="115" width="60" height="50" rx="3" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="190" y="115" width="75" height="50" rx="3" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="315" y="115" width="95" height="50" rx="3" fill="rgba(43, 42, 39, 0.035)" />
    <rect x="70" y="215" width="60" height="50" rx="3" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="475" y="115" width="80" height="50" rx="3" fill="rgba(43, 42, 39, 0.03)" />
    <rect x="475" y="215" width="80" height="50" rx="3" fill="rgba(43, 42, 39, 0.03)" />

    <text x="50" y="85" fill="#a8a29e" fontSize="9" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.05em">
      MONTGOMERY BLVD
    </text>
    <text x="450" y="385" fill="#a8a29e" fontSize="9" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.05em">
      MARKET AVENUE
    </text>

    <path
      d="M 160,330 L 220,330 L 290,270 L 290,190 L 370,190 L 440,140"
      fill="none"
      stroke="#6366f1"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.3"
    />

    <path
      d="M 160,330 L 220,330 L 290,270 L 290,190 L 370,190 L 440,140"
      fill="none"
      stroke="url(#routeGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="8 4"
      className="animate-gps-flow"
    />

    <circle cx="160" cy="330" r="3.5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
    <circle cx="290" cy="270" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="290" cy="190" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="370" cy="190" r="3" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
));

/**
 * Concentric Sonar Range Rings and Rotating Conical Radar Sweep
 */
const SonarRadarSweep = memo(() => (
  <div
    className="absolute left-[36%] sm:left-[43%] top-[30%] sm:top-[28%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    style={{ width: "320px", height: "320px" }}
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
        background:
          "conic-gradient(from 0deg, transparent 0deg, transparent 310deg, rgba(99, 102, 241, 0.08) 330deg, rgba(99, 102, 241, 0.32) 360deg)",
      }}
    />

    <div className="absolute inset-[38%] rounded-full border-2 border-indigo-500/50 bg-indigo-500/10 animate-sonar-pulse" />
  </div>
));

/**
 * 3-Step Journey Bar
 */
const JourneyStepBar = memo(({ activeStep }) => (
  <div className="relative grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 bg-stone-50/90 border-t border-stone-200 text-center text-xs overflow-hidden">
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
      <span className="text-stone-700">
        Generate encrypted tracking link
      </span>
    </div>

    <div
      className={`p-3 sm:p-3.5 flex items-center justify-center gap-2 transition-colors ${
        activeStep === 2 ? "bg-indigo-50/50 font-medium" : ""
      }`}
    >
      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
        2
      </span>
      <span className="text-stone-700">
        Recipient taps "Allow" in browser
      </span>
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

/**
 * HeroProductVisual Component — Classy & Aesthetic Interactive Luxury Edition
 */
const HeroProductVisual = () => {
  // Interactive Simulation State
  const [hasGrantedConsent, setHasGrantedConsent] = useState(false);
  const [speed, setSpeed] = useState(22.4);
  const [pingLatency, setPingLatency] = useState(0.4);
  const [activeStep, setActiveStep] = useState(2);
  const [isRecenterTriggered, setIsRecenterTriggered] = useState(false);
  const recenterTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Subtle live telemetry heartbeat (organic micro-fluctuations every 2.8s)
  // Pauses automatically when scrolled out of view or tab is hidden to save GPU/CPU
  useEffect(() => {
    let intervalId = null;
    let isVisible = !document.hidden;
    let isInView = true;

    const startInterval = () => {
      if (intervalId || !isVisible || !isInView) return;
      intervalId = setInterval(() => {
        setSpeed((prev) => {
          const delta = (Math.random() - 0.5) * 0.8;
          return Number((Math.max(19.5, Math.min(25.5, prev + delta))).toFixed(1));
        });
        setPingLatency(Math.random() > 0.5 ? 0.3 : 0.4);
      }, 2800);
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && isInView) startInterval();
      else stopInterval();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let observer = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInView = entry.isIntersecting;
          if (isInView && isVisible) startInterval();
          else stopInterval();
        },
        { rootMargin: "100px" }
      );
      observer.observe(containerRef.current);
    } else {
      startInterval();
    }

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (observer) observer.disconnect();
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
    recenterTimeoutRef.current = setTimeout(() => setIsRecenterTriggered(false), 800);
  }, []);

  useEffect(() => {
    return () => {
      if (recenterTimeoutRef.current) clearTimeout(recenterTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto mt-8 sm:mt-12 mb-14 lg:mb-20 select-none">
      {/* Dynamic Ambient Luxury Glow behind the frame (optimized feathering) */}
      <div
        className="absolute -inset-1.5 bg-gradient-to-r from-indigo-200/35 via-emerald-100/25 to-amber-100/35 rounded-3xl blur-lg opacity-70 pointer-events-none"
        style={{ contain: "paint" }}
      />

      {/* Main Container — Desktop Live Map Window Chrome */}
      <div className="relative rounded-2xl border border-stone-200/90 bg-white/95 shadow-2xl shadow-stone-300/40 overflow-hidden ring-1 ring-stone-900/[0.04]">
        {/* ── Browser Window Chrome Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 bg-[#fbf9f5]">
          {/* Traffic light window controls with subtle hover glow */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block shadow-2xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block shadow-2xs" />
            <span className="hidden sm:inline-block text-[11px] font-semibold text-stone-500 ml-2 tracking-tight">
              NexTrack Telemetry Console
            </span>
          </div>

          {/* Secure URL Bar with SSL indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-stone-200/90 text-xs font-mono text-stone-600 max-w-sm w-full mx-4 justify-center shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-stone-700 font-medium truncate">
              nextrack.app/live/alex-travel-session
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50/90 px-1.5 py-0.2 rounded border border-emerald-200 font-sans font-bold flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              256-bit TLS
            </span>
          </div>

          {/* Live Stream Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-1 rounded-full shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono tracking-tight">
                LIVE GPS · {pingLatency}s
              </span>
            </div>
          </div>
        </div>

        {/* ── MAP CANVAS & HUD GRID ── */}
        <div className="relative h-[360px] sm:h-[430px] lg:h-[480px] w-full overflow-hidden bg-[#fbf9f4]">
          {/* Memoized cartography grid & route vectors */}
          <StaticCartoMap />

          {/* Memoized sonar range rings & 360° radar sweep */}
          <SonarRadarSweep />

          {/* ── ACTIVE GPS TARGET BEACON & CALLOUT ── */}
          <div
            className={`absolute left-[36%] sm:left-[43%] top-[30%] sm:top-[28%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-transform duration-500 ${
              isRecenterTriggered ? "scale-115" : "scale-100"
            }`}
          >
            {/* Popover Callout with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200/90 shadow-xl flex items-center gap-2.5"
            >
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight flex items-center gap-1.5">
                  Alex (Target Phone)
                  <span className="text-[9px] font-semibold font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/80">
                    ONLINE
                  </span>
                </p>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5 flex items-center gap-1">
                  <span>Moving</span>
                  <span>·</span>
                  <span className="text-indigo-600 font-semibold">{speed} km/h</span>
                  <span>·</span>
                  <span>±4m</span>
                </p>
              </div>
            </motion.div>

            {/* Active Pin Head with Floating Wave */}
            <div className="relative flex items-center justify-center animate-pin-float">
              {/* Outer Pulse Halo */}
              <div className="absolute w-10 h-10 rounded-full bg-indigo-400/25 animate-ping" />
              {/* Main Pin Circle */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 ring-indigo-200/70">
                <Navigation className="w-4 h-4 fill-white rotate-45 transform -translate-y-0.5" />
              </div>
              {/* Ground Anchor Shadow */}
              <div className="absolute -bottom-1 w-3 h-1 bg-stone-900/30 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* ── HUD OVERLAY 1: Top-Left Target Telemetry Box ── */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-auto sm:w-[245px]">
            {/* Mobile compact pill */}
            <div className="sm:hidden bg-white px-3 py-1.5 border border-stone-200 shadow-sm rounded-xl flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-stone-900 text-[11px]">
                Alex · {speed} km/h
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                ±4m · 88%
              </span>
            </div>

            {/* Desktop / Tablet expanded telemetry box */}
            <div className="hidden sm:block bg-white p-3.5 border border-stone-200/90 shadow-xl shadow-stone-200/50 rounded-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-[11px] font-bold text-stone-900 uppercase tracking-wider">
                    Device Stream
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {/* Battery with charging indicator */}
                <div className="flex justify-between items-center text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
                    <span>Battery</span>
                  </span>
                  <span className="text-stone-900 font-semibold font-mono">
                    88% ⚡
                  </span>
                </div>

                {/* Satellite Lock with live signal strength bars */}
                <div className="flex justify-between items-center text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Satellites</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-900 font-medium font-mono text-[11px]">
                      9 locked
                    </span>
                    {/* Signal Bars */}
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-1 h-1.5 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-2 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-2.5 bg-emerald-500 rounded-2xs" />
                      <span className="w-1 h-3 bg-emerald-500 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Live Speed */}
                <div className="flex justify-between items-center text-stone-500">
                  <span>Current Speed</span>
                  <span className="text-indigo-700 font-bold font-mono bg-indigo-50/70 px-1.5 py-0.2 rounded border border-indigo-100">
                    {speed} km/h
                  </span>
                </div>

                {/* Hardware mode */}
                <div className="flex justify-between items-center text-stone-500">
                  <span>Hardware Mode</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    High-Precision GPS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── HUD OVERLAY 2: Bottom-Left Address Bar (Desktop/Tablet) ── */}
          <div className="absolute bottom-4 left-4 z-20 max-w-[270px] sm:max-w-[320px] hidden sm:block">
            <div className="bg-white p-3 border border-stone-200/90 shadow-xl shadow-stone-200/50 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-0.5 flex items-center gap-1">
                <span className="text-indigo-600">📍</span> Reverse Geocoded Pinpoint
              </p>
              <p className="text-xs font-semibold text-stone-900 leading-snug truncate">
                452 Market Street, Financial District
              </p>
              <p className="text-[10px] text-stone-500 font-mono mt-0.5 flex items-center justify-between">
                <span>37.7891° N, 122.4014° W</span>
                <span className="text-emerald-700 font-medium">Updated 1s ago</span>
              </p>
            </div>
          </div>

          {/* ── MAP CONTROLS DOCK (Top Right) ── */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-2">
            {/* Compass Tool */}
            <button
              onClick={triggerRecenter}
              title="Recenter Camera on Target"
              className="w-8 h-8 rounded-xl bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-700 hover:text-indigo-600 hover:bg-stone-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Recenter Target Button */}
            <button
              onClick={triggerRecenter}
              title="Snap View to Target Pin"
              className="w-8 h-8 rounded-xl bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-700 hover:text-indigo-600 hover:bg-stone-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* ── OVERLAID RECIPIENT PHONE MOCKUP (Interactive Glassmorphic Chassis) ── */}
          <div className="hidden sm:block absolute right-6 bottom-6 z-30 w-[280px] lg:w-[300px]">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-stone-200/90 bg-white shadow-2xl shadow-stone-300/60 p-4 ring-1 ring-black/[0.03]"
            >
              {/* Smartphone Top Notch / Speaker Slit */}
              <div className="flex justify-center mb-3">
                <div className="w-14 h-1.5 rounded-full bg-stone-300/80" />
              </div>

              {/* Recipient Card Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-900 leading-none">
                      Recipient's Phone
                    </p>
                    <p className="text-[9px] text-stone-500 mt-0.5">
                      Opens in Safari or Chrome
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Zero Apps
                </span>
              </div>

              {/* Interactive Incoming Request Bubble */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 mb-3 text-left">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-stone-800">
                    Encrypted Invite
                  </span>
                </div>
                <p className="text-[10px] text-stone-600 leading-snug">
                  "Dad is requesting your live location for safe arrival."
                </p>
              </div>

              {/* Interactive 1-Tap Browser Consent Button */}
              <div className="space-y-2">
                {!hasGrantedConsent ? (
                  <motion.button
                    onClick={handleConsentClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer overflow-hidden group transition-all"
                  >
                    {/* Light Shimmer Sheen on Hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <Navigation className="w-3.5 h-3.5 fill-white" />
                    <span>Allow Location (1-Tap)</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between shadow-2xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Location Shared Live!</span>
                    </span>
                    <button
                      onClick={handleReset}
                      title="Reset interactive preview"
                      className="text-[10px] font-medium text-stone-500 hover:text-stone-800 p-1 flex items-center gap-0.5 cursor-pointer underline"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset
                    </button>
                  </motion.div>
                )}

                <p className="text-[10px] text-stone-400 text-center">
                  {!hasGrantedConsent ? "Click to simulate 1-tap consent" : "Active peer-to-peer session streaming"}
                </p>
              </div>

              {/* Trust Badge */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[9px] text-stone-500 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Browser permission only · Revoke anytime</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── MOBILE INTERACTIVE PHONE CARD ── */}
        <div className="sm:hidden p-4 bg-stone-50/80 border-t border-stone-200">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
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
              <span>Encrypted peer stream · Ceases immediately when tab closes</span>
            </p>
          </div>
        </div>

        {/* ── 3-STEP JOURNEY WITH FLOWING LIGHT BEAM ── */}
        <JourneyStepBar activeStep={activeStep} />
      </div>

      {/* Caption */}
      <p className="text-center text-xs text-stone-500 mt-3 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>
          Interactive demo · Tap <strong>"Allow Location"</strong> on the phone card to test the 1-tap consent flow.
        </span>
      </p>
    </div>
  );
};

export default memo(HeroProductVisual);
