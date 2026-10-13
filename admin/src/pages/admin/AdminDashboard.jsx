import { useState, useEffect, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAdminDashboard,
  getAdminUserCredentials,
  getAdminActivityLogs,
} from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Radio,
  Hourglass,
  MapPin,
  Sparkles,
  Lock,
  Map,
  Users as UsersIcon,
  Shield,
  Key,
  FileText,
  Activity,
  AlertCircle,
  X,
  ChevronRight,
  LockKeyhole,
  RefreshCw,
  CreditCard,
} from "lucide-react";

// --- Dynamic Dashboard Logic ---

// Reusable animated counter hook
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const AnimatedCounter = memo(({ value, duration = 2000 }) => {
  const count = useCounter(value, duration);
  return <span>{count.toLocaleString()}</span>;
});

// Clock Component
const TopBarClock = memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return (
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(currentTime) +
      " — " +
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(currentTime)
    );
  }, [currentTime]);

  return <p className="text-xs font-mono text-stone-500 mt-1">{formattedDate}</p>;
});

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User credentials modal state
  const [showCredModal, setShowCredModal] = useState(false);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [credLoading, setCredLoading] = useState(false);

  // All Activity Modal State
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);

  // Failed attempts tracking
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem("admin_cred_attempts") || "0");
  });
  const [lockoutTime, setLockoutTime] = useState(() => {
    const saved = localStorage.getItem("admin_cred_lockout");
    if (saved && parseInt(saved) > Date.now()) {
      return parseInt(saved);
    }
    return null;
  });
  const [remainingLockTime, setRemainingLockTime] = useState(0);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await getAdminDashboard();
      setData(res.data);
      if (res.data.recentActivities) {
        setActivities(res.data.recentActivities);
      }
    } catch {
      setError("Failed to fetch dashboard metrics");
    } finally {
      if (!silent) setLoading(false);
      else setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("live-activity", (event) => {
      setActivities((prev) => [event, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Timer for lockout countdown
  useEffect(() => {
    let interval;
    if (lockoutTime) {
      interval = setInterval(() => {
        const now = Date.now();
        if (now >= lockoutTime) {
          setLockoutTime(null);
          setFailedAttempts(0);
          localStorage.removeItem("admin_cred_lockout");
          localStorage.removeItem("admin_cred_attempts");
        } else {
          setRemainingLockTime(Math.ceil((lockoutTime - now) / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  if (loading) return <LoadingScreen />;
  if (error)
    return <div className="text-center text-rose-600 py-12 font-medium">{error}</div>;

  const handleFetchCredentials = async (e) => {
    e.preventDefault();
    if (lockoutTime) {
      toast.error("This section is currently locked.");
      return;
    }

    setCredLoading(true);
    try {
      const res = await getAdminUserCredentials({
        email: credEmail,
        password: credPassword,
      });
      setCredentials(res.data);
      toast.success("Credentials loaded successfully");

      setFailedAttempts(0);
      localStorage.removeItem("admin_cred_attempts");
      localStorage.removeItem("admin_cred_lockout");
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem("admin_cred_attempts", newAttempts.toString());

      if (newAttempts >= 5) {
        const lockUntil = Date.now() + 15 * 60 * 1000;
        setLockoutTime(lockUntil);
        localStorage.setItem("admin_cred_lockout", lockUntil.toString());
        toast.error("Too many failed attempts. Section locked for 15 minutes.");
      } else {
        toast.error(
          err.response?.data?.message ||
            `Invalid credentials. ${5 - newAttempts} attempt(s) remaining.`,
        );
      }
    } finally {
      setCredLoading(false);
    }
  };

  const handleFetchAllActivities = async (page = 1) => {
    if (page === 1) setActivitiesLoading(true);
    try {
      const res = await getAdminActivityLogs({ page, limit: 50 });
      if (page === 1) {
        setAllActivities(res.data.activities);
      } else {
        setAllActivities((prev) => [...prev, ...res.data.activities]);
      }
      setHasMoreActivities(page < res.data.pages);
      setActivitiesPage(page);
    } catch {
      toast.error("Failed to load activities");
    } finally {
      setActivitiesLoading(false);
    }
  };

  const openActivityModal = () => {
    setShowAllActivityModal(true);
    handleFetchAllActivities(1);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-[#fcfaf6] text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background warm subtle ambient radial */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, rgba(236,230,218,0.7) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-60 -right-60 w-[700px] h-[700px] rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, rgba(231,224,211,0.6) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto px-4 w-full sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-[#e7e0d3]"
        >
          <div>
            <div className="inline-flex items-center gap-2 eyebrow-pill mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
              <span>Fleet Telemetry Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight font-serif">
              Control Center
            </h1>
            <TopBarClock />
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-[#ded7ca] shadow-xs">
            <div className="flex items-center gap-2 px-2.5 border-r border-[#e7e0d3] pr-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-800 tracking-wider hidden sm:block">
                SYSTEM NOMINAL
              </span>
            </div>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f7f4ed] hover:bg-[#ece6da] text-stone-700 hover:text-stone-950 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed group border border-[#e7e0d3]"
            >
              <RefreshCw
                size={13}
                className={
                  isRefreshing
                    ? "animate-spin text-stone-900"
                    : "text-stone-500 group-hover:text-stone-900 transition-colors"
                }
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
        </motion.div>

        {/* === MAIN STAT CARDS === */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
        >
          <StatCard
            title="Total Enrolled Users"
            value={data?.totalUsers || 0}
            icon={Users}
            accentColor="#44403c"
            tooltip="Registered accounts"
          />
          <StatCard
            title="Active Sessions"
            value={data?.activeSessions || 0}
            icon={Radio}
            accentColor="#15803d"
            tooltip="Live broadcasting"
            pulse
            badgeText="LIVE"
          />
          <StatCard
            title="Pending Access"
            value={data?.pendingApprovals || 0}
            icon={Hourglass}
            accentColor="#b45309"
            tooltip="Awaiting clearance"
            glow={data?.pendingApprovals > 0}
          />
          <StatCard
            title="Location Updates Today"
            value={data?.locationUpdatesToday || 0}
            icon={MapPin}
            accentColor="#0369a1"
            tooltip="Telemetric pings"
          />
          <StatCard
            title="New Signups (24h)"
            value={data?.newSignups24h || 0}
            icon={Sparkles}
            accentColor="#4338ca"
            tooltip="Past 24 hours"
          />
        </motion.div>

        {/* === MINI STATS ROW === */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { l: "Avg Session Duration", v: "4m 32s", accent: "#44403c" },
            {
              l: "Total Track Requests",
              v: data?.totalTrackRequests || 0,
              accent: "#0369a1",
            },
            {
              l: "Success Rate",
              v: `${data?.successRate || 0}%`,
              accent: "#15803d",
            },
            { l: "Banned Users", v: data?.bannedUsers || 0, accent: "#b91c1c" },
          ].map((s, i) => (
            <div
              key={i}
              className="surface-card px-4 py-3 flex flex-col justify-center border border-[#e7e0d3] hover:border-stone-400 transition-all shadow-xs"
              style={{ borderLeft: `3px solid ${s.accent}` }}
            >
              <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">
                {s.l}
              </span>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: s.accent }}
              >
                {s.v}
              </span>
            </div>
          ))}
        </motion.div>

        {/* === MIDDLE SECTION: LIVE FEED & CHARTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 surface-card border border-[#ded7ca] shadow-xs flex flex-col h-[340px] overflow-hidden"
          >
            <div className="p-4 border-b border-[#e7e0d3] bg-[#f7f4ed] flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <h2 className="text-sm font-bold text-stone-900 font-serif">Live Platform Stream</h2>
              <span className="ml-auto text-[10px] font-bold text-emerald-800 tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ACTIVE PIPELINE
              </span>
            </div>
            <div data-lenis-prevent className="flex-1 overflow-y-auto p-2 space-y-1 nice-scrollbar">
              <AnimatePresence>
                {activities.length === 0 && (
                  <div className="p-8 text-center text-stone-500 text-xs italic">
                    Awaiting live telemetric events...
                  </div>
                )}
                {activities.map((event, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                      delay: i < 10 ? 0.03 * i : 0,
                    }}
                    key={event.id || i}
                    className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f7f4ed] cursor-pointer transition-colors border border-transparent hover:border-[#ded7ca] text-xs`}
                  >
                    <div className="w-16 text-[11px] text-stone-400 font-mono shrink-0">
                      {event.time === "just now"
                        ? "just now"
                        : new Date(event.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </div>
                    <div className="w-32 text-xs font-semibold text-stone-900 truncate flex items-center gap-1.5">
                      {event.alert && (
                        <AlertCircle size={13} className="text-rose-600 shrink-0" />
                      )}
                      {event.label}
                    </div>
                    <div className="flex-1 text-xs text-stone-600 truncate font-mono">
                      {event.detail1}
                    </div>
                    <div className="w-32 text-xs text-stone-500 text-right truncate hidden sm:block">
                      {event.detail2}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-2.5 border-t border-[#e7e0d3] bg-[#f7f4ed] text-center">
              <button
                onClick={openActivityModal}
                className="text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors flex items-center justify-center gap-1 mx-auto group"
              >
                <span>Inspect Full Activity Audit</span>
                <ChevronRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
          </motion.div>

          {/* Donut Charts */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="surface-card border border-[#ded7ca] shadow-xs p-4 flex flex-col gap-3 h-[340px]"
          >
            <h2 className="text-sm font-bold text-stone-900 font-serif border-b border-[#e7e0d3] pb-2 mb-1">
              Telemetry Allocation
            </h2>

            <div className="flex-1 grid grid-cols-2 gap-3 items-center">
              {/* Chart 1 */}
              <div className="flex flex-col items-center">
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Active",
                            value: data?.activeSessions || 0,
                            color: "#15803d",
                          },
                          {
                            name: "Offline",
                            value: data?.offlineSessions || 0,
                            color: "#b45309",
                          },
                          {
                            name: "Expired",
                            value: data?.expiredSessions || 0,
                            color: "#a8a29e",
                          },
                        ]}
                        innerRadius={28}
                        outerRadius={40}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { color: "#15803d" },
                          { color: "#b45309" },
                          { color: "#a8a29e" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #ded7ca",
                          borderRadius: "10px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#1c1b18" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1 uppercase tracking-wider">
                  Sessions
                </span>
              </div>

              {/* Chart 2 */}
              <div className="flex flex-col items-center">
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Standard",
                            value: data?.standardUsers || 0,
                            color: "#0369a1",
                          },
                          {
                            name: "Admins",
                            value: data?.adminUsers || 0,
                            color: "#44403c",
                          },
                          {
                            name: "Banned",
                            value: data?.bannedUsers || 0,
                            color: "#b91c1c",
                          },
                        ]}
                        innerRadius={28}
                        outerRadius={40}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {[
                          { color: "#0369a1" },
                          { color: "#44403c" },
                          { color: "#b91c1c" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #ded7ca",
                          borderRadius: "10px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#1c1b18" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-[11px] font-bold text-stone-700 mt-1 uppercase tracking-wider">
                  User Roles
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === QUICK ACTIONS GRID === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Administrative Command Portals
            </h2>
            <p className="text-stone-500 text-xs">
              Direct access to system operations and telemetry configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <ActionCard
              to="/admin/access"
              icon={Lock}
              title="Access Requests"
              desc="Review and authorize tracking requests"
              badge={
                data?.pendingApprovals > 0
                  ? `${data?.pendingApprovals} Pending`
                  : null
              }
            />
            <ActionCard
              to="/admin/tracking"
              icon={Radio}
              title="All Tracking"
              desc="Inspect active and historical links"
            />
            <ActionCard
              to="/admin/live-map"
              icon={Map}
              title="Global Live Map"
              desc="Unified multi-target telemetry radar"
              badge="LIVE"
              pulseBadge
            />
            <ActionCard
              to="/admin/users"
              icon={UsersIcon}
              title="Manage Users"
              desc="Directory, roles & slot balances"
            />
            <ActionCard
              to="/admin/security"
              icon={Shield}
              title="Security & Guard"
              desc="Failed authentications & IP audit"
            />
            <ActionCard
              onClick={() => setShowCredModal(true)}
              icon={Key}
              title="Encrypted Vault"
              desc="Protected credential access"
            />
            <ActionCard
              to="/admin/activity"
              icon={FileText}
              title="Activity Logs"
              desc="Export complete audit trails"
            />
            <ActionCard
              to="/admin/monetization"
              icon={CreditCard}
              title="Monetization"
              desc="Slot recharges & transaction orders"
              badge="REVENUE"
            />
          </div>
        </motion.div>
      </div>

      {/* --- CREDENTIALS MODAL --- */}
      <AnimatePresence>
        {showCredModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`rounded-2xl shadow-2xl w-full ${
                credentials ? "max-w-4xl" : "max-w-md"
              } overflow-hidden flex flex-col relative bg-white border border-[#ded7ca] pointer-events-auto`}
              style={{
                height: credentials ? "80vh" : "auto",
                maxHeight: "90vh",
              }}
            >
              <div className="p-4 sm:p-5 border-b border-[#e7e0d3] flex justify-between items-center bg-[#f7f4ed]">
                <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ece6da] border border-[#ded7ca] flex items-center justify-center text-stone-800">
                    <LockKeyhole size={16} />
                  </div>
                  Secure Vault Authorization
                </h2>
                <button
                  onClick={() => {
                    setShowCredModal(false);
                    setCredentials(null);
                    setCredPassword("");
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-[#ece6da]/60 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div data-lenis-prevent className="p-6 flex-1 min-h-0 overflow-y-auto nice-scrollbar pointer-events-auto">
                {!credentials ? (
                  <form
                    onSubmit={handleFetchCredentials}
                    className="max-w-md mx-auto space-y-4 py-2"
                  >
                    <div className="text-center mb-5">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mb-3 border border-amber-200 shadow-xs">
                        <Shield size={22} />
                      </div>
                      <h3 className="text-lg font-bold text-stone-900 font-serif">
                        Identity Verification
                      </h3>
                      {lockoutTime ? (
                        <p className="text-rose-700 mt-2 font-medium text-xs">
                          Security lockout active due to repeated failures.
                          <br />
                          Try again in:{" "}
                          <span className="font-mono text-sm font-bold">
                            {Math.floor(remainingLockTime / 60)}:
                            {(remainingLockTime % 60)
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-stone-500 mt-1">
                          Re-authenticate with master admin key to view vault records.
                        </p>
                      )}
                    </div>

                    <div
                      className={`space-y-4 transition-opacity ${lockoutTime ? "opacity-50" : "opacity-100"}`}
                    >
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          required
                          disabled={!!lockoutTime}
                          value={credEmail}
                          onChange={(e) => setCredEmail(e.target.value)}
                          className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white font-mono"
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Master Password
                        </label>
                        <input
                          type="password"
                          required
                          disabled={!!lockoutTime}
                          value={credPassword}
                          onChange={(e) => setCredPassword(e.target.value)}
                          className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white font-mono tracking-widest"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={credLoading || !!lockoutTime}
                        className="btn-cta-primary w-full py-2.5 text-xs font-semibold justify-center shadow-xs mt-3"
                      >
                        {lockoutTime
                          ? "LOCKED OUT"
                          : credLoading
                            ? "Verifying..."
                            : "Unlock Protected Vault →"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="text-amber-800 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-amber-900 font-bold text-xs uppercase tracking-wider mb-0.5">
                          STRICT CONFIDENTIAL AUDIT
                        </h4>
                        <p className="text-amber-800 text-xs leading-relaxed">
                          This session is logged for compliance. Unmasked credentials must not be exported or distributed.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e7e0d3] overflow-hidden bg-white shadow-xs">
                      <div className="overflow-x-auto nice-scrollbar">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-[#f7f4ed] text-stone-700 border-b border-[#e7e0d3]">
                            <tr>
                              <th className="px-4 py-3 font-semibold uppercase">User</th>
                              <th className="px-4 py-3 font-semibold uppercase">Email</th>
                              <th className="px-4 py-3 font-semibold uppercase">Stored Password</th>
                              <th className="px-4 py-3 font-semibold uppercase">Role</th>
                              <th className="px-4 py-3 font-semibold uppercase">Joined</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e7e0d3] text-stone-700">
                            {credentials.map((user) => (
                              <tr key={user.id} className="hover:bg-[#fcfaf6] transition-colors">
                                <td className="px-4 py-3 font-medium text-stone-900 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-[#ece6da] flex items-center justify-center text-[10px] font-bold text-stone-800 border border-[#ded7ca]">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  {user.name}
                                </td>
                                <td className="px-4 py-3 font-mono">{user.email}</td>
                                <td className="px-4 py-3 font-mono text-stone-900 font-bold bg-[#f7f4ed]">
                                  {user.password}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ece6da] text-stone-800 border border-[#ded7ca]">
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-stone-500">
                                  {new Date(user.joinedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ALL ACTIVITY MODAL --- */}
      <AnimatePresence>
        {showAllActivityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col bg-white border border-[#ded7ca] relative overflow-hidden pointer-events-auto"
              style={{ height: "80vh", maxHeight: "90vh" }}
            >
              <div className="p-5 border-b border-[#e7e0d3] flex justify-between items-center bg-[#f7f4ed] shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                    <Activity className="text-stone-800" size={18} />
                    Platform Activity Audit
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chronological event stream across users and telemetry pipelines
                  </p>
                </div>
                <button
                  onClick={() => setShowAllActivityModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-[#ece6da]/60 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto p-5 relative z-10 nice-scrollbar pointer-events-auto"
              >
                {activitiesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="animate-spin text-stone-600" size={32} />
                    <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">
                      Retrieving audit records...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allActivities.length === 0 ? (
                      <div className="text-center py-16 text-stone-500 text-xs">
                        No recorded platform activities.
                      </div>
                    ) : (
                      allActivities.map((event, i) => (
                        <div
                          key={event.id || i}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-[#e7e0d3] bg-[#fcfaf6] hover:bg-white transition-all text-xs"
                        >
                          <div className="w-24 text-[11px] text-stone-400 font-mono shrink-0">
                            {new Date(event.time).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="w-40 text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            {event.alert && (
                              <AlertCircle size={13} className="text-rose-600" />
                            )}
                            {event.label}
                          </div>
                          <div className="flex-1 text-xs text-stone-700 font-mono">
                            {event.detail1}
                          </div>
                          <div className="text-[11px] text-stone-500 font-medium bg-[#ece6da] px-2.5 py-0.5 rounded-full border border-[#ded7ca]">
                            {event.detail2}
                          </div>
                        </div>
                      ))
                    )}

                    {hasMoreActivities && (
                      <button
                        onClick={() => handleFetchAllActivities(activitiesPage + 1)}
                        className="w-full py-3 mt-3 text-xs font-bold text-stone-700 hover:text-stone-950 hover:bg-[#f7f4ed] rounded-xl border border-dashed border-[#ded7ca] transition-all uppercase tracking-wider"
                      >
                        Load Previous Events
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3.5 border-t border-[#e7e0d3] bg-[#f7f4ed] flex justify-between items-center shrink-0">
                <p className="text-[11px] text-stone-500 font-medium">
                  Viewing {allActivities.length} recorded events
                </p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const StatCard = memo(
  ({
    title,
    value,
    icon: Icon,
    accentColor,
    tooltip,
    glow,
    pulse,
    badgeText,
  }) => (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3 }}
      className="relative surface-card p-4.5 rounded-2xl border border-[#ded7ca] shadow-xs hover:border-stone-400 hover:shadow-md transition-all duration-300 overflow-hidden bg-white"
    >
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
          style={{
            backgroundColor: "#f7f4ed",
            borderColor: "#ded7ca",
            color: accentColor,
          }}
        >
          <Icon size={18} />
        </div>
        {badgeText && (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200"
          >
            {pulse && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            )}
            {badgeText}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-stone-900 text-2xl font-bold tracking-tight mb-0.5">
          <AnimatedCounter value={value} />
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-stone-600 truncate">{title}</p>
          <div className="text-[10px] bg-[#f7f4ed] border border-[#e7e0d3] px-1.5 py-0.2 rounded text-stone-500 truncate">
            {tooltip}
          </div>
        </div>
      </div>
    </motion.div>
  ),
);

const ActionCard = memo(
  ({ to, onClick, icon: Icon, title, desc, badge, pulseBadge }) => {
    const content = (
      <div className="surface-card p-4 rounded-2xl border border-[#ded7ca] flex items-center gap-3.5 group cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-stone-400 bg-white">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-[#ded7ca] bg-[#f7f4ed] text-stone-800 group-hover:scale-105 transition-all shadow-xs">
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-stone-700 transition-colors font-serif">
            {title}
          </h4>
          <p className="text-xs text-stone-500 truncate mt-0.5">{desc}</p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border bg-[#ece6da] text-stone-800 border-[#ded7ca] flex items-center gap-1">
              {pulseBadge && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              )}
              {badge}
            </span>
          )}
          <ChevronRight
            className="text-stone-400 group-hover:text-stone-800 group-hover:translate-x-0.5 transition-all"
            size={16}
          />
        </div>
      </div>
    );

    return to ? (
      <Link
        to={to}
        className="block w-full outline-none focus:ring-2 focus:ring-stone-400 rounded-2xl"
      >
        {content}
      </Link>
    ) : (
      <div onClick={onClick} className="w-full relative">
        {content}
      </div>
    );
  },
);

export default AdminDashboard;
