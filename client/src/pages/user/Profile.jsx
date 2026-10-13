import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
} from "../../services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AmbientBackground from "../../components/common/AmbientBackground";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("general");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    defaultTrackingExpiration: "24h",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteData, setDeleteData] = useState({ password: "" });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setProfileData({
        name: res.data.name || "",
        email: res.data.email || "",
        phoneNumber: res.data.phoneNumber || "",
        defaultTrackingExpiration: res.data.defaultTrackingExpiration || "24h",
      });
    } catch {
      toast.error("Failed to load profile data");
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSaved(false);
    try {
      const res = await updateUserProfile(profileData);
      updateUser(res.data);
      setProfileSaved(true);
      toast.success("Profile saved!");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setPasswordLoading(true);
    setPasswordSaved(false);
    try {
      await updateUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSaved(true);
      toast.success("Password updated!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteData.password) return toast.error("Please enter your password");
    if (
      !window.confirm(
        "Are you SURE you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    setDeleteLoading(true);
    try {
      await deleteUserAccount({ password: deleteData.password });
      toast.success("Account deleted");
      logout();
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const initial = profileData.name
    ? profileData.name.charAt(0).toUpperCase()
    : user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <AmbientBackground />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
              Profile Settings
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Manage your personal credentials, telemetry preferences, and security.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-2 bg-white/80 border border-[#ded7ca] px-3.5 py-2 rounded-xl shadow-xs hover:bg-[#f7f4ed] w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cockpit
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-[#e7e0d3] rounded-2xl overflow-hidden shadow-xs flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 bg-[#f7f4ed] p-4 flex md:flex-col gap-1.5 overflow-x-auto border-b md:border-b-0 md:border-r border-[#e7e0d3]">
            <TabButton
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
              label="General Info"
              icon="👤"
            />
            <TabButton
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              label="Security"
              icon="🔒"
            />
            <TabButton
              active={activeTab === "preferences"}
              onClick={() => setActiveTab("preferences")}
              label="Tracking Prefs"
              icon="⏱️"
            />
            <TabButton
              active={activeTab === "danger"}
              onClick={() => setActiveTab("danger")}
              label="Danger Zone"
              icon="⚠️"
              danger
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 sm:p-8">
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-[#e7e0d3] font-serif">
                  Personal Details
                </h2>

                {/* Initial Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#ece6da] border border-[#ded7ca] flex items-center justify-center text-2xl font-bold text-stone-800 shadow-inner">
                    {initial}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {profileData.name || "User"}
                    </h3>
                    <p className="text-stone-500 text-xs mt-0.5">
                      {profileData.email || "Active Member"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      className="w-full bg-[#f7f4ed] border border-[#e7e0d3] rounded-xl px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed"
                      disabled
                      title="Email cannot be changed directly"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
                    />
                  </div>
                  <div className="pt-3">
                    <SaveButton
                      loading={profileLoading}
                      saved={profileSaved}
                      label="Save Changes"
                    />
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-[#e7e0d3] font-serif">
                    Security Credentials
                  </h2>

                  <form
                    onSubmit={handleUpdatePassword}
                    className="space-y-4 surface-card p-5 rounded-2xl border border-[#e7e0d3]"
                  >
                    <h3 className="font-semibold text-stone-900 text-sm">
                      Change Account Password
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={6}
                        className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
                      />
                    </div>
                    <div className="pt-2">
                      <SaveButton
                        loading={passwordLoading}
                        saved={passwordSaved}
                        label="Update Password"
                        variant="primary"
                      />
                    </div>
                  </form>
                </div>

                <div className="surface-card p-5 rounded-2xl border border-[#e7e0d3]">
                  <h3 className="font-semibold text-stone-900 mb-1 text-sm">
                    Active Session
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Devices currently authenticated to your NexTrack account.
                  </p>
                  <div className="flex items-center justify-between p-3.5 bg-[#fcfaf6] rounded-xl border border-[#e7e0d3]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💻</span>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-stone-900">Current Web Session</p>
                        <p className="text-[11px] text-emerald-700 font-medium">● Active now</p>
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 bg-[#ece6da] px-2.5 py-1 rounded-full font-mono">
                      TLS Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "preferences" && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b border-[#e7e0d3] font-serif">
                  Telemetry Preferences
                </h2>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="surface-card p-5 rounded-2xl border border-[#e7e0d3]">
                    <h3 className="font-semibold text-stone-900 mb-1 text-sm">
                      Default Tracking Link Lifetime
                    </h3>
                    <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                      Pre-select the validity period applied when generating new location sharing invitations.
                    </p>

                    <ExpirationPicker
                      value={profileData.defaultTrackingExpiration}
                      onChange={(val) =>
                        setProfileData({
                          ...profileData,
                          defaultTrackingExpiration: val,
                        })
                      }
                    />
                  </div>

                  <SaveButton
                    loading={profileLoading}
                    saved={profileSaved}
                    label="Save Preferences"
                  />
                </form>
              </div>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === "danger" && (
              <div className="animate-fade-in">
                <h2 className="text-lg font-bold text-rose-800 mb-4 pb-2 border-b border-rose-200 font-serif">
                  Danger Zone
                </h2>

                <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200/80">
                  <h3 className="font-semibold text-rose-900 mb-1 text-sm">
                    Permanently Delete Account
                  </h3>
                  <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                    Once you delete your account, there is no recovery. All active tracking links, group associations, telemetry history, and slot balances will be immediately removed.
                  </p>

                  <form
                    onSubmit={handleDeleteAccount}
                    className="space-y-3.5 max-w-sm"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Confirm Identity Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        value={deleteData.password}
                        onChange={(e) =>
                          setDeleteData({ password: e.target.value })
                        }
                        required
                        className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={deleteLoading}
                      className="w-full px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-xs"
                    >
                      {deleteLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Permanently Erase Account"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const SaveButton = ({ loading, saved, label }) => {
  return (
    <button
      type="submit"
      disabled={loading || saved}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-60 focus:outline-none shadow-xs ${
        saved
          ? "bg-emerald-700 text-white"
          : "btn-cta-primary"
      }`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {label}
        </>
      ) : saved ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Saved!
        </>
      ) : (
        label
      )}
    </button>
  );
};

const TabButton = ({ active, onClick, label, icon, danger }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center gap-2.5 whitespace-nowrap ${
      active
        ? danger
          ? "bg-rose-100/80 text-rose-800 border border-rose-200 font-semibold"
          : "bg-white text-stone-900 border border-[#ded7ca] shadow-xs font-semibold"
        : "text-stone-600 hover:bg-[#ece6da]/50 hover:text-stone-900 border border-transparent"
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const EXPIRATION_OPTIONS = [
  {
    value: "1h",
    label: "1 Hour",
    sublabel: "Short-lived, for quick checks",
  },
  {
    value: "12h",
    label: "12 Hours",
    sublabel: "Half day duration",
  },
  {
    value: "24h",
    label: "24 Hours",
    sublabel: "Full day — recommended",
    badge: "Popular",
  },
  {
    value: "7d",
    label: "7 Days",
    sublabel: "Week-long visibility",
  },
  {
    value: "never",
    label: "Never Expire",
    sublabel: "Link stays active indefinitely",
  },
];

const ExpirationPicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {EXPIRATION_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              relative flex items-center justify-between p-3.5 rounded-xl border text-left
              transition-all duration-200
              ${
                isActive
                  ? "bg-[#f7f4ed] border-stone-800 shadow-xs ring-1 ring-stone-800"
                  : "bg-white border-[#ded7ca] hover:border-stone-400"
              }
            `}
          >
            <div className="min-w-0">
              <div className="font-semibold text-xs sm:text-sm flex items-center gap-2 text-stone-900">
                {opt.label}
                {opt.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#ece6da] text-stone-800 border border-[#ded7ca]">
                    {opt.badge}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                {opt.sublabel}
              </div>
            </div>

            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                isActive
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300"
              }`}
            >
              {isActive && (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
