import { useState } from "react";

/**
 * HeroProductVisual Component
 * 
 * Visualizes the 2-way product mechanics within 3 seconds:
 * 1. The Sender's Perspective: Real-time Live Radar Map with route breadcrumbs, telemetry HUD, and pin.
 * 2. The Recipient's Perspective: Frictionless 1-tap browser consent with zero app downloads.
 */
const HeroProductVisual = () => {
  const [activeTab, setActiveTab] = useState("both"); // "both" on desktop, toggleable on mobile if needed

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-10 sm:mt-14 mb-16 lg:mb-24 select-none">
      
      {/* Subtle outer glow ambient backlight */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Container — Desktop Live Map View */}
      <div className="relative rounded-2xl border border-white/[0.12] bg-[#0b0e17] shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10">
        
        {/* Browser / App Window Chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
          {/* Traffic light window controls */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* Secure URL Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-slate-400 max-w-sm w-full mx-4 justify-center">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-slate-300 font-medium truncate">nextrack.app/live/alex-travel-session</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-sans font-bold">
              SSL 256-bit
            </span>
          </div>

          {/* Live Status indicator */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE GPS · 0.4s</span>
            </span>
          </div>
        </div>

        {/* ── MAP CANVAS & HUD GRID ── */}
        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden bg-[#090d16]">
          
          {/* Vector Map Simulation (Stylized Dark Theme Map) */}
          <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Stylized River / Water body */}
            <path
              d="M-50,220 C180,180 320,290 600,240 C850,200 980,310 1200,260"
              fill="none"
              stroke="rgba(34, 211, 238, 0.12)"
              strokeWidth="48"
              strokeLinecap="round"
            />

            {/* Stylized Major Avenues */}
            <path d="M-20,90 L1150,90" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="14" />
            <path d="M-20,280 L1150,280" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="12" />
            <path d="M160,-20 L160,520" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="12" />
            <path d="M420,-20 L420,520" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="16" />
            <path d="M720,-20 L720,520" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="10" />

            {/* Minor streets */}
            <path d="M-20,180 L1150,180" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="6" />
            <path d="M-20,380 L1150,380" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="6" />
            <path d="M290,-20 L290,520" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="6" />
            <path d="M570,-20 L570,520" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="6" />

            {/* Traveled Route Polyline */}
            <path
              d="M 160,320 L 220,320 L 290,260 L 290,180 L 370,180 L 420,140"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3"
            />
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Radar Sweep Effect centered on target */}
          <div className="absolute left-[36%] sm:left-[42%] top-[30%] sm:top-[28%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-indigo-500/20 bg-indigo-500/5 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full border border-indigo-400/30" />
          </div>

          {/* ACTIVE GPS TARGET PIN */}
          <div className="absolute left-[36%] sm:left-[42%] top-[30%] sm:top-[28%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            
            {/* Popover Callout */}
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#0e1220]/95 border border-indigo-400/40 shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">Alex (Target Phone)</p>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5">Moving · 22 km/h · ±4m</p>
              </div>
            </div>

            {/* Pulsing Pin Head */}
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ring-4 ring-indigo-500/40">
                📍
              </div>
            </div>
          </div>

          {/* HUD OVERLAY 1: Top-Left Target Telemetry Box */}
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:top-4 sm:left-4 z-20 sm:max-w-[240px]">
            {/* Mobile compact telemetry pill (avoids covering map pin) */}
            <div className="sm:hidden surface-card px-3 py-1.5 backdrop-blur-xl border-white/[0.12] shadow-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold text-white text-[11px]">Alex · 22 km/h</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                GPS ±4m · 88% ⚡
              </span>
            </div>

            {/* Desktop / Tablet expanded telemetry box */}
            <div className="hidden sm:block surface-card p-3.5 backdrop-blur-xl border-white/[0.1] shadow-xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Device Stream</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Battery</span>
                  <span className="text-white font-medium">88% ⚡</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Satellites</span>
                  <span className="text-white font-medium">9 locked (±4m)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Speed</span>
                  <span className="text-indigo-300 font-semibold">22 km/h</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hardware Mode</span>
                  <span className="text-emerald-400 font-semibold">High-Precision GPS</span>
                </div>
              </div>
            </div>
          </div>

          {/* HUD OVERLAY 2: Bottom-Left Address Bar (Tablet/Desktop) */}
          <div className="absolute bottom-4 left-4 z-20 max-w-[260px] sm:max-w-[320px] hidden sm:block">
            <div className="surface-card p-3 backdrop-blur-xl border-white/[0.1] shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                📍 Reverse Geocoded Pinpoint
              </p>
              <p className="text-xs font-semibold text-white leading-snug truncate">
                452 Market Street, Financial District
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                37.7891° N, 122.4014° W · Updated 2s ago
              </p>
            </div>
          </div>

          {/* ── OVERLAID RECIPIENT PHONE MOCKUP (Desktop / Tablet absolute overlay) ── */}
          <div className="hidden sm:block absolute right-6 bottom-6 z-30 w-[270px] lg:w-[290px] transition-all">
            <div className="rounded-2xl border-2 border-indigo-400/40 bg-[#0c0f1c]/95 shadow-2xl p-4 backdrop-blur-2xl ring-1 ring-white/10">
              
              {/* Recipient Card Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📱</span>
                  <div>
                    <p className="text-[11px] font-bold text-white leading-none">Recipient's Phone</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Opens in Safari / Chrome</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  No App
                </span>
              </div>

              {/* Message Simulation */}
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3 text-left">
                <p className="text-[10px] text-slate-400 leading-snug">
                  <span className="text-indigo-400 font-semibold">Incoming Request:</span> "Dad is requesting your live location for safe arrival."
                </p>
              </div>

              {/* Instant Browser Consent Button */}
              <div className="space-y-1.5">
                <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-default">
                  <span>📍</span>
                  <span>Allow Location (1-Tap)</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors">
                    or decline request
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-medium">
                <span className="text-emerald-400">🔒</span>
                <span>Browser permission only · Revoke anytime</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── MOBILE-DEDICATED RECIPIENT PHONE CARD (Stacked cleanly on mobile screens) ── */}
        <div className="sm:hidden p-3.5 bg-black/40 border-t border-white/[0.08]">
          <div className="rounded-2xl border border-indigo-400/35 bg-[#0c0f1c] p-3.5 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📱</span>
                <span className="text-xs font-bold text-white">Recipient View: 1-Tap Browser Consent</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0 Apps
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2.5">
              Contact opens link in Safari or Chrome and taps:
            </p>
            <div className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25">
              <span>📍</span>
              <span>Allow Location (1-Tap)</span>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              🔒 Encrypted peer-to-peer stream · Stops when tab closes
            </p>
          </div>
        </div>

        {/* Bottom Banner Explaining The 2-Way Mechanics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07] bg-white/[0.02] border-t border-white/[0.08] text-center text-xs">
          <div className="p-3 sm:p-3.5 flex items-center justify-center gap-2">
            <span className="text-indigo-400 font-bold">Step 1:</span>
            <span className="text-slate-300">You generate an encrypted tracking link</span>
          </div>
          <div className="p-3 sm:p-3.5 flex items-center justify-center gap-2">
            <span className="text-purple-400 font-bold">Step 2:</span>
            <span className="text-slate-300">Recipient taps "Allow" in mobile browser</span>
          </div>
          <div className="p-3 sm:p-3.5 flex items-center justify-center gap-2">
            <span className="text-emerald-400 font-bold">Step 3:</span>
            <span className="text-slate-300">Live GPS streams to your map in &lt;1s</span>
          </div>
        </div>

      </div>

      {/* Caption directly addressing the 5-second test */}
      <p className="text-center text-xs text-slate-500 mt-3">
        Interactive preview · Works instantly on iOS (Safari), Android (Chrome), and any web browser.
      </p>
    </div>
  );
};

export default HeroProductVisual;
