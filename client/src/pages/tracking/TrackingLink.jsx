import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getTrackingByToken } from "../../services/api";
import locationService from "../../services/locationService";
import toast from "react-hot-toast";
import io from "socket.io-client";
import AmbientBackground from "../../components/common/AmbientBackground";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

const REFRESH_INTERVAL_SEC = 10 * 60;

const TrackingLink = () => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState("idle");
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SEC);
  const started = useRef(false);
  const countdownRef = useRef(null);
  const handleAllowRef = useRef(null);

  /* ── Load tracking data ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrackingByToken(token);
        setTracking(res.data.tracking);
      } catch {
        setError("This tracking link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (started.current) locationService.stop();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /* ── Emit denial ── */
  const emitDenial = useCallback(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("connect", () => {
      socket.emit("permission-denied", { token });
      setTimeout(() => socket.disconnect(), 1000);
    });
  }, [token]);

  /* ── Countdown timer ── */
  const startCountdown = useCallback(() => {
    setCountdown(REFRESH_INTERVAL_SEC);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return REFRESH_INTERVAL_SEC;
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ── Allow location ── */
  const handleAllow = async () => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        try {
          await Notification.requestPermission();
        } catch {}
      }
    }

    setConsent("tracking");
    started.current = true;

    locationService.start({
      token,
      onPosition: (pos) => {
        setPosition(pos);
        setConsent("tracking");
        startCountdown();
      },
      onError: (msg) => {
        setError(msg);
        setConsent("error");
        toast.error(msg);
      },
      onPermissionDenied: () => {
        setConsent("denied");
        emitDenial();
      },
      onStopped: () => {
        setConsent("stopped");
        if (countdownRef.current) clearInterval(countdownRef.current);
        toast("The requester ended this tracking session.", { icon: "🛑" });
      },
    });

    startCountdown();
  };

  /* ── Auto-resume handler ── */
  useEffect(() => {
    handleAllowRef.current = handleAllow;
  });

  useEffect(() => {
    if (!tracking) return;
    if (consent !== "idle") return;
    if (started.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "1") return;

    const attemptAutoResume = async () => {
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });
          if (result.state === "granted") {
            await new Promise((r) => setTimeout(r, 500));
            handleAllowRef.current?.();
            return;
          }
        } catch {
          handleAllowRef.current?.();
        }
      } else {
        handleAllowRef.current?.();
      }
    };
    attemptAutoResume();
  }, [tracking, consent]);

  const handleDeny = () => {
    setConsent("denied");
    emitDenial();
  };

  const handleStopSharing = () => {
    locationService.stop();
    setConsent("stopped");
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  /* ══ 1. LOADING STATE ══════════════════════════════════════════════ */
  if (loading)
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Helmet>
          <title>Loading Tracking Link | NexTrack</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AmbientBackground />
        <div className="surface-elevated max-w-sm w-full p-8 rounded-3xl text-center bg-white border-stone-200">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Verifying Link Security...
          </p>
        </div>
      </div>
    );

  /* ══ 2. INVALID / EXPIRED LINK ═════════════════════════════════════ */
  if (error && !tracking)
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Helmet>
          <title>Link Expired | NexTrack</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AmbientBackground />
        <div className="surface-elevated max-w-sm w-full p-8 rounded-3xl text-center border-stone-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Tracking Link Expired</h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            {error || "This tracking session is no longer active. Please request a new link from the sender."}
          </p>
        </div>
      </div>
    );

  /* ══ 3. IDLE (CONSENT SCREEN) ══════════════════════════════════════ */
  if (consent === "idle")
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Helmet>
          <title>Location Permission Request | NexTrack</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AmbientBackground />

        <div className="relative z-10 surface-elevated max-w-md w-full p-8 sm:p-10 rounded-3xl border-stone-200/90 shadow-md text-center bg-white">
          
          {/* Identity Icon */}
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <img src="/location.png" alt="NexTrack" className="w-8 h-8 object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Location Request
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
            A contact has requested to view your live GPS position on a secure private map.
          </p>

          {/* Reassurance & Terms Summary */}
          <div className="surface-card p-4 rounded-2xl border-stone-200 text-left mb-6 space-y-2 bg-stone-50/70">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <span>🔒</span>
              <span>100% Consent-Based &amp; Encrypted</span>
            </div>
            <ul className="text-xs text-stone-600 space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>Requires your explicit browser permission.</li>
              <li>Coordinates stream live and are never permanently stored.</li>
              <li>You can end sharing at any moment by closing this browser tab.</li>
            </ul>
          </div>

          {/* ACTION HIERARCHY */}
          <div className="space-y-3">
            <button
              onClick={handleAllow}
              className="btn-cta-primary w-full py-3.5 text-sm font-bold shadow-xs"
            >
              ✓ Allow Location Sharing
            </button>
            <button
              onClick={handleDeny}
              className="btn-cta-secondary w-full py-2.5 text-xs font-semibold text-stone-600"
            >
              Decline / Cancel
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <p className="text-[11px] text-stone-400">
              NexTrack cannot access your location without your explicit hardware approval.
            </p>
          </div>
        </div>
      </div>
    );

  /* ══ 4. TRACKING ACTIVE ════════════════════════════════════════════ */
  if (consent === "tracking")
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <Helmet>
          <title>Sharing Location Live | NexTrack</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <AmbientBackground />

        <div className="surface-elevated max-w-md w-full p-8 sm:p-10 rounded-3xl border-stone-200 shadow-md text-center bg-white">
          {!position ? (
            /* GPS ACQUIRING */
            <div className="py-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-2xl">📡</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">Acquiring GPS Signal...</h2>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Connecting to satellites and initializing telemetry. Please keep this browser tab open.
              </p>
            </div>
          ) : (
            /* ACTIVE STREAMING */
            <div className="py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-1">
                Location Sharing Active
              </h2>
              <p className="text-xs text-stone-600 mb-6">
                Your coordinates are streaming in real-time to the requester.
              </p>

              <div className="surface-card p-4 rounded-2xl border-stone-200 mb-6 text-xs text-stone-700 space-y-2 text-left bg-stone-50/70">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Transmitting Live
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">GPS Precision</span>
                  <span className="text-stone-900 font-medium">±{Math.round(position.accuracy || 10)}m</span>
                </div>
              </div>

              <button
                onClick={handleStopSharing}
                className="btn-danger w-full py-3 text-xs font-semibold"
              >
                Stop Location Sharing
              </button>
            </div>
          )}
        </div>
      </div>
    );

  /* ══ 5. SESSION STOPPED ═════════════════════════════════════════════ */
  if (consent === "stopped")
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AmbientBackground />
        <div className="surface-elevated max-w-sm w-full p-8 rounded-3xl text-center border-stone-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center text-2xl mx-auto mb-4">
            🛑
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Sharing Stopped</h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Location telemetry has been terminated. You can safely close this browser window.
          </p>
        </div>
      </div>
    );

  /* ══ 6. DENIED ══════════════════════════════════════════════════════ */
  if (consent === "denied")
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AmbientBackground />
        <div className="surface-elevated max-w-sm w-full p-8 rounded-3xl text-center border-stone-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-2xl mx-auto mb-4">
            🚫
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Permission Declined</h1>
          <p className="text-xs text-stone-600 leading-relaxed mb-6">
            You chose not to share your location. No coordinates were transmitted to the requester.
          </p>
          <button
            onClick={handleAllow}
            className="btn-cta-secondary w-full py-2.5 text-xs font-medium"
          >
            Change Mind &amp; Allow
          </button>
        </div>
      </div>
    );

  /* ══ 7. ERROR ═══════════════════════════════════════════════════════ */
  if (consent === "error")
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AmbientBackground />
        <div className="surface-elevated max-w-sm w-full p-8 rounded-3xl text-center border-stone-200 bg-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Location Sensor Error</h1>
          <p className="text-xs text-stone-600 leading-relaxed mb-6">
            {error || "Unable to acquire GPS coordinates from your device."}
          </p>
          <button
            onClick={handleAllow}
            className="btn-cta-primary w-full py-3 text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return null;
};

export default TrackingLink;
