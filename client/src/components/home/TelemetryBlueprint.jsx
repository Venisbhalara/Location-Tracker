import { memo } from "react";
import { Lock, Smartphone, Radio, ShieldCheck, Check } from "lucide-react";
import {
  OpticalReveal,
  OpticalStaggerContainer,
  OpticalStaggerItem,
} from "../common/OpticalReveal";
import SpecularCard from "../common/SpecularCard";

/**
 * Stage 01 Graphic: Orbital Cryptographic Cipher Ring
 * Pure SVG + CSS compositor rotation (0% main-thread CPU cost)
 */
const CipherRingGraphic = memo(() => (
  <div className="relative h-40 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden flex items-center justify-center mb-5">
    {/* Subtle technical grid */}
    <div className="absolute inset-0 bg-ambient-pattern opacity-45" />

    {/* Outer Counter-Rotating Orbital Ring
        Each rotating ring lives in its own HTML layer so the rotation runs on the
        GPU compositor (rotating an SVG <g> forces main-thread SVG layout every frame). */}
    <div
      className="relative w-36 h-36 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-orbit-slow">
        <svg viewBox="0 0 180 180" className="w-full h-full">
          <circle
            cx="90"
            cy="90"
            r="66"
            fill="none"
            stroke="rgba(99, 102, 241, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
          />
          <circle cx="90" cy="24" r="3" fill="#6366f1" />
          <circle cx="90" cy="156" r="2.5" fill="#818cf8" />
        </svg>
      </div>

      <div className="absolute inset-0 animate-orbit-reverse">
        <svg viewBox="0 0 180 180" className="w-full h-full">
          <circle
            cx="90"
            cy="90"
            r="48"
            fill="none"
            stroke="rgba(16, 185, 129, 0.28)"
            strokeWidth="1.2"
            strokeDasharray="12 8"
          />
          <circle cx="138" cy="90" r="2.8" fill="#10b981" />
        </svg>
      </div>

      <svg viewBox="0 0 180 180" className="absolute inset-0 w-full h-full">
        <circle
          cx="90"
          cy="90"
          r="30"
          fill="rgba(255, 255, 255, 0.55)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1"
        />
      </svg>
    </div>

    {/* Center Encrypted Link Pill */}
    <div className="absolute z-10 flex flex-col items-center gap-1.5">
      <div className="w-9 h-9 rounded-xl bg-white/65 border border-white/90 shadow-md flex items-center justify-center text-indigo-600">
        <Lock className="w-4 h-4" />
      </div>
      <div className="px-2.5 py-1 rounded-full bg-white/65 border border-white/90 shadow-xs flex items-center gap-1.5 text-[10px] font-mono text-stone-800">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <span>nextrack.app/t/8f3a9c</span>
      </div>
    </div>

    {/* Corner Telemetry Tag */}
    <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-semibold text-stone-600 bg-white/55 px-2 py-0.5 rounded border border-white/80">
      SHA-256 · TLS 1.3
    </span>
  </div>
));

CipherRingGraphic.displayName = "CipherRingGraphic";

/**
 * Stage 02 Graphic: Inverse-Square Harmonic Permission Ripple
 */
const ConsentHandshakeGraphic = memo(() => (
  <div className="relative h-40 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden flex items-center justify-center mb-5">
    <div className="absolute inset-0 bg-ambient-pattern opacity-45" />

    {/* Concentric Harmonic Wave Propagation Rings */}
    <div className="relative flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full border border-emerald-500/35 animate-harmonic-ripple" />
      <div
        className="absolute w-24 h-24 rounded-full border border-indigo-500/25 animate-harmonic-ripple"
        style={{ animationDelay: "1.4s" }}
      />
      <div className="absolute w-32 h-32 rounded-full border border-stone-300/50 border-dashed" />

      {/* Minimalist Vector Phone Chassis */}
      <div className="relative z-10 w-44 rounded-2xl bg-white/65 border border-white/90 shadow-md p-2.5 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1 text-[9px] font-bold text-stone-800">
            <Smartphone className="w-3 h-3 text-indigo-600" />
            Safari / Chrome
          </span>
          <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
            0 APPS
          </span>
        </div>

        <div className="p-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs">
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>Allow GPS Location</span>
        </div>
      </div>
    </div>

    <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-semibold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
      1-TAP CONSENT
    </span>
  </div>
));

ConsentHandshakeGraphic.displayName = "ConsentHandshakeGraphic";

/**
 * Stage 03 Graphic: Harmonic Carrier Wave & Geodesic Packet Stream
 * Plotted using exact cubic Bézier approximation of y(x) = A * sin(kx)
 */
const HarmonicWaveGraphic = memo(() => (
  <div className="relative h-40 w-full rounded-2xl bg-white/25 border border-white/75 shadow-inner overflow-hidden flex items-center justify-center mb-5">
    <div className="absolute inset-0 bg-ambient-pattern opacity-45" />

    <svg
      viewBox="0 0 280 130"
      className="w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveCarrierGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Reference Equilibrium Axis */}
      <line
        x1="24"
        y1="68"
        x2="256"
        y2="68"
        stroke="rgba(43, 42, 39, 0.08)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Secondary Phase-Shifted Carrier Wave */}
      <path
        d="M 28,68 C 56,34 84,102 112,68 C 140,34 168,102 196,68 C 224,34 240,86 252,68"
        fill="none"
        stroke="rgba(99, 102, 241, 0.16)"
        strokeWidth="2"
      />

      {/* Primary Animated Harmonic Sine Stream */}
      <path
        d="M 28,68 C 56,28 84,108 112,68 C 140,28 168,108 196,68 C 224,28 240,94 252,68"
        fill="none"
        stroke="url(#waveCarrierGrad)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeDasharray="10 6"
        className="animate-packet-stream"
      />

      {/* Sender Node */}
      <circle
        cx="28"
        cy="68"
        r="6"
        fill="#ffffff"
        stroke="#6366f1"
        strokeWidth="2.5"
      />

      {/* Receiver Radar Node */}
      <circle
        cx="252"
        cy="68"
        r="11"
        fill="rgba(16, 185, 129, 0.14)"
      />
      <circle
        cx="252"
        cy="68"
        r="6"
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>

    {/* Bottom Telemetry Pill */}
    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white/65 border border-white/90 shadow-2xs flex items-center gap-1.5 text-[10px] font-mono text-stone-800 whitespace-nowrap">
      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
      <span>WebSocket Stream · &lt;0.4s Latency</span>
    </div>

    <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-semibold text-indigo-800 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
      0 DB STORAGE
    </span>
  </div>
));

HarmonicWaveGraphic.displayName = "HarmonicWaveGraphic";

const blueprintSteps = [
  {
    step: "01",
    badge: "Cryptographic Synthesis",
    title: "Generate Ephemeral Link",
    desc: "Create a unique 256-bit tokenized URL in one click and share it via WhatsApp, iMessage, or SMS.",
    Graphic: CipherRingGraphic,
  },
  {
    step: "02",
    badge: "Hardware Handshake",
    title: "Recipient Taps 'Allow'",
    desc: "Opens natively in Safari or Chrome with zero app installs. Explicit browser-level GPS consent starts the session.",
    Graphic: ConsentHandshakeGraphic,
  },
  {
    step: "03",
    badge: "Sub-Second Telemetry",
    title: "Watch Live on Radar Map",
    desc: "Coordinates stream over low-latency WebSockets in real time and automatically vaporize when the tab closes.",
    Graphic: HarmonicWaveGraphic,
  },
];

const TelemetryBlueprint = memo(() => {
  return (
    <section
      id="how-it-works"
      className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18"
      aria-label="How NexTrack Works"
    >
      <OpticalReveal distance={20}>
        <div className="glass-content-container rounded-3xl px-6 py-6 sm:px-10 sm:py-7 text-center w-full max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>3-Stage Telemetry Architecture</span>
          </div>
          <h2 className="section-title mb-2.5">
            Engineered for Instant, Consent-First Clarity
          </h2>
          <p className="body-primary text-stone-700">
            From cryptographic link generation to sub-second satellite lock in
            under five seconds—with zero software installed on either phone.
          </p>
        </div>
      </OpticalReveal>

      <OpticalStaggerContainer
        stagger={0.1}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative"
      >
        {blueprintSteps.map(({ step, badge, title, desc, Graphic }) => (
          <OpticalStaggerItem key={step} distance={20} className="h-full">
            <SpecularCard className="surface-card p-6 sm:p-7 h-full rounded-3xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                    STEP {step}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-800 bg-white/45 px-2.5 py-0.5 rounded-full border border-white/80">
                    {badge}
                  </span>
                </div>

                <Graphic />

                <h3 className="text-lg font-bold text-stone-900 mb-2">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {desc}
                </p>
              </div>
            </SpecularCard>
          </OpticalStaggerItem>
        ))}
      </OpticalStaggerContainer>
    </section>
  );
});

TelemetryBlueprint.displayName = "TelemetryBlueprint";

export default TelemetryBlueprint;
