import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createTracking, getAccessStatus, requestAccess } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingScreen from "../../components/common/LoadingScreen";
import useSocket from "../../hooks/useSocket";
import PhoneInputSection from "../../components/tracking/PhoneInputSection";
import AmbientBackground from "../../components/common/AmbientBackground";

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

  const handlePhoneInputChange = useCallback(({ phoneNumber, label, isValid }) => {
    setForm((prev) => {
      if (
        prev.phoneNumber === phoneNumber &&
        prev.label === label &&
        prev.isValid === isValid
      ) {
        return prev;
      }
      return { ...prev, phoneNumber, label, isValid };
    });
  }, []);

  // Monitor target user's interaction
  const { location, permissionDenied } = useSocket(result?.token);

  useEffect(() => {
    if (location) {
      toast.success("Recipient granted location permission! Redirecting to map...", { id: "redirect-toast", duration: 3000 });
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
      } catch {
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

      toast.success("Tracking link generated successfully!");
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

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Please share your live location with me safely via this secure link: ${result.trackingLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      navigate("/dashboard");
    }, 150);
  };

  useEffect(() => {
    if (isClosing) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsClosing(true);
      closeTimeoutRef.current = setTimeout(() => {
        navigate("/dashboard");
      }, 150);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isClosing, navigate]);

  if (checkingAccess) return <LoadingScreen />;

  // ─── GATEKEEPER 1: PENDING ADMIN APPROVAL ───
  if (!access?.trackingAccess) {
    const status = access?.latestRequest?.status;

    if (status === "pending") {
      return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <AmbientBackground />
          <div className="surface-elevated max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center border-stone-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-4">
              ⏳
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Request Under Review</h1>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              Your request for tracking link generation is currently being reviewed by an administrator. This page will update automatically upon approval.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-cta-secondary px-6 py-2.5 text-xs font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // ─── GATEKEEPER 2: REJECTED REQUEST ───
    if (status === "rejected") {
      return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <AmbientBackground />
          <div className="surface-elevated max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center border-stone-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-3xl mx-auto mb-4">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Access Request Declined</h1>
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-left text-xs mb-6">
              <strong className="block text-rose-900 uppercase font-semibold mb-1">Administrator Note:</strong>
              {access.latestRequest.rejectionReason || "No specific reason was provided."}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setAccess({ ...access, latestRequest: null })}
                className="btn-cta-primary px-6 py-2.5 text-xs font-semibold"
              >
                Submit New Request
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-cta-secondary px-6 py-2.5 text-xs font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ─── GATEKEEPER 3: DEFAULT ACCESS REQUEST FORM ───
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <AmbientBackground />
        <div className="surface-elevated max-w-lg w-full p-8 sm:p-10 rounded-3xl border-stone-200 shadow-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-2xl mx-auto mb-3">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">Approval Required</h1>
            <p className="text-xs text-stone-600">
              To protect recipient privacy and prevent misuse, tracking link creation requires one-time account approval.
            </p>
          </div>

          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="access-reason">
                Intended Use Case <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="access-reason"
                rows={4}
                className="input resize-y"
                placeholder="E.g. Coordinating with family members or monitoring delivery routes..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-cta-primary w-full py-3.5 text-sm font-semibold"
              >
                {loading ? "Submitting Request..." : "Request Generator Access →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN TRACKING GENERATOR ───
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <AmbientBackground />

      <div
        className={`relative z-10 max-w-xl w-full mx-auto transition-all duration-200 ${
          isClosing ? "opacity-0 translate-y-2 scale-[0.98] pointer-events-none" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Header Bar */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 eyebrow-pill mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Encrypted Link Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Create Tracking Link
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Generate a unique tokenized link to request explicit GPS sharing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all text-sm shrink-0 shadow-xs"
          >
            ✕
          </button>
        </div>

        {!result ? (
          /* FORM STATE */
          <div className="surface-elevated p-6 sm:p-8 rounded-3xl border-stone-200/90 shadow-sm bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <PhoneInputSection 
                onChange={handlePhoneInputChange} 
              />

              {/* Consent Warning Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <span className="text-amber-600 text-lg shrink-0 mt-0.5">ℹ️</span>
                <div>
                  <h4 className="text-xs font-semibold text-amber-900 mb-0.5">100% Consent-Based</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The recipient must tap 'Allow Location' in their mobile browser. If they deny permission or close the tab, no coordinates are transmitted.
                  </p>
                </div>
              </div>

              {/* PRIMARY CTA */}
              <div>
                <button 
                  type="submit" 
                  className={`btn-cta-primary w-full py-3.5 text-sm font-bold shadow-xs ${
                    !form.isValid ? "opacity-50 cursor-not-allowed" : ""
                  }`} 
                  disabled={loading || !form.isValid}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Encrypted Link...
                    </span>
                  ) : (
                    "Generate Tracking Link →"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* RESULT STATE (LINK CREATED) */
          <div className="surface-elevated p-8 sm:p-10 rounded-3xl border-stone-200 shadow-md text-center bg-white">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">
              Tracking Link Ready
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mb-6">
              Share this private link with your contact to request their live GPS location.
            </p>

            {/* Generated URL Box */}
            <div className="surface-card p-4 rounded-2xl border-stone-200 mb-6 text-left bg-stone-50/70">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Secure Tracking URL</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active 24h
                </span>
              </div>
              <p className="text-indigo-800 font-mono text-xs sm:text-sm break-all select-all py-1 font-medium">
                {result.trackingLink}
              </p>
            </div>

            {/* ACTION HIERARCHY */}
            <div className="space-y-3 mb-6">
              <button
                onClick={copyLink}
                className="btn-cta-primary w-full py-3.5 text-sm font-bold shadow-xs"
              >
                📋 Copy Tracking Link
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="btn-cta-secondary py-2.5 text-xs font-semibold text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                >
                  💬 Share WhatsApp
                </button>
                <button
                  onClick={() => navigate(`/tracking/map/${result.token}`)}
                  className="btn-cta-secondary py-2.5 text-xs font-semibold"
                >
                  🗺️ Preview Map
                </button>
              </div>
            </div>

            {/* Status note */}
            <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                Listening for recipient response...
              </span>
              <button
                onClick={() => setResult(null)}
                className="text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTracking;
