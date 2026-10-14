import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserGroups, deleteGroup } from "../../services/api";
import toast from "react-hot-toast";
import CreateGroupModal from "../../components/tracking/CreateGroupModal";

const isExpired = (expiresAt) => expiresAt && new Date() > new Date(expiresAt);

const GroupDashboard = memo(() => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await getUserGroups();
      if (isMountedRef.current) setGroups(res.data.groups);
    } catch {
      if (isMountedRef.current) toast.error("Failed to load groups.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = useCallback(async (id, name) => {
    if (!confirm(`Delete group "${name}" and all associated member sessions?`)) return;
    try {
      await deleteGroup(id);
      toast.success("Group deleted.");
      load();
    } catch {
      toast.error("Failed to delete group.");
    }
  }, [load]);

  const metrics = useMemo(() => [
    { label: "Total Groups", value: groups.length, icon: "👥", color: "text-stone-900" },
    { label: "Active Groups", value: groups.filter(g => g.status === "active" && !isExpired(g.expiresAt)).length, icon: "🟢", color: "text-emerald-700" },
    { label: "Online Members", value: groups.reduce((acc, g) => acc + (g.activeMembers || 0), 0), icon: "📡", color: "text-stone-800" },
  ], [groups]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(group) => {
            setShowCreate(false);
            toast.success(`Group "${group.name}" created!`);
            navigate(`/groups/${group.id}`);
          }}
        />
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pb-8 border-b border-[#e7e0d3]">
        <div>
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
            <span>Multi-Target Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight mb-2 font-serif">
            Group Tracking
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">
            Monitor family members, field dispatch, or logistics crews on a unified real-time map.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="btn-cta-secondary px-4 py-2.5 text-xs font-semibold"
          >
            ← Back to Cockpit
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-cta-primary px-5 py-2.5 text-xs font-semibold shadow-xs whitespace-nowrap"
          >
            <span className="mr-1.5 text-base leading-none">+</span> New Group
          </button>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {metrics.map((s) => (
          <div
            key={s.label}
            className="surface-card p-6 rounded-2xl border border-[#e7e0d3] flex items-center justify-between shadow-xs"
          >
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ece6da] border border-[#ded7ca] flex items-center justify-center text-2xl shadow-inner">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── GROUPS LIST ── */}
      {groups.length === 0 ? (
        <div className="surface-card text-center py-20 px-4 rounded-3xl border border-[#e7e0d3] shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ece6da] border border-[#ded7ca] flex items-center justify-center text-3xl mb-4 shadow-inner">
            👥
          </div>
          <h2 className="text-lg font-bold text-stone-900 mb-1 font-serif">No groups created yet</h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-sm mx-auto leading-relaxed">
            Create a tracking group to send individualized links to family or team members and observe their live coordinates together.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-cta-primary px-6 py-2.5 text-xs font-semibold shadow-xs"
          >
            Create First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => {
            const expired = isExpired(group.expiresAt);

            return (
              <div
                key={group.id}
                className="surface-card p-6 rounded-2xl border border-[#e7e0d3] hover:border-stone-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      expired
                        ? "bg-stone-100 text-stone-500 border-stone-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-stone-400" : "bg-emerald-600 animate-pulse"}`} />
                      {expired ? "Expired" : "Active Group"}
                    </span>

                    <span className="text-xs text-stone-500 font-medium">
                      {group.memberCount} members
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-1 truncate font-serif">{group.name}</h3>
                  {group.description && (
                    <p className="text-xs text-stone-600 mb-4 line-clamp-2 leading-relaxed">{group.description}</p>
                  )}

                  {/* Member Color Dots */}
                  <div className="flex items-center gap-1.5 my-4">
                    {group.members.map((m) => (
                      <div
                        key={m.id}
                        title={m.label}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-xs"
                        style={{ background: m.color }}
                      >
                        {m.label?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length === 0 && (
                      <span className="text-xs text-stone-400 italic">No members assigned yet</span>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-[#e7e0d3] flex items-center gap-2">
                  {!expired && (
                    <Link
                      to={`/groups/${group.id}/map`}
                      className="btn-cta-primary flex-1 py-2 text-xs font-semibold text-center justify-center shadow-xs"
                    >
                      Open Map →
                    </Link>
                  )}
                  <Link
                    to={`/groups/${group.id}`}
                    className="btn-cta-secondary flex-1 py-2 text-xs font-semibold text-center justify-center"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(group.id, group.name)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                    title="Delete group"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default GroupDashboard;
