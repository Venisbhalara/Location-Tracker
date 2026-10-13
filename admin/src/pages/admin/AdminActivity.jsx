import { useState, useEffect, useRef, useCallback, memo, Component } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { getAdminAnalytics } from "../../services/api";
import {
  Users, Zap, Activity, Radio, ArrowUp, ArrowDown,
  X, Volume2, VolumeX, AlertTriangle, ChevronRight, BarChart2,
  Calendar, Globe, RefreshCw,
} from "lucide-react";

import { UserJourney } from "../../components/UserJourney";

// ─── Constants ────────────────────────────────────────────────────────────────
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO2 → numeric id (subset for react-simple-maps world-atlas)
const ISO2_TO_NUMERIC = {
  IN: "356", US: "840", GB: "826", AU: "036", DE: "276",
  FR: "250", CA: "124", BR: "076", JP: "392", CN: "156",
  SG: "702", RU: "643", ZA: "710", MX: "484", IT: "380",
  ES: "724", ID: "360", KR: "410", TR: "792", AE: "784",
  PK: "586", BD: "050", EG: "818", NG: "566", AR: "032",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-[#f0eae1] rounded-2xl ${className}`} />
);

// ─── Animated Counter ─────────────────────────────────────────────────────────
const useCounter = (end, duration = 1800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const AnimCounter = memo(({ value }) => {
  const n = useCounter(value);
  return <span>{n.toLocaleString()}</span>;
});

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = "#1c1b18" }) => {
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => `${data.length > 1 ? (i / (data.length - 1)) * 60 : 30},${20 - (v / max) * 18}`)
    .join(" ");
  return (
    <svg width={60} height={22} viewBox="0 0 60 22">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, change, sparkData, pulse }) => {
  const positive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-[#ded7ca] rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:border-[#b8afa0] transition-all relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#f0eae1] border border-[#ded7ca]">
          <Icon size={16} className="text-[#1c1b18]" />
        </div>
        {pulse && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2d7a4f]/10 border border-[#2d7a4f]/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2d7a4f] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2d7a4f]" />
            </span>
            <span className="text-[9px] font-bold text-[#2d7a4f] tracking-wider font-mono">LIVE</span>
          </span>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl font-serif text-[#1c1b18] tracking-tight">
          <AnimCounter value={value} />
        </div>
        <div className="text-xs text-[#6e685f] mt-1 font-medium">{title}</div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10 pt-1 border-t border-[#f0eae1]">
        <div
          className={`flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
            positive ? "bg-[#2d7a4f]/10 text-[#2d7a4f]" : "bg-[#c84032]/10 text-[#c84032]"
          }`}
        >
          {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(change)}%
        </div>
        <Sparkline data={sparkData} color="#1c1b18" />
      </div>
    </motion.div>
  );
};

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const signups = payload.find(p => p.dataKey === "signups")?.value ?? 0;
  const tracking = payload.find(p => p.dataKey === "trackingRequests")?.value ?? 0;
  return (
    <div className="bg-white border border-[#ded7ca] rounded-xl p-3 shadow-xl text-xs font-sans min-w-[160px]">
      <div className="text-[#6e685f] font-semibold mb-2">{label}</div>
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1c1b18]" />
          <span className="text-[#6e685f]">Signups:</span>
        </div>
        <span className="text-[#1c1b18] font-bold font-mono">{signups}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#8c8273]" />
          <span className="text-[#6e685f]">Tracking:</span>
        </div>
        <span className="text-[#1c1b18] font-bold font-mono">{tracking}</span>
      </div>
    </div>
  );
};

// ─── Live Event Row ───────────────────────────────────────────────────────────
const relTime = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 5)   return "just now";
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const typeConfig = {
  signup:       { color: "#2d7a4f", label: "New Signup",  dot: "#2d7a4f" },
  login:        { color: "#1c1b18", label: "Login",        dot: "#1c1b18" },
  failed_login: { color: "#c84032", label: "Failed Login", dot: "#c84032" },
  tracking:     { color: "#8c8273", label: "Tracking",     dot: "#8c8273" },
};

const LiveRow = memo(({ event }) => {
  const cfg = typeConfig[event.type] || typeConfig.login;
  const [ts, setTs] = useState(relTime(event.time || event.createdAt));
  useEffect(() => {
    const t = setInterval(() => setTs(relTime(event.time || event.createdAt)), 10000);
    return () => clearInterval(t);
  }, [event]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf6f0] border-b border-[#f0eae1] transition-colors"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: cfg.dot }} />
      </span>
      <span className="text-[11px] text-[#9c9489] font-mono w-14 shrink-0">{ts}</span>
      <span className="text-xs font-semibold text-[#1c1b18] w-24 shrink-0 truncate">{event.label || cfg.label}</span>
      <span className="text-xs text-[#6e685f] flex-1 truncate">{event.detail1 || "—"}</span>
    </motion.div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminActivity = () => {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [range, setRange]         = useState("7");
  const [customRange, setCustomRange] = useState(false);
  const [liveEvents, setLiveEvents]   = useState([]);
  const [dismissed, setDismissed]     = useState([]);
  const [soundOn, setSoundOn]         = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const audioCtx = useRef(null);
  const socketRef = useRef(null);

  // ── Fetch analytics ────────────────────────────────────────────────────────
  const fetchData = useCallback(async (r, isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await getAdminAnalytics(r);
      setData(res.data);
      setLiveEvents(
        (res.data.liveEvents || []).map(e => ({
          ...e,
          time: e.createdAt || e.time,
        }))
      );
      if (isAuto) toast.success("Activity ledger synchronized", { id: 'activity-refresh', duration: 2000 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(range); 
    
    // Auto-refresh every 15 seconds in background
    const interval = setInterval(() => {
      fetchData(range, true);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [range, fetchData]);

  // ── Socket live feed ───────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join-admin-global");
      setIsConnected(true);
    });
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("live-activity", (event) => {
      setLiveEvents(prev => [{ ...event, time: event.time || new Date().toISOString() }, ...prev].slice(0, 50));
      if (soundOn) playPing();
    });
    return () => { socket.disconnect(); };
  }, [soundOn]);

  // ── ping sound ─────────────────────────────────────────────────────────────
  const playPing = () => {
    try {
      const ctx = audioCtx.current || (audioCtx.current = new (window.AudioContext || window.webkitAudioContext)());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const stats       = data?.stats        || {};
  const chartData   = data?.chartData    || [];
  const geoData     = data?.geoData      || [];
  const funnel      = data?.funnel       || [];
  const anomalies   = (data?.anomalies   || []).filter(a => !dismissed.includes(a.message));

  const journeyColors = ["#1c1b18", "#454035", "#6e685f", "#9c9489"];
  const journeyData = funnel.map((step, i) => {
    const prev = i > 0 ? funnel[i - 1].count : step.count;
    const drop = prev > 0 ? Math.round((1 - step.count / prev) * 100) : 0;
    
    let status = null;
    let dropStr = null;
    let positive = false;

    if (i === 0) {
      status = "100% baseline";
      positive = true;
    } else if (i === funnel.length - 1) {
      status = "✓ fully retained";
      positive = true;
    } else {
      dropStr = drop > 0 ? `↓ ${drop}% drop-off` : null;
      positive = false;
    }

    return {
      step: step.stage,
      count: step.count,
      color: journeyColors[i % journeyColors.length],
      drop: dropStr,
      status: status,
      positive: positive
    };
  });

  // Build geo lookup
  const geoLookup = {};
  geoData.forEach(({ country, count }) => { geoLookup[ISO2_TO_NUMERIC[country] || ""] = count; });
  const maxGeo = Math.max(...geoData.map(g => g.count), 1);
  const geoScale = scaleLinear().domain([0, maxGeo]).range(["#e7e0d3", "#1c1b18"]);

  // Sparkline data from chartData
  const mkSpark = (key) => chartData.slice(-7).map(d => d[key] || 0);

  // Chart bar colors
  const SIGNUP_COLOR   = "#1c1b18";
  const TRACKING_COLOR = "#8c8273";

  return (
    <div className="min-h-screen w-full bg-[#fcfaf6] text-[#1c1b18]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#f0eae1] text-[#6e685f] border border-[#ded7ca] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2d7a4f] animate-pulse"></span>
              Real-Time Platform Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#1c1b18] font-serif">
              Activity &amp; Diagnostics Report
            </h1>
            <p className="text-sm text-[#6e685f] mt-1">
              Geospatial telemetry, system event volume, and conversion funnel analytics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(range)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ded7ca] text-xs font-semibold uppercase tracking-wider text-[#1c1b18] hover:bg-[#faf6f0] rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Sync Ledger
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1b18] text-[#fcfaf6] text-xs font-semibold uppercase tracking-wider hover:bg-[#2b2a27] rounded-xl transition-all shadow-sm"
            >
              <ChevronRight size={13} className="rotate-180" />
              Control Center
            </Link>
          </div>
        </div>

        {/* ── ANOMALY BANNERS ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {anomalies.map(a => (
            <motion.div
              key={a.message}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#b45309]/30 bg-[#fef3c7] text-[#92400e] text-sm font-medium shadow-sm"
            >
              <AlertTriangle size={16} className="shrink-0 text-[#b45309] animate-pulse" />
              <span className="flex-1">{a.message}</span>
              <button
                onClick={() => setDismissed(p => [...p, a.message])}
                className="p-1 hover:bg-[#fde68a] rounded-lg transition-colors text-[#92400e]"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered User Base"
              value={stats.totalUsers || 0}
              icon={Users}
              change={stats.weeklyChange?.users || 0}
              sparkData={mkSpark("signups")}
            />
            <StatCard
              title="Today's Onboarding"
              value={stats.todaySignups || 0}
              icon={Zap}
              change={stats.weeklyChange?.signups || 0}
              sparkData={mkSpark("signups")}
            />
            <StatCard
              title="Tracking Requests Today"
              value={stats.todayTrackingRequests || 0}
              icon={Activity}
              change={stats.weeklyChange?.tracking || 0}
              sparkData={mkSpark("trackingRequests")}
            />
            <StatCard
              title="Active Telemetry Nodes"
              value={stats.activeNow || 0}
              icon={Radio}
              change={stats.weeklyChange?.activeNow || 0}
              sparkData={[1,1,2,1,3,2,stats.activeNow || 1]}
              pulse
            />
          </div>
        )}

        {/* ── MAIN CHART + LIVE FEED ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="xl:col-span-2 bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            {/* Chart toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-[#1c1b18]" />
                <span className="font-serif text-lg text-[#1c1b18]">Platform Throughput</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#fcfaf6] p-1 rounded-xl border border-[#ded7ca]">
                {[
                  { label: "7 Days", val: "7" },
                  { label: "30 Days", val: "30" },
                  { label: "90 Days", val: "90" },
                ].map(btn => (
                  <button
                    key={btn.val}
                    onClick={() => { setRange(btn.val); setCustomRange(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      range === btn.val && !customRange
                        ? "bg-[#1c1b18] text-[#fcfaf6] shadow-sm"
                        : "text-[#6e685f] hover:text-[#1c1b18]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
                <button
                  onClick={() => setCustomRange(v => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    customRange
                      ? "bg-[#1c1b18] text-[#fcfaf6] shadow-sm"
                      : "text-[#6e685f] hover:text-[#1c1b18]"
                  }`}
                >
                  <Calendar size={11} />
                  Custom
                </button>
              </div>
            </div>

            {/* Custom range input */}
            <AnimatePresence>
              {customRange && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-3 overflow-hidden py-1"
                >
                  <span className="text-xs text-[#6e685f]">Interval (Days):</span>
                  <input
                    type="number"
                    min={3} max={365} defaultValue={14}
                    className="w-20 bg-[#fcfaf6] border border-[#ded7ca] rounded-lg px-3 py-1 text-[#1c1b18] text-sm outline-none focus:border-[#1c1b18]"
                    onBlur={e => { setRange(String(e.target.value)); }}
                  />
                  <button
                    onClick={() => fetchData(range)}
                    className="px-3 py-1 bg-[#1c1b18] text-[#fcfaf6] text-xs font-semibold rounded-lg hover:bg-[#2b2a27] transition-colors"
                  >
                    Apply
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recharts dual bar */}
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0eae1"
                    />
                    <XAxis
                      dataKey={chartData.length > 14 ? "date" : "day"}
                      tick={{ fill: "#6e685f", fontSize: 11 }}
                      axisLine={{ stroke: "#ded7ca" }}
                      tickLine={false}
                      tickFormatter={v => chartData.length > 14 ? v.slice(5) : v}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: "#6e685f", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "#6e685f", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "#faf6f0" }} />
                    <Legend
                      formatter={(v) => (
                        <span style={{ color: "#6e685f", fontSize: 11, fontWeight: 500 }}>
                          {v === "signups" ? "User Signups" : "Tracking Requests"}
                        </span>
                      )}
                    />
                    <Bar yAxisId="left"  dataKey="signups"          name="signups"          fill={SIGNUP_COLOR}   radius={[4,4,0,0]} maxBarSize={24} isAnimationActive={true} animationDuration={600} />
                    <Bar yAxisId="right" dataKey="trackingRequests" name="trackingRequests"  fill={TRACKING_COLOR} radius={[4,4,0,0]} maxBarSize={24} isAnimationActive={true} animationDuration={600} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend info */}
            <div className="flex items-center gap-6 justify-center pt-2 border-t border-[#f0eae1]">
              <div className="flex items-center gap-2 text-xs text-[#6e685f]">
                <div className="w-3 h-3 rounded-sm bg-[#1c1b18]" />
                User Signups <span className="text-[#9c9489] font-mono">(left axis)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6e685f]">
                <div className="w-3 h-3 rounded-sm bg-[#8c8273]" />
                Tracking Beacons <span className="text-[#9c9489] font-mono">(right axis)</span>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-white border border-[#ded7ca] rounded-2xl overflow-hidden shadow-sm flex flex-col">
            {/* feed header */}
            <div className="px-5 py-4 border-b border-[#ded7ca] bg-[#faf6f0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-[#2d7a4f]" : "bg-[#c84032]"} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-[#2d7a4f]" : "bg-[#c84032]"}`} />
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1c1b18]">
                  {isConnected ? "Live Socket Feed" : "Connecting Socket..."}
                </span>
              </div>
              <button
                onClick={() => setSoundOn(v => !v)}
                className="p-1.5 rounded-lg border border-[#ded7ca] bg-white hover:bg-[#f0eae1] transition-colors text-[#6e685f]"
                title={soundOn ? "Mute telemetry chime" : "Enable telemetry chime"}
              >
                {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
            </div>

            {/* event list */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 340 }}>
              {loading ? (
                [...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 mx-3 my-2" />)
              ) : (
                <AnimatePresence initial={false}>
                  {liveEvents.length === 0 && (
                    <div className="text-center text-[#9c9489] text-xs py-12">Awaiting telemetry events…</div>
                  )}
                  {liveEvents.map((ev, i) => (
                    <LiveRow key={ev.id || i} event={ev} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* ── GEO MAP + FUNNEL ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Geo Map */}
          <div className="bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#1c1b18]" />
                <span className="font-serif text-lg text-[#1c1b18]">Geographic Origin Distribution</span>
              </div>
              <span className="text-xs font-mono text-[#6e685f]">{geoData.length} Territories</span>
            </div>
            
            {loading ? (
              <Skeleton className="h-60" />
            ) : (
              <>
                <div style={{ width: "100%", height: 240 }}>
                  <ComposableMap
                    projectionConfig={{ scale: 130 }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        (geographies || []).map(geo => {
                          const numId = geo.id;
                          const cnt = geoLookup[numId] || 0;
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={cnt > 0 ? geoScale(cnt) : "#f0eae1"}
                              stroke="#ded7ca"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: {
                                  fill: cnt > 0 ? "#1c1b18" : "#ded7ca",
                                  outline: "none",
                                  cursor: cnt > 0 ? "pointer" : "default",
                                },
                                pressed: { outline: "none" },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>
                </div>
                {/* Country legend */}
                {geoData.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-[#f0eae1]">
                    {geoData.slice(0, 6).map(g => (
                      <div key={g.country} className="flex items-center gap-1.5 bg-[#fcfaf6] border border-[#ded7ca] rounded-lg px-2.5 py-1 text-xs">
                        <span className="font-bold text-[#1c1b18]">{g.country}</span>
                        <span className="text-[#6e685f] font-mono">({g.count})</span>
                      </div>
                    ))}
                  </div>
                )}
                {geoData.length === 0 && (
                  <p className="text-center text-[#9c9489] text-xs mt-3">Awaiting IP geolocation payloads</p>
                )}
              </>
            )}
          </div>

          {/* User Journey Tracker */}
          {loading ? (
            <div className="bg-white border border-[#ded7ca] rounded-2xl p-7 shadow-sm">
              <Skeleton className="w-full h-12 mb-4" />
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="flex-1 h-16" />)}
              </div>
            </div>
          ) : (
            <UserJourney journeyData={journeyData} />
          )}
        </div>

        {/* ── ERROR ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl border border-[#c84032]/30 bg-[#fde8e7] text-[#c84032] text-sm px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fcfaf6] flex flex-col items-center justify-center p-8">
          <div className="bg-white border border-[#c84032]/30 rounded-2xl p-8 max-w-lg text-center shadow-lg">
            <h2 className="text-xl font-serif text-[#c84032] mb-2">Diagnostic Exception Detected</h2>
            <p className="text-xs text-[#6e685f] font-mono whitespace-pre-wrap mb-4">{this.state.error?.toString()}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#1c1b18] hover:bg-[#2b2a27] text-[#fcfaf6] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminActivityWrapper() {
  return (
    <ErrorBoundary>
      <AdminActivity />
    </ErrorBoundary>
  );
}
