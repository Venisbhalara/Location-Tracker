import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserTrackings, deleteTracking } from "../../services/api";
import toast from "react-hot-toast";

const statusBadge = (status) => {
  const map = {
    active: {
      bg: "bg-[#edf7f1]",
      text: "text-[#23684a]",
      border: "border-[#c4e8d3]",
      dot: "bg-[#2e7d5b] animate-pulse",
      label: "Active",
    },
    pending: {
      bg: "bg-[#fdf6e9]",
      text: "text-[#8f5a10]",
      border: "border-[#f5dfb8]",
      dot: "bg-[#a36814]",
      label: "Pending",
    },
    expired: {
      bg: "bg-[#f2eee6]",
      text: "text-[#7a766e]",
      border: "border-[#dfd8cc]",
      dot: "bg-[#9c978c]",
      label: "Expired",
    },
  };
  const s = map[status] || map.expired;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const TrackingRow = memo(({ tracking: t, onCopy, onDelete }) => (
  <tr className="hover:bg-stone-50/60 transition-colors group">
    {/* Recipient */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
          {t.label ? t.label.charAt(0).toUpperCase() : "#"}
        </div>
        <div>
          <div className="text-stone-900 font-semibold text-sm">
            {t.label || "Direct Tracking Link"}
          </div>
          {t.phoneNumber && (
            <div className="text-stone-500 text-xs font-mono mt-0.5">
              {t.phoneNumber}
            </div>
          )}
        </div>
      </div>
    </td>

    {/* Status */}
    <td className="px-6 py-4 whitespace-nowrap">
      {statusBadge(t.status)}
    </td>

    {/* Expiration */}
    <td className="px-6 py-4 whitespace-nowrap text-stone-500 hidden sm:table-cell text-xs">
      {new Date(t.expiresAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </td>

    {/* Actions */}
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="flex items-center justify-end gap-2">
        {/* Copy Link Utility */}
        {t.status !== "expired" && (
          <button
            onClick={() => onCopy(t.token)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 shadow-2xs transition-colors"
            title="Copy link"
          >
            Copy
          </button>
        )}

        {/* Primary Action: View Map */}
        {t.status === "active" ? (
          <Link
            to={`/tracking/map/${t.token}`}
            className="btn-cta-primary px-3 py-1.5 text-xs font-semibold shadow-xs"
          >
            Live Map →
          </Link>
        ) : t.status === "pending" ? (
          <Link
            to={`/tracking/map/${t.token}`}
            className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium transition-colors"
          >
            Open Map
          </Link>
        ) : null}

        {/* Destructive Action */}
        <button
          onClick={() => onDelete(t.id)}
          className="px-2 py-1.5 text-xs text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Delete session"
        >
          ✕
        </button>
      </div>
    </td>
  </tr>
));

const Dashboard = memo(() => {
  const { user } = useAuth();
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [tRes] = await Promise.all([getUserTrackings({ limit: 50 })]);
      if (isMountedRef.current) {
        setTrackings(
          Array.isArray(tRes?.data?.trackings) ? tRes.data.trackings : [],
        );
      }
    } catch {
      if (isMountedRef.current) {
        toast.error("Failed to load dashboard data.");
        setTrackings([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Are you sure you want to delete this tracking link?")) return;
    try {
      await deleteTracking(id);
      toast.success("Tracking link deleted.");
      load();
    } catch {
      toast.error("Failed to delete tracking.");
    }
  }, [load]);

  const copyShareLink = useCallback((token) => {
    const fullUrl = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Tracking link copied to clipboard!");
  }, []);

  const safeTrackings = useMemo(
    () => (Array.isArray(trackings) ? trackings : []),
    [trackings]
  );
  const { activeCount, pendingCount, expiredCount } = useMemo(() => {
    let active = 0;
    let pending = 0;
    let expired = 0;
    for (const t of safeTrackings) {
      if (t.status === "active") active++;
      else if (t.status === "pending") pending++;
      else if (t.status === "expired") expired++;
    }
    return { activeCount: active, pendingCount: pending, expiredCount: expired };
  }, [safeTrackings]);

  if (loading)
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── HEADER & PRIMARY ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 pb-6 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mb-1.5">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-stone-600 text-sm">
            Monitor real-time GPS connections, available slots, and active
            tracking sessions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-xs transition-all focus:outline-none"
            title="Refresh trackings"
            aria-label="Refresh dashboard data"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <Link
            to="/tracking/create"
            className="btn-cta-primary px-5 py-2.5 text-sm font-semibold shadow-xs whitespace-nowrap"
          >
            <span className="mr-1.5 text-base leading-none">+</span> New
            Tracking Link
          </Link>
        </div>
      </div>

      {/* ── METRICS HIERARCHY ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Metric 1: Available Slots */}
        <div className="surface-elevated p-5 sm:p-6 rounded-2xl border-stone-200/90 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Available Slots
            </span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
              💳
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {user?.trackingBalance || 0}
            </div>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Recharge +
            </Link>
          </div>
        </div>

        {/* Metric 2: Active Trackings */}
        <div className="surface-card p-5 sm:p-6 rounded-2xl border-stone-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Active Sessions
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
              📡
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
            {activeCount}
          </div>
        </div>

        {/* Metric 3: Pending Links */}
        <div className="surface-card p-5 sm:p-6 rounded-2xl border-stone-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Permission
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
              ⏳
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-800 tracking-tight">
            {pendingCount}
          </div>
        </div>

        {/* Metric 4: Expired Links */}
        <div className="surface-card p-5 sm:p-6 rounded-2xl border-stone-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Expired History
            </span>
            <span className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center text-sm font-bold">
              🗂️
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-stone-600 tracking-tight">
            {expiredCount}
          </div>
        </div>
      </div>

      {/* ── GROUP TRACKING PROMOTION CALLOUT ── */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border-stone-200/90 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-white shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 mb-0.5">
              Group Telemetry &amp; Multi-Person Mapping
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Track family members, sports groups, or field teams simultaneously
              on a single shared live map.
            </p>
          </div>
        </div>
        <Link
          to="/groups"
          className="btn-cta-secondary px-4 py-2.5 text-xs font-semibold whitespace-nowrap shadow-xs"
        >
          Manage Groups →
        </Link>
      </div>

      {/* ── RECENT TRACKINGS TABLE HIERARCHY ── */}
      <div className="surface-card rounded-2xl border-stone-200/90 overflow-hidden shadow-xs">
        <div className="px-6 py-4.5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Tracking Sessions
            </h2>
            <p className="text-xs text-stone-500">
              All links created by your account
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 shadow-2xs">
            {safeTrackings.length} Total
          </span>
        </div>

        {safeTrackings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center text-2xl mb-3 shadow-xs">
              📭
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              No tracking links yet
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-5 max-w-sm mx-auto">
              Create your first secure tracking link and share it with your
              contact to view their live GPS position.
            </p>
            <Link
              to="/tracking/create"
              className="btn-cta-primary px-6 py-2.5 text-xs font-semibold shadow-xs"
            >
              Generate Tracking Link
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto nice-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 bg-stone-50/40">
                <tr>
                  <th className="px-6 py-3.5">Recipient / Label</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 hidden sm:table-cell">Expires</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {safeTrackings.map((t) => (
                  <TrackingRow
                    key={t.id}
                    tracking={t}
                    onCopy={copyShareLink}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

export default Dashboard;
