import { memo } from "react";
import { Layers, Link2, Clock, RefreshCw } from "lucide-react";

const lifecycleStages = [
  {
    icon: Layers,
    step: "01",
    title: "Slot Vault",
    metric: "15 / 15 Available",
    desc: "One-time slots sit in your account with zero expiration.",
    accent: "text-stone-800 bg-stone-100 border-stone-200",
  },
  {
    icon: Link2,
    step: "02",
    title: "Generate Link",
    metric: "1 Slot Active",
    desc: "Assign a slot to create an encrypted live tracking link.",
    accent: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    icon: Clock,
    step: "03",
    title: "Session Ends",
    metric: "24h or 1-Click Revoke",
    desc: "Link auto-expires after 24 hours or whenever you delete it.",
    accent: "text-amber-800 bg-amber-50 border-amber-200",
  },
  {
    icon: RefreshCw,
    step: "04",
    title: "Slot Restored",
    metric: "15 / 15 Recharged",
    desc: "The slot automatically returns to your vault for infinite reuse.",
    accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
];

/**
 * SlotLifecycleVisual Component
 * Closed-loop SVG schematic illustrating how NexTrack slots recycle back into
 * the user's balance after link expiration or deletion.
 */
const SlotLifecycleVisual = memo(() => {
  return (
    <div className="max-w-6xl mx-auto mb-16">
      <div className="surface-card p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/60">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
              <RefreshCw className="w-3.5 h-3.5 animate-orbit-slow" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900">
                Closed-Loop Slot Recycling Architecture
              </h2>
              <p className="text-xs text-stone-600">
                Why you never need a monthly subscription—slots replenish
                automatically when sessions finish.
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            ∞ 100% REUSABLE CAPACITY
          </span>
        </div>

        {/* Closed-Loop Vector Conduit (Desktop) */}
        <div className="relative">
          <svg
            viewBox="0 0 960 90"
            className="hidden lg:block w-full h-20 pointer-events-none select-none mb-2"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="recycleLoopGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Stadium Loop Track */}
            <rect
              x="70"
              y="16"
              width="820"
              height="56"
              rx="28"
              fill="rgba(255, 255, 255, 0.25)"
              stroke="rgba(43, 42, 39, 0.1)"
              strokeWidth="2"
            />

            {/* Animated Continuous Recycling Token Stream */}
            <rect
              x="70"
              y="16"
              width="820"
              height="56"
              rx="28"
              fill="none"
              stroke="url(#recycleLoopGrad)"
              strokeWidth="3"
              strokeDasharray="14 10"
              className="animate-packet-stream-slow"
            />

            {/* Return Loop Label at Bottom */}
            <rect
              x="365"
              y="60"
              width="230"
              height="20"
              rx="10"
              fill="rgba(255, 255, 255, 0.75)"
              stroke="#d6d3d1"
            />
            <text
              x="480"
              y="73"
              textAnchor="middle"
              fill="#047857"
              fontSize="9.5"
              fontFamily="monospace"
              fontWeight="700"
            >
              ↺ AUTO-RETURN TO VAULT ON EXPIRY
            </text>
          </svg>

          {/* 4 Stage Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:-mt-16 relative z-10">
            {lifecycleStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-white/65 border border-white/85 flex items-center justify-center text-stone-800 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${stage.accent}`}
                      >
                        {stage.metric}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 mb-1">
                      {stage.step}. {stage.title}
                    </h3>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

SlotLifecycleVisual.displayName = "SlotLifecycleVisual";

export default SlotLifecycleVisual;
