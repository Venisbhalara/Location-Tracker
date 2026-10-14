import { useState, useEffect } from "react";
import { createGroup } from "../../services/api";
import toast from "react-hot-toast";

const EXPIRY_OPTIONS = [
  { label: "6 Hours", value: 6 },
  { label: "12 Hours", value: 12 },
  { label: "24 Hours", value: 24 },
  { label: "48 Hours", value: 48 },
  { label: "7 Days", value: 168 },
];

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", description: "", expiryHours: 24 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Group name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await createGroup({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        expiryHours: form.expiryHours,
      });
      onCreated(res.data.group);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.data?.code === "NO_TRACKING_ACCESS") {
        toast.error("You don't have tracking access yet. Await admin approval.");
      } else {
        toast.error(msg || "Failed to create group.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#ded7ca] bg-[#fcfaf6] shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#e7e0d3] bg-[#f7f4ed] flex items-center justify-between">
          <div>
            <h2 className="text-stone-900 font-bold text-lg font-serif">Create Tracking Group</h2>
            <p className="text-stone-500 text-xs mt-0.5">Track up to 5 members simultaneously on a shared map</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#ece6da]/60 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Group name */}
          <div>
            <label className="block text-stone-700 text-xs font-semibold mb-1">Group Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder='e.g. "Family Vacation", "Logistics Fleet", "Event Crew"'
              maxLength={100}
              className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-700 text-xs font-semibold mb-1">
              Description <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this group monitoring?"
              maxLength={255}
              className="w-full bg-white border border-[#ded7ca] rounded-xl px-3.5 py-2.5 text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition-all"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-stone-700 text-xs font-semibold mb-1.5">Session Lifetime</label>
            <div className="grid grid-cols-5 gap-1.5">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, expiryHours: opt.value }))}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.expiryHours === opt.value
                      ? "bg-stone-900 border-stone-900 text-[#fcfaf6] shadow-xs"
                      : "bg-white border-[#ded7ca] text-stone-700 hover:border-stone-400 hover:bg-[#f7f4ed]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl bg-[#f7f4ed] border border-[#e7e0d3] p-3.5">
            <p className="text-stone-900 text-xs font-semibold mb-1">💡 Group Workflow Guidance:</p>
            <ul className="text-stone-600 text-xs space-y-1 list-disc list-inside">
              <li>Add member contacts (phone number + display label)</li>
              <li>Each member consumes 1 tracking slot upon generation</li>
              <li>Live positions stream in real time onto your multi-pin map</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-cta-secondary flex-1 py-2.5 text-xs font-medium justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-cta-primary flex-1 py-2.5 text-xs font-semibold justify-center shadow-xs"
            >
              {loading ? "Creating..." : "Create Group →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
