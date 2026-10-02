import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserTrackings, deleteTracking } from "../../services/api";
import toast from "react-hot-toast";
import AmbientBackground from "../../components/common/AmbientBackground";

const statusBadge = (status) => {
  const map = {
    active: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-300",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400 animate-pulse",
      label: "Active",
    },
    pending: {
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
      label: "Pending",
    },
    expired: {
      bg: "bg-slate-500/15",
      text: "text-slate-400",
      border: "border-slate-500/25",
      dot: "bg-slate-500",
      label: "Expired",
    },
  };
  const s = map[status] || map.expired;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [tRes] = await Promise.all([getUserTrackings({ limit: 50 })]);
      setTrackings(Array.isArray(tRes?.data?.trackings) ? tRes.data.trackings : []);
    } catch {
      toast.error("Failed to load dashboard data.");
      setTrackings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this tracking link?")) return;
    try {
      await deleteTracking(id);
      toast.success("Tracking link deleted.");
      load();
    } catch {
      toast.error("Failed to delete tracking.");
    }
  };

  const copyShareLink = (token) => {
    const fullUrl = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Tracking link copied to clipboard!");
  };

  const safeTrackings = Array.isArray(trackings) ? trackings : [];
  const activeCount = safeTrackings.filter((t) => t.status === "active").length;
  const pendingCount = safeTrackings.filter((t) => t.status === "pending").length;
  const expiredCount = safeTrackings.filter((t) => t.status === "expired").length;

  if (loading)
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <AmbientBackground />
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AmbientBackground />

      {/* ── HEADER & PRIMARY ACTIONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Telemetry Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor real-time GPS connections, available slots, and tracking sessions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/20 transition-all focus:outline-none"
            title="Refresh trackings"
            aria-label="Refresh dashboard data"
          >
            <svg 
              className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <Link
            to="/tracking/create"
            className="btn-cta-primary px-5 py-2.5 text-sm font-semibold shadow-md whitespace-nowrap"
          >
            <span className="mr-1.5 text-base leading-none">+</span> New Tracking Link
          </Link>
        </div>
      </div>

      {/* ── METRICS HIERARCHY ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Metric 1: Available Slots (PRIMARY HIGHLIGHT) */}
        <div className="surface-elevated p-6 rounded-2xl border-indigo-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Available Slots
            </span>
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-bold">
              💳
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-4xl font-extrabold text-white tracking-tight">
              {user?.trackingBalance || 0}
            </div>
            <Link
              to="/pricing"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Recharge +
            </Link>
          </div>
        </div>

        {/* Metric 2: Active Trackings (PRIMARY OPERATIONAL STATUS) */}
        <div className="surface-card p-6 rounded-2xl border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Active Sessions
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold">
              📡
            </span>
          </div>
          <div className="text-4xl font-extrabold text-emerald-400 tracking-tight">
            {activeCount}
          </div>
        </div>

        {/* Metric 3: Pending Links */}
        <div className="surface-card p-6 rounded-2xl border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Pending Permission
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-sm font-bold">
              ⏳
            </span>
          </div>
          <div className="text-4xl font-extrabold text-slate-200 tracking-tight">
            {pendingCount}
          </div>
        </div>

        {/* Metric 4: Expired Links */}
        <div className="surface-card p-6 rounded-2xl border-white/[0.08] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Expired History
            </span>
            <span className="w-8 h-8 rounded-lg bg-white/[0.04] text-slate-400 flex items-center justify-center text-sm font-bold">
              🗂️
            </span>
          </div>
          <div className="text-4xl font-extrabold text-slate-400 tracking-tight">
            {expiredCount}
          </div>
        </div>

      </div>

      {/* ── GROUP TRACKING PROMOTION CALLOUT ── */}
      <div className="surface-card p-6 sm:p-7 rounded-2xl border-indigo-500/25 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div>
            <h2 className="text-base font-bold text-white mb-1">Group Telemetry &amp; Multi-Person Mapping</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Track family members, sports groups, or field teams simultaneously on a single shared live map.
            </p>
          </div>
        </div>
        <Link
          to="/groups"
          className="btn-cta-secondary px-5 py-2.5 text-xs font-semibold whitespace-nowrap"
        >
          Manage Groups →
        </Link>
      </div>

      {/* ── RECENT TRACKINGS TABLE HIERARCHY ── */}
      <div className="surface-card rounded-2xl border-white/[0.08] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
          <div>
            <h2 className="text-base font-bold text-white">Tracking Sessions</h2>
            <p className="text-xs text-slate-400">All links created by your account</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-slate-300">
            {safeTrackings.length} Total
          </span>
        </div>

        {safeTrackings.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl mb-4">
              📭
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No tracking links yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Create your first secure tracking link and share it with your contact to view their live GPS position.
            </p>
            <Link to="/tracking/create" className="btn-cta-primary px-6 py-2.5 text-xs font-semibold">
              Generate Tracking Link
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto nice-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.01]">
                <tr>
                  <th className="px-6 py-3.5">Recipient / Label</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 hidden sm:table-cell">Expires</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {safeTrackings.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Recipient */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300 font-bold text-xs">
                          {t.label ? t.label.charAt(0).toUpperCase() : "#"}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {t.label || "Direct Tracking Link"}
                          </div>
                          {t.phoneNumber && (
                            <div className="text-slate-500 text-xs font-mono mt-0.5">
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
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 hidden sm:table-cell text-xs">
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
                            onClick={() => copyShareLink(t.token)}
                            className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.02] transition-colors"
                            title="Copy link"
                          >
                            Copy
                          </button>
                        )}

                        {/* Primary Action: View Map */}
                        {t.status === "active" ? (
                          <Link
                            to={`/tracking/map/${t.token}`}
                            className="btn-cta-primary px-3 py-1.5 text-xs font-semibold shadow-sm"
                          >
                            Live Map →
                          </Link>
                        ) : t.status === "pending" ? (
                          <Link
                            to={`/tracking/map/${t.token}`}
                            className="px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 text-xs font-medium transition-colors"
                          >
                            Open Map
                          </Link>
                        ) : null}

                        {/* Destructive Action */}
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-2 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete session"
                        >
                          ✕
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
