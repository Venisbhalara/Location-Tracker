import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import {
  getAdminUsers,
  getAdminPayments,
  updateAdminUserBalance,
} from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import {
  CreditCard,
  Users,
  History,
  Plus,
  Minus,
  Search,
  Wallet,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminMonetization = () => {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // "add" or "reduce"
  const [addAmount, setAddAmount] = useState("");
  const [updateReason, setUpdateReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [uRes, pRes] = await Promise.all([
        getAdminUsers(),
        getAdminPayments(),
      ]);
      setUsers(uRes.data);
      setPayments(pRes.data);
      if (isManual) toast.success("Monetization data synchronized", { id: "refresh-success" });
    } catch (err) {
      toast.error("Failed to load monetization data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (user, mode) => {
    setSelectedUser(user);
    setModalMode(mode);
    setAddAmount("");
    setUpdateReason("");
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser || !addAmount) return;

    setUpdating(true);
    try {
      // If mode is reduce, make amount negative
      const amount =
        modalMode === "reduce"
          ? -Math.abs(parseFloat(addAmount))
          : Math.abs(parseFloat(addAmount));

      const res = await updateAdminUserBalance(selectedUser.id, {
        amount: amount,
        reason: updateReason,
      });

      if (res.data.success) {
        toast.success(
          `${modalMode === "add" ? "Allocated" : "Deducted"} tracking slots for ${selectedUser.name}`,
        );
        setUsers(
          users.map((u) =>
            u.id === selectedUser.id
              ? { ...u, trackingBalance: res.data.newBalance }
              : u,
          ),
        );
        setSelectedUser(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update balance");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const filteredPayments = payments.filter(
    (p) =>
      p.user?.name?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.orderId?.toLowerCase().includes(paymentSearch.toLowerCase()),
  );

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const totalSlotsAllocated = users.reduce(
    (sum, u) => sum + (u.trackingBalance || 0),
    0,
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-[#1c1b18]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <BackButton to="/admin" label="Back to Control Center" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#f0eae1] text-[#6e685f] border border-[#ded7ca] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c1b18]"></span>
              Billing &amp; Quota Administration
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#1c1b18] font-serif">
              Monetization &amp; Quotas
            </h1>
            <p className="text-sm text-[#6e685f] mt-1">
              Audit transaction ledgers, manage slot allocations, and handle plan adjustments.
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ded7ca] text-xs font-semibold uppercase tracking-wider text-[#1c1b18] hover:bg-[#faf6f0] rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Synchronizing..." : "Sync Monetization"}
          </button>
        </div>

        {/* ── STATS OVERVIEW ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "Settled Platform Revenue",
              value: `₹${totalRevenue.toLocaleString()}`,
              icon: CreditCard,
              sub: "Gross verified payments",
            },
            {
              label: "Allocated Tracking Slots",
              value: totalSlotsAllocated.toLocaleString(),
              icon: Wallet,
              sub: "Active inventory across user accounts",
            },
            {
              label: "Successful Orders",
              value: payments.filter((p) => p.status === "paid").length,
              icon: History,
              sub: "Completed checkout events",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white border border-[#ded7ca] rounded-2xl p-6 shadow-sm hover:border-[#b8afa0] transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6e685f] mb-1">
                  {s.label}
                </p>
                <h3 className="text-3xl font-serif text-[#1c1b18] tracking-tight">
                  {s.value}
                </h3>
                <p className="text-xs text-[#9c9489] mt-1">{s.sub}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-[#1c1b18]">
                <s.icon size={22} />
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS ──────────────────────────────────────────────────────── */}
        <div className="flex gap-2 p-1.5 bg-[#f0eae1] border border-[#ded7ca] rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-[#1c1b18] text-[#fcfaf6] shadow-sm"
                : "text-[#6e685f] hover:text-[#1c1b18]"
            }`}
          >
            <Users size={14} />
            User Quotas &amp; Balances
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "payments"
                ? "bg-[#1c1b18] text-[#fcfaf6] shadow-sm"
                : "text-[#6e685f] hover:text-[#1c1b18]"
            }`}
          >
            <History size={14} />
            Payment Ledger
          </button>
        </div>

        {/* ── TABLE CONTAINER ────────────────────────────────────────────── */}
        <div className="bg-white border border-[#ded7ca] rounded-2xl overflow-hidden shadow-sm">
          {/* Search Header */}
          <div className="p-4 border-b border-[#ded7ca] bg-[#faf6f0]">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9c9489]"
                size={16}
              />
              <input
                type="text"
                placeholder={`Search ${activeTab === "users" ? "by name or email address" : "by user, email, or order ID"}...`}
                className="w-full bg-white border border-[#ded7ca] rounded-xl py-2 pl-10 pr-4 text-xs text-[#1c1b18] placeholder-[#9c9489] outline-none focus:border-[#1c1b18] transition-all"
                value={activeTab === "users" ? userSearch : paymentSearch}
                onChange={(e) =>
                  activeTab === "users"
                    ? setUserSearch(e.target.value)
                    : setPaymentSearch(e.target.value)
                }
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "users" ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#faf6f0] text-[#6e685f] text-[10px] font-semibold uppercase tracking-wider border-b border-[#ded7ca]">
                    <th className="px-6 py-3.5">User Identity</th>
                    <th className="px-6 py-3.5">Tier Plan</th>
                    <th className="px-6 py-3.5 text-center">Slots Available</th>
                    <th className="px-6 py-3.5 text-right">Quota Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-[#6e685f] text-sm"
                      >
                        No user accounts match the search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-[#faf6f0]/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-[#1c1b18] font-bold text-sm">
                              {u.name?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#1c1b18]">
                                {u.name}
                              </div>
                              <div className="text-xs text-[#6e685f] font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                              u.planType === "premium"
                                ? "bg-[#1c1b18] text-[#fcfaf6] border-[#1c1b18]"
                                : "bg-[#f0eae1] text-[#6e685f] border-[#ded7ca]"
                            }`}
                          >
                            {u.planType || "Free Standard"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-base font-bold text-[#1c1b18]">
                            {u.trackingBalance || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(u, "add")}
                              className="px-3 py-1.5 rounded-xl bg-[#1c1b18] hover:bg-[#2b2a27] text-[#fcfaf6] text-xs font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                            >
                              <Plus size={13} />
                              Allocate
                            </button>
                            <button
                              onClick={() => openModal(u, "reduce")}
                              className="px-3 py-1.5 rounded-xl bg-[#c84032]/10 border border-[#c84032]/20 text-[#c84032] hover:bg-[#c84032]/20 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1"
                            >
                              <Minus size={13} />
                              Deduct
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#faf6f0] text-[#6e685f] text-[10px] font-semibold uppercase tracking-wider border-b border-[#ded7ca]">
                    <th className="px-6 py-3.5">Transaction Order</th>
                    <th className="px-6 py-3.5">Gross Settlement</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eae1]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-[#6e685f] text-sm"
                      >
                        No payments found matching the specified query.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#faf6f0]/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-[#1c1b18]">
                              <ArrowUpRight size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#1c1b18]">
                                {p.user?.name || "Anonymous Subscriber"}
                              </div>
                              <div className="text-xs text-[#6e685f] font-mono">
                                {p.orderId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-serif text-base font-semibold text-[#1c1b18]">
                          ₹{p.amount}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                              p.status === "paid"
                                ? "bg-[#2d7a4f]/10 text-[#2d7a4f] border-[#2d7a4f]/25"
                                : "bg-[#c84032]/10 text-[#c84032] border-[#c84032]/25"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-xs font-medium text-[#1c1b18]">
                            {new Date(p.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[10px] text-[#6e685f] font-mono mt-0.5">
                            {new Date(p.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── ADJUSTMENT MODAL ────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#1c1b18]/45 backdrop-blur-sm"
                onClick={() => setSelectedUser(null)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 bg-white border border-[#ded7ca] shadow-2xl z-10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-xl">
                    {modalMode === "add" ? "⚡" : "📉"}
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-[#1c1b18]">
                      {modalMode === "add"
                        ? "Allocate Tracking Slots"
                        : "Deduct Tracking Slots"}
                    </h2>
                    <p className="text-xs text-[#6e685f] font-mono truncate max-w-[240px]">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateBalance} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6e685f] block mb-1.5">
                      Quantity of Device Slots
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5"
                      className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl py-3 px-4 text-xl font-mono font-bold text-[#1c1b18] outline-none focus:border-[#1c1b18] focus:ring-1 focus:ring-[#1c1b18] transition-all"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6e685f] block mb-1.5">
                      Administrative Audit Reason
                    </label>
                    <textarea
                      placeholder="e.g. Plan upgrade bonus, customer support adjustment..."
                      className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl py-2.5 px-3.5 text-xs text-[#1c1b18] placeholder-[#9c9489] outline-none focus:border-[#1c1b18] focus:ring-1 focus:ring-[#1c1b18] min-h-[90px] resize-none transition-all"
                      value={updateReason}
                      onChange={(e) => setUpdateReason(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#6e685f] hover:text-[#1c1b18] bg-white border border-[#ded7ca] hover:bg-[#faf6f0] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-[#fcfaf6] ${
                        modalMode === "add"
                          ? "bg-[#1c1b18] hover:bg-[#2b2a27]"
                          : "bg-[#c84032] hover:bg-[#b03528]"
                      } shadow-sm transition-all disabled:opacity-50`}
                    >
                      {updating
                        ? "Saving..."
                        : modalMode === "add"
                          ? "Confirm Allocation"
                          : "Confirm Deduction"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminMonetization;
