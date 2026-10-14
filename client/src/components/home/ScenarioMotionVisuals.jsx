import { memo } from "react";

/**
 * 1. Family & Loved Ones — Radial Geofence Safe-Zone Visual
 * Shows a trajectory entering a circular "Home Safe Zone" boundary with harmonic pulse
 */
export const FamilyGeofenceVisual = memo(() => (
  <div
    className="relative h-32 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden mb-5 flex items-center justify-center"
    style={{ containerType: "size" }}
  >
    {/* Layer 1: Subtle coordinate crosshairs */}
    <svg
      viewBox="0 0 260 110"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      <line x1="0" y1="55" x2="260" y2="55" stroke="rgba(43,42,39,0.05)" strokeWidth="1" />
      <line x1="175" y1="0" x2="175" y2="110" stroke="rgba(43,42,39,0.05)" strokeWidth="1" />
    </svg>

    {/* Layer 2: Geofence Safe Zone Outer Rotating Ring
        Rotated as an HTML layer (GPU compositor) instead of an SVG <g> (main-thread
        SVG layout every frame). The pivot reproduces the SVG "xMidYMid meet" mapping
        of viewBox point (175, 55): x = 50% + 45 * scale, y = 50%. */}
    <div
      className="absolute inset-0 animate-orbit-slow pointer-events-none"
      style={{
        transformOrigin:
          "calc(50% + 45 * min(100cqw / 260, 100cqh / 110)) 50%",
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 260 110" className="w-full h-full select-none">
        <circle
          cx="175"
          cy="55"
          r="36"
          fill="rgba(16, 185, 129, 0.06)"
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth="1.25"
          strokeDasharray="5 4"
        />
      </svg>
    </div>

    {/* Layer 3: Safe zone core, approach vector & arrived pin */}
    <svg
      viewBox="0 0 260 110"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Inner Safe Zone Core */}
      <circle
        cx="175"
        cy="55"
        r="20"
        fill="rgba(16, 185, 129, 0.1)"
        stroke="rgba(16, 185, 129, 0.25)"
        strokeWidth="1"
      />

      {/* Approach Vector Trajectory */}
      <path
        d="M 28,82 Q 95,82 175,55"
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeDasharray="7 4"
        className="animate-gps-flow"
      />

      <circle cx="28" cy="82" r="3.5" fill="#94a3b8" />

      {/* Arrived Target Pin inside Safe Zone */}
      <circle
        cx="175"
        cy="55"
        r="6"
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>

    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 border border-emerald-200 text-[9px] font-mono font-bold text-emerald-800 shadow-2xs flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>SAFE ZONE · ARRIVED</span>
    </div>
  </div>
));

FamilyGeofenceVisual.displayName = "FamilyGeofenceVisual";

/**
 * 2. Meetups, Travel & Commutes — Dual-Vector Geodesic Convergence Visual
 * Shows two independent trajectories converging on a shared rendezvous coordinate
 */
export const MeetupConvergenceVisual = memo(() => (
  <div className="relative h-32 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden mb-5 flex items-center justify-center">
    <svg
      viewBox="0 0 260 110"
      className="w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Grid */}
      <line x1="130" y1="0" x2="130" y2="110" stroke="rgba(43,42,39,0.05)" strokeWidth="1" />
      <line x1="0" y1="55" x2="260" y2="55" stroke="rgba(43,42,39,0.05)" strokeWidth="1" />

      {/* Vector A (You) */}
      <path
        d="M 26,26 C 68,26 92,55 130,55"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeDasharray="7 4"
        className="animate-gps-flow"
      />
      <circle cx="26" cy="26" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />

      {/* Vector B (Friend) */}
      <path
        d="M 234,84 C 192,84 168,55 130,55"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2.5"
        strokeDasharray="7 4"
        className="animate-packet-stream"
      />
      <circle cx="234" cy="84" r="4" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />

      {/* Central Rendezvous Node */}
      <circle
        cx="130"
        cy="55"
        r="18"
        fill="rgba(99, 102, 241, 0.08)"
        stroke="rgba(99, 102, 241, 0.35)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle
        cx="130"
        cy="55"
        r="6.5"
        fill="#4f46e5"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>

    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 border border-indigo-200 text-[9px] font-mono font-bold text-indigo-800 shadow-2xs">
      Δd = 0m · RENDEZVOUS SYNC
    </div>
  </div>
));

MeetupConvergenceVisual.displayName = "MeetupConvergenceVisual";

/**
 * 3. Field Teams & Deliveries — Multi-Node Dispatch Constellation
 * Shows 3 active courier vectors synchronized to a central telemetry hub
 */
export const FleetDispatchVisual = memo(() => (
  <div className="relative h-32 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden mb-5 flex items-center justify-center">
    <svg
      viewBox="0 0 260 110"
      className="w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Orthogonal Street Network */}
      <path d="M 0,32 L 260,32 M 0,78 L 260,78 M 75,0 L 75,110 M 185,0 L 185,110" stroke="rgba(43,42,39,0.06)" strokeWidth="4" />

      {/* Telemetry Hub Links */}
      <line
        x1="130"
        y1="55"
        x2="65"
        y2="32"
        stroke="rgba(99, 102, 241, 0.45)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="animate-gps-flow"
      />
      <line
        x1="130"
        y1="55"
        x2="195"
        y2="32"
        stroke="rgba(16, 185, 129, 0.5)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="animate-gps-flow"
      />
      <line
        x1="130"
        y1="55"
        x2="185"
        y2="78"
        stroke="rgba(99, 102, 241, 0.45)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="animate-gps-flow"
      />

      {/* Central Dispatch Hub */}
      <circle cx="130" cy="55" r="14" fill="rgba(99, 102, 241, 0.1)" />
      <circle cx="130" cy="55" r="5" fill="#1c1b18" stroke="#ffffff" strokeWidth="1.5" />

      {/* 3 Fleet Nodes */}
      <circle cx="65" cy="32" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="195" cy="32" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="185" cy="78" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
    </svg>

    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 border border-stone-200 text-[9px] font-mono font-bold text-stone-800 shadow-2xs">
      3/3 UNITS · 256-BIT TLS
    </div>
  </div>
));

FleetDispatchVisual.displayName = "FleetDispatchVisual";
