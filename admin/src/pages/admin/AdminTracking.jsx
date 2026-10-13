import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import {
  getAdminTrackingSessions,
  deleteAdminTrackingSession,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/common/LoadingScreen";

// Helper function to calculate human-readable time elapsed
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " seconds ago";
};

const AdminTracking = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const fetchSessions = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const res = await getAdminTrackingSessions();
      setSessions(res.data);
      if (isAuto)
        toast.success("Live telemetry updated", {
          id: "tracking-refresh",
          duration: 2000,
          position: "top-right",
        });
    } catch {
      toast.error("Failed to fetch tracking sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    const interval = setInterval(() => {
      fetchSessions(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "WARNING: Forcibly terminate this live telemetry session? The connection will be dropped immediately.",
      )
    ) {
      return;
    }
    try {
      await deleteAdminTrackingSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success("Session terminated.");
    } catch {
      toast.error("Failed to delete tracking session.");
    }
  };

  const openMap = (token) => {
    navigate(`/admin/tracking/map/${token}`);
  };

  if (loading) return <LoadingScreen />;

  const filteredSessions = sessions.filter(
    (s) => filter === "all" || s.status === filter,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-stone-900">
      <BackButton />
      
      <div className="mb-8 pb-4 border-b border-[#e7e0d3]">
        <div className="inline-flex items-center gap-2 eyebrow-pill mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          <span>Active Telemetry Matrix</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif tracking-tight">
          Global Telemetry Sessions
        </h1>
        <p className="text-stone-500 mt-1 text-xs sm:text-sm">
          Real-time oversight of geocoordinate payloads streamed through active WebSocket pipelines.
        </p>
      </div>

      <div className="surface-card border border-[#ded7ca] rounded-2xl p-4 mb-6 flex justify-between items-center shadow-xs bg-white">
        <div className="flex bg-[#ece6da] p-1 rounded-xl border border-[#ded7ca]">
          {["all", "active", "pending"].map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === state
                  ? "bg-white text-stone-900 shadow-xs border border-[#ded7ca]"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
              {state === "active" &&
                sessions.some((s) => s.status === "active") && (
                  <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {sessions.filter((s) => s.status === "active").length}
                  </span>
                )}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-2xl shadow-xs border border-[#ded7ca] overflow-hidden bg-white">
        <div className="overflow-x-auto nice-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f7f4ed] border-b border-[#e7e0d3] text-stone-600 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">Broadcaster / Owner</th>
                <th className="px-5 py-3.5">Session Descriptor</th>
                <th className="px-5 py-3.5">Target Contact</th>
                <th className="px-5 py-3.5">Telemetry Coordinates</th>
                <th className="px-5 py-3.5">Latest Sync</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e0d3]">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-14 text-center text-stone-500 italic"
                  >
                    <div className="text-3xl mb-2">📡</div>
                    No active telemetry sessions matching this filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-[#fcfaf6] transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">
                        {session.user?.name}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {session.user?.email}
                      </div>
                    </td>

                    {/* Label */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-stone-800">
                        {session.label || (
                          <span className="text-stone-400 font-normal italic text-xs">
                            Unlabeled Session
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Target Contact */}
                    <td className="px-5 py-3.5 font-mono text-xs text-stone-700">
                      <div>📱 {session.phoneNumber}</div>
                      <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
                        {session.trackingType} Mode
                      </div>
                    </td>

                    {/* Status & Metrics */}
                    <td className="px-5 py-3.5">
                      {session.status === "active" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            Active Stream
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                          <span className="text-xs font-medium text-amber-800">
                            Awaiting Consent
                          </span>
                        </div>
                      )}

                      {session.status === "active" && session.latitude && (
                        <div className="mt-1 text-[11px] font-mono text-stone-600 bg-[#f7f4ed] border border-[#e7e0d3] px-2 py-0.5 rounded-lg inline-block">
                          {parseFloat(session.latitude).toFixed(4)}, {parseFloat(session.longitude).toFixed(4)}
                        </div>
                      )}
                    </td>

                    {/* Live State (Time) */}
                    <td className="px-5 py-3.5 text-xs text-stone-600 font-mono">
                      {timeAgo(session.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openMap(session.token)}
                          className="btn-cta-secondary px-3 py-1 text-xs font-semibold"
                          title="Open Live Tracker UI"
                        >
                          🗺️ Map
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="btn-danger px-3 py-1 text-xs font-semibold"
                          title="Terminate Session"
                        >
                          ✕ Terminate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTracking;
