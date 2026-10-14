import { useState, useCallback, memo } from "react";
import {
  Smartphone,
  Server,
  MapPin,
  Database,
  ShieldAlert,
  ShieldCheck,
  Power,
  RotateCcw,
} from "lucide-react";

/**
 * PrivacyPipelineVisual Component
 * Interactive architectural schematic illustrating NexTrack's zero-storage
 * ephemeral WebSocket telemetry pipeline vs blocked disk persistence.
 */
const PrivacyPipelineVisual = memo(() => {
  const [isStreamActive, setIsStreamActive] = useState(true);

  const toggleStream = useCallback(() => {
    setIsStreamActive((prev) => !prev);
  }, []);

  return (
    <div className="surface-elevated p-6 sm:p-8 rounded-3xl border border-[#ded7ca] mb-16 overflow-hidden">
      {/* Top Header & Interactive Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Persistence Telemetry Schematic</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
            How Ephemeral Memory Routing Protects Your Privacy
          </h3>
        </div>

        <button
          type="button"
          onClick={toggleStream}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto ${
            isStreamActive
              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          }`}
        >
          {isStreamActive ? (
            <>
              <Power className="w-3.5 h-3.5" />
              <span>Simulate Tab Close / Revoke</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Live Telemetry Stream</span>
            </>
          )}
        </button>
      </div>

      {/* Main Schematic Canvas */}
      <div className="relative rounded-2xl bg-white/20 border border-white/75 p-5 sm:p-8 overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-ambient-pattern opacity-45 pointer-events-none" />

        {/* Desktop SVG Conduit Layer */}
        <svg
          viewBox="0 0 800 210"
          className="hidden md:block w-full h-48 pointer-events-none select-none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ephemeralStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>

          {/* Horizontal Main Telemetry Conduit (Node 1 -> Node 2 -> Node 3) */}
          <line
            x1="130"
            y1="65"
            x2="670"
            y2="65"
            stroke="rgba(43, 42, 39, 0.1)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {isStreamActive && (
            <line
              x1="130"
              y1="65"
              x2="670"
              y2="65"
              stroke="url(#ephemeralStream)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 8"
              className="animate-packet-stream"
            />
          )}

          {/* Vertical Blocked Branch to Permanent Database */}
          <line
            x1="400"
            y1="65"
            x2="400"
            y2="165"
            stroke="rgba(225, 29, 72, 0.25)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Air-Gap Cryptographic Block Barrier at y=118 */}
          <rect
            x="335"
            y="106"
            width="130"
            height="22"
            rx="6"
            fill="#fff1f2"
            stroke="#fecdd3"
            strokeWidth="1.2"
          />
          <text
            x="400"
            y="120"
            textAnchor="middle"
            fill="#be123c"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="700"
          >
            ✕ AIR-GAPPED · 0 DISK I/O
          </text>

          {/* Telemetry Labels on Conduit */}
          <rect
            x="210"
            y="28"
            width="115"
            height="20"
            rx="5"
            fill="rgba(255, 255, 255, 0.75)"
            stroke="#e2dbce"
          />
          <text
            x="267"
            y="41"
            textAnchor="middle"
            fill={isStreamActive ? "#4338ca" : "#78716c"}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="600"
          >
            {isStreamActive ? "256-BIT TLS STREAM" : "SOCKET CLOSED"}
          </text>

          <rect
            x="475"
            y="28"
            width="115"
            height="20"
            rx="5"
            fill="rgba(255, 255, 255, 0.75)"
            stroke="#e2dbce"
          />
          <text
            x="532"
            y="41"
            textAnchor="middle"
            fill={isStreamActive ? "#047857" : "#78716c"}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="600"
          >
            {isStreamActive ? "<0.4s WEBSOCKET" : "0 BYTES RETAINED"}
          </text>
        </svg>

        {/* 3 Primary Nodes + Blocked DB Node Overlay */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:-mt-44">
          {/* Node 1: Recipient Phone */}
          <div className="bg-white/55 backdrop-blur-md p-4 rounded-2xl border border-white/85 shadow-sm flex flex-col items-center text-center max-w-[220px] mx-auto w-full">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                isStreamActive
                  ? "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30"
                  : "bg-stone-500/10 text-stone-500 border border-stone-300"
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900">
              1. Recipient Browser
            </span>
            <span className="text-[11px] text-stone-600 mt-0.5">
              {isStreamActive
                ? "Hardware GPS Permission Active"
                : "Tab Closed — Sensor Released"}
            </span>
          </div>

          {/* Node 2: Ephemeral RAM Relay + Blocked Disk Below */}
          <div className="flex flex-col items-center gap-3 md:gap-14">
            <div className="bg-white/55 backdrop-blur-md p-4 rounded-2xl border border-white/85 shadow-sm flex flex-col items-center text-center max-w-[220px] mx-auto w-full">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                  isStreamActive
                    ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                    : "bg-stone-500/10 text-stone-500 border border-stone-300"
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-stone-900">
                2. Ephemeral RAM Relay
              </span>
              <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 mt-1">
                {isStreamActive
                  ? "VOLATILE STREAM ONLY"
                  : "RAM BUFFER: 0.0 KB"}
              </span>
            </div>

            {/* Blocked Permanent Storage Box */}
            <div className="bg-rose-500/12 backdrop-blur-md p-3 rounded-xl border border-rose-500/30 flex items-center gap-2.5 max-w-[235px] mx-auto w-full">
              <div className="w-8 h-8 rounded-lg bg-white/65 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-rose-950 flex items-center gap-1">
                  <span>Cloud Disk Storage</span>
                </p>
                <p className="text-[10px] font-mono text-rose-700 font-semibold">
                  0 Coordinate Logs Saved
                </p>
              </div>
            </div>
          </div>

          {/* Node 3: Live Viewer Radar */}
          <div className="bg-white/55 backdrop-blur-md p-4 rounded-2xl border border-white/85 shadow-sm flex flex-col items-center text-center max-w-[220px] mx-auto w-full">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                isStreamActive
                  ? "bg-indigo-500/15 text-indigo-700 border border-indigo-500/30"
                  : "bg-stone-500/10 text-stone-500 border border-stone-300"
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-900">
              3. Live Radar Map
            </span>
            <span className="text-[11px] text-stone-600 mt-0.5">
              {isStreamActive
                ? "Real-Time Vector Pinpoint"
                : "Session Ended — Zero Trace"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 px-1">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isStreamActive ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
            }`}
          />
          <strong className="text-stone-800">Current State:</strong>{" "}
          {isStreamActive
            ? "Encrypted coordinates routing strictly in volatile memory."
            : "Session terminated — all ephemeral sockets & memory references purged."}
        </span>
        <span className="font-mono text-[11px] text-stone-600 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Historical Surveillance</span>
        </span>
      </div>
    </div>
  );
});

PrivacyPipelineVisual.displayName = "PrivacyPipelineVisual";

export default PrivacyPipelineVisual;
