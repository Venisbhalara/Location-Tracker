import { useState, useEffect } from "react";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";
import {
  getAdminAccessRequests,
  updateAdminAccessRequest,
} from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import { RefreshCw } from "lucide-react";

const AdminAccess = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    try {
      const res = await getAdminAccessRequests();
      setRequests(res.data);
      if (showToast) toast.success("Queue refreshed");
    } catch {
      toast.error("Failed to load access requests queue.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      setRequests(
        requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
      );
      await updateAdminAccessRequest(id, { status: "approved" });
      toast.success("User access approved. Notification email dispatched!");
    } catch {
      toast.error("Failed to approve access.");
      fetchRequests();
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    const id = rejecting.id;
    try {
      setRequests(
        requests.map((r) =>
          r.id === id ? { ...r, status: "rejected", rejectionReason } : r,
        ),
      );
      await updateAdminAccessRequest(id, {
        status: "rejected",
        rejectionReason,
      });
      toast.success("User access rejected. Notification email dispatched!");
      setRejecting(null);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject access.");
      fetchRequests();
    }
  };

  if (loading) return <LoadingScreen />;

  const filteredRequests = requests.filter(
    (r) => filter === "all" || r.status === filter,
  );

  filteredRequests.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-stone-900">
      <BackButton />

      <div className="mb-8 pb-4 border-b border-[#e7e0d3]">
        <div className="inline-flex items-center gap-2 eyebrow-pill mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          <span>Gateway Authorizations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif tracking-tight">
          Access Approval Queue
        </h1>
        <p className="text-stone-500 mt-1 text-xs sm:text-sm">
          Review operator clearance requests for generating real-time location tracking links.
        </p>
      </div>

      <div className="surface-card border border-[#ded7ca] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center shadow-xs bg-white">
        <div className="flex bg-[#ece6da] p-1 rounded-xl w-full sm:w-auto overflow-x-auto border border-[#ded7ca]">
          {["all", "pending", "approved", "rejected"].map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === state
                  ? "bg-white text-stone-900 shadow-xs border border-[#ded7ca]"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
              {state === "pending" &&
                requests.some((r) => r.status === "pending") && (
                  <span className="ml-2 bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {requests.filter((r) => r.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </div>

        <button
          onClick={() => fetchRequests(true)}
          disabled={isRefreshing}
          className="btn-cta-secondary flex items-center gap-2 px-4 py-2 text-xs font-semibold w-full sm:w-auto justify-center"
        >
          <RefreshCw
            size={14}
            className={
              isRefreshing
                ? "animate-spin text-stone-900"
                : "text-stone-500 group-hover:text-stone-900 transition-colors"
            }
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Queue"}</span>
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="surface-card border border-[#ded7ca] rounded-2xl p-16 text-center bg-white shadow-xs">
          <div className="text-3xl mb-3">📭</div>
          <p className="text-stone-600 text-sm font-medium">
            No access requests matching your filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {filteredRequests.map((r) => (
            <div
              key={r.id}
              className="surface-card rounded-2xl p-5 border border-[#ded7ca] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-xs hover:border-stone-400 transition-all bg-white"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    {r.user?.name}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">
                    {r.user?.email}
                  </span>
                  {r.status === "pending" && (
                    <span className="bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-amber-200">
                      Pending Approval
                    </span>
                  )}
                  {r.status === "approved" && (
                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
                      Approved
                    </span>
                  )}
                  {r.status === "rejected" && (
                    <span className="bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border border-rose-200">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="bg-[#f7f4ed] p-3 rounded-xl border border-[#e7e0d3] mt-2 inline-block max-w-xl">
                  <p className="text-stone-700 text-xs leading-relaxed italic">
                    "{r.reason || "No operational context specified."}"
                  </p>
                </div>

                <div className="text-[11px] text-stone-500 mt-2.5 font-mono">
                  Requested: {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              {r.status === "pending" && (
                <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="btn-cta-primary py-2 px-5 flex-1 text-xs font-semibold justify-center shadow-xs"
                  >
                    Grant Access
                  </button>
                  <button
                    onClick={() => setRejecting(r)}
                    className="btn-danger py-2 px-5 flex-1 text-xs font-semibold justify-center"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#ded7ca] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-stone-900 font-serif mb-2">
              Decline Access Request
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
              Specify reason for declining{" "}
              <strong className="text-stone-900">{rejecting.user?.name}</strong>. This explanation will be provided in their portal notification.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                className="w-full bg-[#fcfaf6] border border-[#ded7ca] rounded-xl p-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all min-h-[110px] resize-y mb-4"
                placeholder="E.g., Incomplete verification details or organizational quota reached..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejecting(null)}
                  className="btn-cta-secondary flex-1 py-2 text-xs font-semibold justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger flex-1 py-2 text-xs font-semibold justify-center"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccess;
