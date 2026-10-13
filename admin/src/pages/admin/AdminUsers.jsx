import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserAccess,
  deleteAdminUser,
} from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user, newRole) => {
    const originalUsers = [...users];
    try {
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
      await updateAdminUserRole(user.id, { role: newRole });
      toast.success(`${user.name} is now ${newRole}`);
    } catch (err) {
      setUsers(originalUsers);
      toast.error(err.response?.data?.message || "Role change failed");
    }
  };

  const handleAccessChange = async (user, newAccess) => {
    const originalUsers = [...users];
    try {
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, accessStatus: newAccess } : u,
        ),
      );
      await updateAdminUserAccess(user.id, { accessStatus: newAccess });
      toast.success(`${user.name}'s access ${newAccess}`);
    } catch (err) {
      setUsers(originalUsers);
      toast.error(err.response?.data?.message || "Access change failed");
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteAdminUser(userToDelete.id);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted permanently");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setUserToDelete(null);
    }
  };

  // Derived state for rendering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesAccess =
      accessFilter === "all" || u.accessStatus === accessFilter;
    return matchesSearch && matchesRole && matchesAccess;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-stone-900">
      <BackButton />
      
      <div className="mb-8 pb-4 border-b border-[#e7e0d3]">
        <div className="inline-flex items-center gap-2 eyebrow-pill mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          <span>Identity &amp; Access Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif tracking-tight">
          Manage Enrolled Users
        </h1>
        <p className="text-stone-500 mt-1 text-xs sm:text-sm">
          Inspect, modify system permissions, adjust session quotas, and manage user lifecycles.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="surface-card border border-[#ded7ca] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 justify-between items-center shadow-xs bg-white">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select
            className="w-full md:w-auto bg-[#fcfaf6] border border-[#ded7ca] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Standard Users</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            className="w-full md:w-auto bg-[#fcfaf6] border border-[#ded7ca] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
          >
            <option value="all">All Access Statuses</option>
            <option value="approved">Active / Approved</option>
            <option value="revoked">Revoked / Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="surface-card rounded-2xl shadow-xs border border-[#ded7ca] overflow-hidden bg-white">
        <div className="overflow-x-auto nice-scrollbar">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f7f4ed] border-b border-[#e7e0d3] text-stone-600 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Active Telemetry</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Tracking Clearance</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e0d3]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-stone-500 text-xs sm:text-sm italic"
                  >
                    No user accounts found matching your search filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMasterAdmin = u.email === "vasu@gmail.com";
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[#fcfaf6] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-stone-900">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ece6da] text-stone-800 border border-[#ded7ca]">
                          {u.sessionCount} Sessions
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          disabled={isMasterAdmin}
                          value={u.role || "user"}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className={`text-xs rounded-xl px-2.5 py-1 outline-none border transition-all ${
                            isMasterAdmin
                              ? "bg-transparent border-transparent text-stone-500 font-semibold appearance-none pointer-events-none"
                              : "bg-[#fcfaf6] border-[#ded7ca] text-stone-800 focus:ring-1 focus:ring-stone-400 cursor-pointer font-medium"
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isMasterAdmin}
                            onClick={() =>
                              handleAccessChange(
                                u,
                                u.accessStatus === "approved"
                                  ? "revoked"
                                  : "approved",
                              )
                            }
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                              u.accessStatus === "approved"
                                ? "bg-stone-900"
                                : "bg-stone-300"
                            } ${isMasterAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition-transform ${
                                u.accessStatus === "approved"
                                  ? "translate-x-5"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-xs font-semibold ${
                              u.accessStatus === "approved"
                                ? "text-emerald-800"
                                : "text-stone-500"
                            }`}
                          >
                            {u.accessStatus === "approved" ? "Active" : "Revoked"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={isMasterAdmin}
                          onClick={() => confirmDelete(u)}
                          className={`text-rose-700 hover:text-rose-900 transition-colors px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold ${
                            isMasterAdmin ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                          }`}
                          title={
                            isMasterAdmin
                              ? "Cannot delete master administrator"
                              : "Delete User Permanently"
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setUserToDelete(null)}
          />
          <div className="relative bg-white border border-[#ded7ca] rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 mb-5 border border-rose-200">
              <svg
                className="h-7 w-7 text-rose-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-900 font-serif mb-2">
              Erase User Account
            </h3>
            <p className="text-stone-600 mb-6 text-xs sm:text-sm leading-relaxed">
              Are you certain you want to permanently erase{" "}
              <strong className="text-stone-950">
                {userToDelete.name}
              </strong>
              ? All session records, group memberships, and balance slots will be deleted.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="btn-cta-secondary w-full sm:w-auto px-5 py-2.5 text-xs font-semibold"
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger w-full sm:w-auto px-5 py-2.5 text-xs font-semibold"
                onClick={executeDelete}
              >
                Permanently Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
