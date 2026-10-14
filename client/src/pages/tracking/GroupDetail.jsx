import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getGroupDetails,
  addGroupMember,
  removeGroupMember,
} from "../../services/api";
import toast from "react-hot-toast";

const MEMBER_COLORS = ["#22c55e", "#38bdf8", "#f59e0b", "#fb7185", "#a78bfa"];

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ phoneNumber: "", label: "" });
  const [copiedToken, setCopiedToken] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await getGroupDetails(groupId);
      if (isMountedRef.current) setGroup(res.data.group);
    } catch {
      if (isMountedRef.current) toast.error("Failed to load group.");
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    setAdding(true);
    try {
      const res = await addGroupMember(groupId, {
        phoneNumber: form.phoneNumber.trim(),
        label: form.label.trim() || "Member",
      });
      toast.success(`${res.data.member.label} added! Balance: ${res.data.newBalance} credits`);
      setForm({ phoneNumber: "", label: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add member.";
      const code = err.response?.data?.code;
      if (code === "MAX_MEMBERS_REACHED") toast.error("Maximum 5 members reached!");
      else if (code === "INSUFFICIENT_BALANCE") toast.error("No tracking balance! Recharge first.");
      else toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberId, label) => {
    if (!confirm(`Remove "${label}" from the group?`)) return;
    try {
      await removeGroupMember(groupId, memberId);
      toast.success(`${label} removed.`);
      load();
    } catch {
      toast.error("Failed to remove member.");
    }
  };

  const copyLink = (token, memberId) => {
    const link = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(memberId);
    toast.success("Tracking link copied!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const isExpired = group?.expiresAt && new Date() > new Date(group.expiresAt);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Group not found.</p>
          <Link to="/groups" className="btn-cta-primary px-4 py-2 text-xs">
            ← Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-stone-500">
            <li>
              <Link to="/dashboard" className="hover:text-stone-900 transition-colors">
                Cockpit
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li>
              <Link to="/groups" className="hover:text-stone-900 transition-colors">
                Groups
              </Link>
            </li>
            <li className="text-stone-300">/</li>
            <li className="text-stone-900 font-medium truncate max-w-xs">{group.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-8 pb-6 border-b border-[#e7e0d3]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-serif">
                {group.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-0.5 rounded-full border ${
                isExpired
                  ? "bg-stone-100 text-stone-600 border-stone-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? "bg-stone-400" : "bg-emerald-600 animate-pulse"}`} />
                {isExpired ? "Expired" : "Active Group"}
              </span>
            </div>
            {group.description && <p className="text-stone-600 text-sm mb-1 leading-relaxed">{group.description}</p>}
            <p className="text-stone-500 text-xs font-mono">
              ⏰ Lifetime: {new Date(group.expiresAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          {!isExpired && (
            <Link
              to={`/groups/${groupId}/map`}
              className="btn-cta-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-xs"
            >
              🗺️ Open Group Map
            </Link>
          )}
        </div>

        {/* Members Section */}
        <div className="surface-card rounded-2xl overflow-hidden border border-[#e7e0d3] shadow-xs mb-6">
          <div className="px-6 py-4 border-b border-[#e7e0d3] flex items-center justify-between bg-[#f7f4ed]">
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif">Registered Group Members</h2>
              <p className="text-stone-500 text-xs mt-0.5">{group.members.length}/5 capacity utilized • 1 slot per member</p>
            </div>
            {!isExpired && group.members.length < 5 && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  showAddForm
                    ? "bg-[#ece6da] text-stone-800 border border-[#ded7ca]"
                    : "btn-cta-secondary"
                }`}
              >
                {showAddForm ? "✕ Close Form" : "+ Add Member"}
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {showAddForm && (
            <form onSubmit={handleAddMember} className="px-6 py-5 border-b border-[#e7e0d3] bg-[#fcfaf6]">
              <p className="text-stone-900 text-sm font-bold mb-4 font-serif">➕ Add Member to Tracking Cohort</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-stone-700 text-xs font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-700 text-xs font-semibold mb-1">Display Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder='e.g. "Dad", "Field Lead 1", "Courier"'
                    maxLength={50}
                    className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                  />
                </div>
              </div>
              {/* Color preview */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-stone-500 text-xs">Auto-assigned color identifier:</span>
                {MEMBER_COLORS.map((c, i) => {
                  const used = group.members.map((m) => m.color);
                  const isUsed = used.includes(c);
                  return (
                    <div
                      key={c}
                      className={`w-5 h-5 rounded-full border-2 ${!isUsed && i === group.members.length ? "border-stone-900 scale-110 shadow-xs" : "border-transparent opacity-40"}`}
                      style={{ background: c }}
                    />
                  );
                })}
              </div>
              <button
                type="submit"
                disabled={adding}
                className="btn-cta-primary px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Member (1 slot)"}
              </button>
            </form>
          )}

          {/* Members list */}
          {group.members.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-3xl mb-3">👥</div>
              <p className="text-stone-800 text-sm font-semibold mb-1">No members added yet</p>
              <p className="text-stone-500 text-xs">Click "+ Add Member" to begin tracking participants in this group.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e7e0d3]">
              {group.members.map((member) => {
                const online = member.sharerOnline;

                return (
                  <div
                    key={member.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-[#f7f4ed]/50 transition-colors group"
                  >
                    {/* Color avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 border-2 border-white"
                      style={{ background: member.color }}
                    >
                      {member.label?.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-stone-900 font-semibold text-sm">{member.label}</span>
                        {online ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">Offline</span>
                        )}
                      </div>
                      <p className="text-stone-500 text-xs font-mono">{member.phoneNumber}</p>
                      {member.lastUpdatedAt && (
                        <p className="text-stone-400 text-xs mt-0.5">
                          Last seen: {new Date(member.lastUpdatedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {/* Location mode badge */}
                    <div className="hidden sm:block">
                      {member.locationMode === "gps" && online ? (
                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                          GPS Satellite
                        </span>
                      ) : member.locationMode === "ip" ? (
                        <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                          IP Approx
                        </span>
                      ) : (
                        <span className="text-xs bg-stone-100 text-stone-500 border border-stone-200 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(member.token, member.id)}
                        title="Copy tracking link"
                        className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#ded7ca] text-stone-800 hover:bg-[#ece6da] font-medium transition-all shadow-xs"
                      >
                        {copiedToken === member.id ? "✓ Copied" : "🔗 Link"}
                      </button>
                      <button
                        onClick={() => handleRemove(member.id, member.label)}
                        title="Remove member"
                        className="text-xs px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 transition-all font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="rounded-2xl border border-[#e7e0d3] bg-[#f7f4ed] p-5">
          <p className="text-stone-900 text-sm font-semibold mb-2 font-serif">💡 Multi-Target Telemetry Workflow</p>
          <ul className="text-stone-600 text-xs space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Each participant receives an individual tracking link — deliver it via SMS or WhatsApp.</li>
            <li>Once they tap "Allow Location" on mobile, real-time GPS telemetry streams automatically.</li>
            <li>Observe all cohort members simultaneously on the unified Group Map.</li>
            <li>Adding an individual member allocates 1 tracking slot from your balance.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
