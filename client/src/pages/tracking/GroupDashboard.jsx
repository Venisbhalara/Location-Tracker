import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserGroups, deleteGroup } from "../../services/api";
import toast from "react-hot-toast";
import CreateGroupModal from "../../components/tracking/CreateGroupModal";
import AmbientBackground from "../../components/common/AmbientBackground";

const GroupDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getUserGroups();
      setGroups(res.data.groups);
    } catch {
      toast.error("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete group "${name}" and all associated member sessions?`)) return;
    try {
      await deleteGroup(id);
      toast.success("Group deleted.");
      load();
    } catch {
      toast.error("Failed to delete group.");
    }
  };

  const isExpired = (expiresAt) => expiresAt && new Date() > new Date(expiresAt);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <AmbientBackground />
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AmbientBackground />

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 pb-8 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 eyebrow-pill mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Multi-Target Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Group Tracking
          </h1>
          <p className="text-slate-400 text-sm">
            Monitor family members, field staff, or meetups on a single shared map.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="btn-cta-secondary px-4 py-2.5 text-xs font-semibold"
          >
            ← Dashboard
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-cta-primary px-5 py-2.5 text-sm font-semibold shadow-md whitespace-nowrap"
          >
            <span className="mr-1.5 text-base leading-none">+</span> New Group
          </button>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: "Total Groups", value: groups.length, icon: "👥", color: "text-white" },
          { label: "Active Groups", value: groups.filter(g => g.status === "active" && !isExpired(g.expiresAt)).length, icon: "🟢", color: "text-emerald-400" },
          { label: "Online Members", value: groups.reduce((acc, g) => acc + (g.activeMembers || 0), 0), icon: "📡", color: "text-indigo-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="surface-card p-6 rounded-2xl border-white/[0.08] flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── GROUPS LIST ── */}
      {groups.length === 0 ? (
        <div className="surface-card text-center py-20 px-4 rounded-3xl border-white/[0.08]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl mb-4">
            👥
          </div>
          <h2 className="text-lg font-bold text-white mb-1">No groups created yet</h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Create a tracking group to send separate links to family or team members and view them together.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-cta-primary px-6 py-2.5 text-xs font-semibold">
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
                className="surface-card p-6 rounded-3xl border-white/[0.08] hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      expired
                        ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-slate-400" : "bg-emerald-400 animate-pulse"}`} />
                      {expired ? "Expired" : "Active Group"}
                    </span>

                    <span className="text-xs text-slate-500">
                      {group.memberCount} members
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1 truncate">{group.name}</h3>
                  {group.description && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{group.description}</p>
                  )}

                  {/* Member Color Dots */}
                  <div className="flex items-center gap-1.5 my-4">
                    {group.members.map((m) => (
                      <div
                        key={m.id}
                        title={m.label}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border border-black/30 shadow-sm"
                        style={{ background: m.color }}
                      >
                        {m.label?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length === 0 && (
                      <span className="text-xs text-slate-500">No members added yet</span>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-white/[0.06] flex items-center gap-2">
                  {!expired && (
                    <Link
                      to={`/groups/${group.id}/map`}
                      className="btn-cta-primary flex-1 py-2.5 text-xs font-semibold text-center"
                    >
                      Open Map →
                    </Link>
                  )}
                  <Link
                    to={`/groups/${group.id}`}
                    className="btn-cta-secondary flex-1 py-2.5 text-xs font-semibold text-center"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(group.id, group.name)}
                    className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
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
};

export default GroupDashboard;
