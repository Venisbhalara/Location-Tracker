import { useEffect, useState, useCallback, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getGroupDetails } from "../../services/api";
import { useGroupSocket } from "../../hooks/useSocket";
import toast from "react-hot-toast";

// Fix Leaflet default icon using bundled local assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Cache custom colored markers to prevent DOM tearing on Leaflet marker updates
const memberIconCache = new Map();
const buildMemberIcon = (color, initial) => {
  const key = `${color}_${initial}`;
  if (memberIconCache.has(key)) return memberIconCache.get(key);
  const icon = new L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:${color};
        border:3px solid white;
        box-shadow:0 0 0 2px rgba(28,27,24,0.15), 0 4px 10px rgba(0,0,0,0.15);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;font-weight:700;color:white;
        animation:member-pulse 2s ease-in-out infinite;
      ">${initial}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
  memberIconCache.set(key, icon);
  return icon;
};

// Auto-center map when a member is followed
const MapFollower = memo(({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], 16);
  }, [position, map]);
  return null;
});

// ── MEMBER SIDEBAR CARD ────────────────────────────────────────────────────────
const MemberCard = memo(({ member, isFollowing, onFollow, onCopyLink }) => {
  const online = member.sharerOnline;
  const hasPos = member.latitude && member.longitude;

  return (
    <div
      onClick={() => hasPos && onFollow(member.id)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
        isFollowing
          ? "border-stone-800 bg-[#f7f4ed] ring-1 ring-stone-800 shadow-xs"
          : "border-[#e7e0d3] bg-white hover:border-stone-400 hover:bg-[#fcfaf6] shadow-xs"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 border-2 border-white shadow-xs"
          style={{ background: member.color }}
        >
          {member.label?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-900 text-sm font-semibold truncate">{member.label}</span>
            {online && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-stone-500 text-xs font-mono truncate">{member.phoneNumber}</p>
        </div>
        {/* Mode badge */}
        <div className="shrink-0">
          {online && member.locationMode === "gps" ? (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">GPS</span>
          ) : member.locationMode === "ip" ? (
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">IP</span>
          ) : (
            <span className="text-[10px] bg-stone-100 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded-full">—</span>
          )}
        </div>
      </div>

      {/* Last seen + coords */}
      {hasPos && (
        <p className="text-stone-600 text-[11px] mt-2 font-mono">
          {member.timestamp ? new Date(member.timestamp).toLocaleTimeString() : "Waiting..."}
          {" · "}
          {parseFloat(member.latitude).toFixed(4)}, {parseFloat(member.longitude).toFixed(4)}
        </p>
      )}
      {!hasPos && (
        <p className="text-stone-400 text-[11px] mt-2 italic">Awaiting recipient telemetry...</p>
      )}

      {/* Copy link */}
      {member.token && (
        <button
          onClick={(e) => { e.stopPropagation(); onCopyLink(member.token, member.label); }}
          className="mt-2 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1"
        >
          <span>🔗</span>
          <span>Copy tracking link</span>
        </button>
      )}
    </div>
  );
});

// ── MAIN GROUP MAP PAGE ────────────────────────────────────────────────────────
const GroupMap = memo(() => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingId, setFollowingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [memberPositions, setMemberPositions] = useState({});

  const { members: socketMembers, connected, groupDeleted } = useGroupSocket(groupId);

  const loadGroup = useCallback(async () => {
    try {
      const res = await getGroupDetails(groupId);
      const g = res.data.group;
      setGroup(g);

      const initial = {};
      for (const m of g.members) {
        initial[m.id] = {
          id: m.id,
          label: m.label,
          color: m.color,
          phoneNumber: m.phoneNumber,
          token: m.token,
          latitude: m.latitude ? parseFloat(m.latitude) : null,
          longitude: m.longitude ? parseFloat(m.longitude) : null,
          accuracy: m.accuracy,
          locationMode: m.locationMode || "offline",
          sharerOnline: m.sharerOnline || false,
          timestamp: m.lastUpdatedAt ? new Date(m.lastUpdatedAt) : null,
        };
      }
      setMemberPositions(initial);
    } catch {
      toast.error("Could not load group.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { loadGroup(); }, [loadGroup]);

  useEffect(() => {
    if (Object.keys(socketMembers).length === 0) return;
    setMemberPositions((prev) => {
      const next = { ...prev };
      for (const [memberId, data] of Object.entries(socketMembers)) {
        const id = parseInt(memberId);
        if (next[id]) {
          next[id] = {
            ...next[id],
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
            locationMode: data.locationMode,
            sharerOnline: data.sharerOnline,
            timestamp: data.timestamp,
          };
        }
      }
      return next;
    });
  }, [socketMembers]);

  useEffect(() => {
    if (groupDeleted) {
      toast.error("This group has been deleted.");
      navigate("/groups");
    }
  }, [groupDeleted, navigate]);

  const copyLink = (token, label) => {
    const link = `${window.location.origin}/track/${token}`;
    navigator.clipboard.writeText(link);
    toast.success(`${label}'s link copied!`);
  };

  const members = Object.values(memberPositions);
  const onlineCount = members.filter((m) => m.sharerOnline).length;
  const membersWithPos = members.filter((m) => m.latitude && m.longitude);

  const mapCenter = membersWithPos.length > 0
    ? {
        latitude: membersWithPos.reduce((s, m) => s + m.latitude, 0) / membersWithPos.length,
        longitude: membersWithPos.reduce((s, m) => s + m.longitude, 0) / membersWithPos.length,
      }
    : { latitude: 20.5937, longitude: 78.9629 };

  const followingMember = followingId ? memberPositions[followingId] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf6]">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[#fcfaf6]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes member-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(28,27,24,0.15), 0 4px 10px rgba(0,0,0,0.15); }
          50%  { box-shadow: 0 0 0 6px rgba(28,27,24,0.1), 0 4px 10px rgba(0,0,0,0.15); }
        }
      `}} />

      <div className="flex flex-col h-full relative z-10 w-full">
        {/* ── TOP HEADER BAR ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e7e0d3] bg-white/95 backdrop-blur-md shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              to={`/groups/${groupId}`}
              className="p-2 rounded-xl bg-white border border-[#ded7ca] text-stone-700 hover:bg-[#ece6da] transition-all text-xs font-semibold shadow-xs"
            >
              ← Manage
            </Link>
            <div>
              <h1 className="text-stone-900 font-bold text-base leading-none font-serif">{group?.name}</h1>
              <p className="text-stone-500 text-xs mt-1">{members.length} members enrolled · {onlineCount} actively streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection indicator */}
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
              connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                : "bg-stone-100 border-stone-200 text-stone-500"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-600 animate-pulse" : "bg-stone-400"}`} />
              {connected ? "Socket Live" : "Connecting..."}
            </span>

            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f7f4ed] border border-[#ded7ca] text-stone-700 text-xs font-semibold transition-all shadow-xs"
              title="Toggle member sidebar"
            >
              {sidebarOpen ? "Hide Cohort ⊳" : "Show Cohort ⊲"}
            </button>
          </div>
        </div>

        {/* ── MAIN BODY ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── MAP ── */}
          <div className="flex-1 relative">
            <MapContainer
              center={[mapCenter.latitude, mapCenter.longitude]}
              zoom={membersWithPos.length > 0 ? 13 : 5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Render a marker per member */}
              {members.map((member) => {
                if (!member.latitude || !member.longitude) return null;
                return (
                  <Marker
                    key={member.id}
                    position={[member.latitude, member.longitude]}
                    icon={buildMemberIcon(member.color, member.label?.charAt(0).toUpperCase())}
                    eventHandlers={{
                      click: () => setFollowingId(member.id === followingId ? null : member.id),
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[200px] p-1 font-sans">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-200">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: member.color }}
                          >
                            {member.label?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 leading-tight">{member.label}</p>
                            <p className="text-stone-500 text-[11px] font-mono">{member.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-stone-600">
                          <p>
                            📍 {parseFloat(member.latitude).toFixed(6)}, {parseFloat(member.longitude).toFixed(6)}
                          </p>
                          {member.accuracy && (
                            <p className="text-stone-500">Precision: ±{Math.round(member.accuracy)}m</p>
                          )}
                          {member.timestamp && (
                            <p className="text-stone-500">
                              Ping: {new Date(member.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className={`mt-2 pt-2 border-t border-stone-200 text-xs font-semibold ${
                          member.sharerOnline ? "text-emerald-700" : "text-stone-500"
                        }`}>
                          {member.sharerOnline ? "● GPS Connected" : "○ Disconnected (Last recorded)"}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Follow selected member */}
              {followingId && followingMember?.latitude && (
                <MapFollower position={followingMember} />
              )}
            </MapContainer>

            {/* ── FLOATING MEMBER LEGEND (bottom of map) ── */}
            {members.length > 0 && (
              <div className="absolute bottom-5 left-5 z-[1000]">
                <div className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-[#ded7ca] bg-white/95 backdrop-blur-md shadow-lg">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFollowingId(m.id === followingId ? null : m.id)}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        followingId === m.id ? "bg-[#ece6da] border border-[#ded7ca] text-stone-900 shadow-xs" : "hover:bg-[#f7f4ed] text-stone-700"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white"
                        style={{ background: m.color }}
                      />
                      <span className="font-semibold">{m.label}</span>
                      {m.sharerOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      )}
                    </button>
                  ))}
                  {followingId && (
                    <button
                      onClick={() => setFollowingId(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 ml-1 font-semibold"
                    >
                      ✕ Unfollow
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          {sidebarOpen && (
            <div className="w-80 shrink-0 border-l border-[#e7e0d3] bg-[#fcfaf6] flex flex-col overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-[#e7e0d3] bg-[#f7f4ed] shrink-0">
                <p className="text-stone-900 font-bold text-sm font-serif">Cohort Participants</p>
                <p className="text-stone-500 text-xs mt-0.5">{onlineCount} of {members.length} currently broadcasting</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {members.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500 text-sm">No members registered.</p>
                    <Link to={`/groups/${groupId}`} className="text-stone-800 font-semibold text-xs hover:underline mt-2 block">
                      Enroll members →
                    </Link>
                  </div>
                ) : (
                  members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isFollowing={followingId === member.id}
                      onFollow={(id) => setFollowingId(id === followingId ? null : id)}
                      onCopyLink={copyLink}
                    />
                  ))
                )}
              </div>

              {/* Quick actions at bottom */}
              <div className="p-4 border-t border-[#e7e0d3] bg-[#f7f4ed] shrink-0">
                <Link
                  to={`/groups/${groupId}`}
                  className="btn-cta-secondary flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold shadow-xs"
                >
                  ⚙️ Manage Group Cohort
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default GroupMap;
