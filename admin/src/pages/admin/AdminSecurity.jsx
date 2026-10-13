import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import { getAdminUsers, updateAdminUserAccess } from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";

// Helper function
const timeAgo = (date) => {
  if (!date) return "Never logged in";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hrs ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + " secs ago";
};

const AdminSecurity = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ban Hammer Form
  const [blockEmail, setBlockEmail] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load security roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    const targetEmail = blockEmail.trim().toLowerCase();
    
    // Safety check for master admin
    if (targetEmail === "vasu@gmail.com") {
      toast.error("Action Prohibited: Cannot block the Master Administrator.");
      return;
    }

    const targetUser = users.find(u => u.email.toLowerCase() === targetEmail);
    if (!targetUser) {
      toast.error(`Target not found in registry: ${targetEmail}`);
      return;
    }

    setBlockLoading(true);
    try {
      await updateAdminUserAccess(targetUser.id, { accessStatus: "revoked" });
      toast.success(`${targetEmail} has been globally revoked from the platform.`);
      setBlockEmail("");
      fetchUsers(); // Refresh live
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to execute revocation.");
    } finally {
      setBlockLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  // Sort lists
  const admins = users.filter(u => u.role === "admin");
  const loginAuditLog = [...users]
    .filter(u => u.lastLoginAt !== null)
    .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt)); // Newest first

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <BackButton to="/admin" label="Back to Control Center" />
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#f0eae1] text-[#6e685f] border border-[#ded7ca] mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c1b18]"></span>
          Platform Integrity &amp; Access Controls
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#1c1b18] font-serif">
          Security &amp; Policy Control
        </h1>
        <p className="text-sm text-[#6e685f] mt-1">Audit administrative credentials, review entry logs, and revoke suspicious nodes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Threat Control & Admins */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Revoke Access Box */}
          <div className="bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#1c1b18] font-serif text-lg font-normal mb-1">
              <span>🛡️</span> Rapid Access Revocation
            </div>
            <p className="text-xs text-[#6e685f] mb-4 leading-relaxed">
              Target a compromised account to immediately revoke all authentication tokens and access privileges across the system.
            </p>

            <form onSubmit={handleBlockSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[#6e685f] mb-1.5 block">Target Account Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#fcfaf6] border border-[#ded7ca] text-sm text-[#1c1b18] placeholder-[#9c9489] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1c1b18] focus:ring-1 focus:ring-[#1c1b18] transition-all"
                  placeholder="suspect@domain.com"
                  value={blockEmail}
                  onChange={(e) => setBlockEmail(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={blockLoading || !blockEmail}
                className="w-full bg-[#c84032] hover:bg-[#b03528] disabled:opacity-50 text-white uppercase tracking-wider text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm mt-1"
              >
                {blockLoading ? "Revoking..." : "Revoke Access Privileges"}
              </button>
            </form>
          </div>

          {/* Admin Roster */}
          <div className="bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-normal flex items-center gap-2 text-[#1c1b18] mb-4">
              <span>👥</span> Administrative Roster
            </h2>
            <div className="flex flex-col gap-3">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 bg-[#fcfaf6] p-3 rounded-xl border border-[#ded7ca]">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7ca] text-[#1c1b18] flex items-center justify-center font-bold text-sm shadow-sm">
                    {admin.name ? admin.name.charAt(0).toUpperCase() : (admin.email === 'vasu@gmail.com' ? 'V' : (admin.email.charAt(0).toUpperCase()))}
                  </div>
                  <div className="truncate">
                    <p className="text-[#1c1b18] font-medium text-sm leading-tight truncate">{admin.name || "Administrator"}</p>
                    <p className="text-[#6e685f] font-mono text-xs truncate">{admin.email}</p>
                  </div>
                  {admin.email === 'vasu@gmail.com' && (
                    <span className="ml-auto bg-[#1c1b18] text-[#fcfaf6] text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-medium shrink-0">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Login Audit Log */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-serif font-normal flex items-center gap-2 text-[#1c1b18] mb-0.5">
                  <span>📋</span> Global Access Telemetry
                </h2>
                <p className="text-xs text-[#6e685f]">Chronological timestamp ledger of recent authenticated sessions.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif text-[#1c1b18]">{loginAuditLog.length}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#6e685f]">Active Entries</p>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto rounded-xl border border-[#ded7ca] bg-[#fcfaf6]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#faf6f0] border-b border-[#ded7ca] sticky top-0 z-10">
                  <tr className="text-[#6e685f] text-[10px] uppercase tracking-wider font-semibold">
                    <th className="px-5 py-3.5">Account Identity</th>
                    <th className="px-5 py-3.5">Privilege &amp; Status</th>
                    <th className="px-5 py-3.5 text-right">Entry Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {loginAuditLog.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-[#6e685f] text-sm">
                        No login activity recorded yet on the platform.
                      </td>
                    </tr>
                  ) : (
                    loginAuditLog.map((user) => (
                      <tr key={user.id} className="hover:bg-white transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-[#1c1b18] font-medium text-sm">{user.name || "Anonymous User"}</p>
                          <p className="text-[#6e685f] font-mono text-[11px]">{user.email}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${user.accessStatus === 'revoked' ? 'bg-[#c84032]' : 'bg-[#2d7a4f]'}`}></span>
                            <span className="text-xs text-[#1c1b18] font-medium capitalize">{user.role}</span>
                            {user.accessStatus === 'revoked' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c84032]/10 text-[#c84032] font-semibold uppercase">Revoked</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <p className="text-xs text-[#1c1b18] font-medium">{timeAgo(user.lastLoginAt)}</p>
                          <p className="text-[10px] text-[#6e685f] font-mono mt-0.5">{new Date(user.lastLoginAt).toLocaleString()}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSecurity;
