import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTracking, getAccessStatus, requestAccess } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingScreen from "../../components/common/LoadingScreen";
import useSocket from "../../hooks/useSocket";
import PhoneInputSection from "../../components/tracking/PhoneInputSection";

const CreateTracking = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phoneNumber: "",
    trackingType: "location",
    label: "",
    isValid: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  // Monitor target user's interaction
  const { location, permissionDenied } = useSocket(result?.token);

  useEffect(() => {
    if (location) {
      toast.success("Target allowed location! Redirecting to map...", { id: "redirect-toast", duration: 3000 });
      const timer = setTimeout(() => navigate(`/tracking/map/${result.token}`), 1500);
      return () => clearTimeout(timer);
    }
  }, [location, navigate, result]);

  useEffect(() => {
    if (permissionDenied) {
      toast.error("Target rejected the location permission.", { id: "denied-toast", duration: 5000 });
    }
  }, [permissionDenied]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Access State
  const [access, setAccess] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await getAccessStatus();
        setAccess(res.data);
      } catch (err) {
        toast.error("Failed to verify access permissions.");
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
  }, []);

  // Poll for status updates when request is pending
  useEffect(() => {
    let intervalId = null;

    if (access?.latestRequest?.status === "pending" && !access?.trackingAccess) {
      intervalId = setInterval(async () => {
        try {
          const res = await getAccessStatus();
          if (res.data.trackingAccess) {
            setAccess(res.data);
            toast.success("Admin approved your request! Access granted.", {
              id: "approval-success",
              duration: 5000,
            });
            clearInterval(intervalId);
          } else if (res.data.latestRequest?.status === "rejected") {
            setAccess(res.data);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [access?.latestRequest?.status, access?.trackingAccess]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await requestAccess({ reason });
      setAccess((prev) => ({ ...prev, latestRequest: res.data.request }));
      toast.success("Access request submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTracking(form);
      setResult(res.data);
      
      // Update global user balance
      if (res.data.newBalance !== undefined) {
        updateUser({ trackingBalance: res.data.newBalance });
      }

      toast.success("Tracking link created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create tracking link.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.trackingLink);
    toast.success("Link copied to clipboard!");
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      const canGoBack = window.history.state?.idx > 0;
      navigate(canGoBack ? -1 : "/dashboard");
    }, 220);
  };

  useEffect(() => {
    if (isClosing) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        const canGoBack = window.history.state?.idx > 0;
        navigate(canGoBack ? -1 : "/dashboard");
      }, 220);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClosing, navigate]);

  if (checkingAccess) return <LoadingScreen />;

  // ─── GATEKEEPER LOGIC ─────────────────────────────────────────────
  if (!access?.trackingAccess) {
    const status = access?.latestRequest?.status;

    if (status === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0d0d17' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]" style={{ background: '#f59e0b' }} />
          <div className="relative z-10 max-w-2xl w-full mx-auto px-4 text-center">
            <div className="text-7xl mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">⏳</div>
            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Request Pending</h1>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Your request for tracking access is currently being reviewed by an administrator. Please check back later.
            </p>
          </div>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0d0d17' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[100px]" style={{ background: '#ef4444' }} />
          <div className="relative z-10 max-w-2xl w-full mx-auto px-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">❌</div>
            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Request Rejected</h1>
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-2xl mb-8 max-w-md mx-auto text-left shadow-lg backdrop-blur-md">
              <strong className="block mb-2 text-red-300 uppercase tracking-widest text-xs">Admin Reason</strong> 
              <span className="text-sm">{access.latestRequest.rejectionReason || "No specific reason provided."}</span>
            </div>
            <button onClick={() => setAccess({ ...access, latestRequest: null })} className="nextrack-btn-primary px-8 py-3.5">
              Submit New Request
            </button>
          </div>
        </div>
      );
    }

    // Default Lock Form
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0d0d17' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[100px]" style={{ background: '#6366f1' }} />
        <div className="relative z-10 max-w-xl w-full mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">🔒</div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Access Required</h1>
            <p className="text-slate-400 text-lg">You need admin approval to use location tracking features.</p>
          </div>

          <div className="p-8 rounded-3xl border border-white/[0.08] shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Why do you need access? <span className="text-slate-500">(Optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 min-h-[120px] resize-y"
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => {
                    e.target.style.border = "1px solid rgba(99,102,241,0.6)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08)";
                  }}
                  onBlur={e => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                  placeholder="E.g., I want to track my family members for safety..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <button type="submit" className="nextrack-btn-primary w-full py-4 mt-2" disabled={loading}>
                {loading ? "Submitting Request..." : "Request Access"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN TRACKING GENERATOR ──────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a10]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-40px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}} />
      
      {/* Animated Premium LED Grid & Orbs Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden flex justify-center">
        <div className="absolute inset-0 bg-grid opacity-70"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-cyan-600/15 blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div
        className={`relative z-10 max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ease-out ${isClosing ? "opacity-0 translate-y-3 scale-[0.98] pointer-events-none" : "opacity-100 translate-y-0 scale-100"}`}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-0.5 text-[11px] font-medium text-indigo-400 mb-2">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              Generator
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Tracking Link</h1>
            <p className="text-slate-400 text-xs mt-1">
              Generate a secure, encrypted link to request location permission.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {!result ? (
          <div className="rounded-2xl p-5 sm:p-6 border border-white/[0.08] backdrop-blur-xl shadow-2xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <PhoneInputSection 
                onChange={({ phoneNumber, label, isValid }) => 
                  setForm(prev => ({ ...prev, phoneNumber, label, isValid }))
                } 
              />

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Tracking Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {["location"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, trackingType: type })}
                      className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition-all duration-300 ${form.trackingType === type ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner ${form.trackingType === type ? 'bg-indigo-500/20' : 'bg-black/20'}`}>
                        📍
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm capitalize tracking-wide">
                          Live {type}
                        </div>
                        <div className="text-[10px] mt-0.5 text-slate-400">
                          Capture continuous high-precision GPS coordinates via WebSocket
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm flex-shrink-0 shadow-inner">
                  ⚠️
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold text-xs mb-0.5">Consent Required</h4>
                  <p className="text-amber-200/70 text-xs leading-relaxed">
                    The recipient must explicitly allow location access in their browser before any data is collected or transmitted.
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                className={`nextrack-btn-primary py-3 mt-1 text-sm ${!form.isValid ? "opacity-50 cursor-not-allowed" : ""}`} 
                disabled={loading || !form.isValid}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Secure Link...
                  </span>
                ) : (
                  "Generate Tracking Link"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
            
            <div className="p-8 sm:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 text-4xl mb-5 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  ✓
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                  Link Ready
                </h2>
                <p className="text-slate-400">
                  Share this secure payload to begin tracking.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking URL</p>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-indigo-300 break-all font-mono leading-relaxed select-all text-sm">
                  {result.trackingLink}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button onClick={copyLink} className="nextrack-btn-ghost flex-1 py-3.5">
                  <span className="mr-2">📋</span> Copy Link
                </button>
                <button onClick={() => navigate(`/tracking/map/${result.token}`)} className="nextrack-btn-primary flex-1 py-3.5 shadow-indigo-500/20">
                  <span className="mr-2">🗺️</span> Open Map
                </button>
              </div>

              <button onClick={() => setResult(null)} className="w-full text-center text-slate-500 hover:text-white text-sm transition-colors py-2 font-medium">
                ← Generate another link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTracking;
