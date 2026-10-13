/**
 * GhostLocation.jsx
 *
 * The "Ghost Window" — opened silently by the Service Worker push handler
 * when the sharer's tab is closed but GPS is on.
 *
 * Flow:
 *   SW push arrives → no open windows detected → SW calls clients.openWindow('/ghost?token=TOKEN')
 *   → This page loads → navigator.geolocation.getCurrentPosition() runs (permission already granted)
 *   → Coordinates sent to /api/push/gps-report
 *   → Server emits 'gps-restored' to viewer's Socket.IO room
 *   → This page closes itself (or redirects to track page if close fails)
 *
 * Design: Minimal, ultra-fast, calm luxury light theme.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const STATUS = {
  ACQUIRING: "acquiring",
  REPORTING: "reporting",
  SUCCESS: "success",
  GPS_OFF: "gps_off",
  ERROR: "error",
};

const GhostLocation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const apiBase = searchParams.get("apiBase") || "/api";

  const [status, setStatus] = useState(STATUS.ACQUIRING);
  const [coords, setCoords] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setStatus(STATUS.ERROR);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ latitude, longitude, accuracy });
        setStatus(STATUS.REPORTING);

        try {
          const res = await fetch(`${apiBase}/push/gps-report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, latitude, longitude, accuracy }),
          });

          if (res.ok) {
            setStatus(STATUS.SUCCESS);
          } else {
            setStatus(STATUS.ERROR);
          }
        } catch {
          setStatus(STATUS.ERROR);
        }

        // Close after 2 seconds regardless
        autoClose(2000);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus(STATUS.ERROR);
        } else {
          setStatus(STATUS.GPS_OFF);
        }
        autoClose(1500);
      },
      geoOptions
    );
  }, [token, apiBase]);

  // Countdown for auto-close visual
  useEffect(() => {
    if (status !== STATUS.SUCCESS && status !== STATUS.GPS_OFF) return;
    const t = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const autoClose = (delay) => {
    setTimeout(() => {
      window.close();
      setTimeout(() => {
        if (!window.closed) {
          window.location.replace(`/track/${token}`);
        }
      }, 300);
    }, delay);
  };

  const getStatusConfig = () => {
    switch (status) {
      case STATUS.ACQUIRING:
        return {
          icon: "🛰️",
          title: "Acquiring GPS Signal",
          subtitle: "Sampling high-precision satellite coordinates...",
          color: "#292524",
          badgeBg: "#ece6da",
          badgeBorder: "#ded7ca",
          badgeText: "#44403c",
          showSpinner: true,
        };
      case STATUS.REPORTING:
        return {
          icon: "📡",
          title: "Transmitting Telemetry",
          subtitle: "Relaying encrypted coordinates to server...",
          color: "#854d0e",
          badgeBg: "#fef3c7",
          badgeBorder: "#fde68a",
          badgeText: "#92400e",
          showSpinner: true,
        };
      case STATUS.SUCCESS:
        return {
          icon: "✅",
          title: "Telemetry Synchronized",
          subtitle: coords
            ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} · ±${Math.round(coords.accuracy)}m`
            : "Precise coordinates delivered to active session.",
          color: "#166534",
          badgeBg: "#dcfce7",
          badgeBorder: "#bbf7d0",
          badgeText: "#15803d",
          showSpinner: false,
        };
      case STATUS.GPS_OFF:
        return {
          icon: "📴",
          title: "GPS Unavailable",
          subtitle: "Location services may be inactive. Dismissing window...",
          color: "#c2410c",
          badgeBg: "#ffedd5",
          badgeBorder: "#fed7aa",
          badgeText: "#9a3412",
          showSpinner: false,
        };
      case STATUS.ERROR:
      default:
        return {
          icon: "⚠️",
          title: "Position Inaccessible",
          subtitle: "Please verify mobile location permissions are granted.",
          color: "#b91c1c",
          badgeBg: "#fee2e2",
          badgeBorder: "#fecaca",
          badgeText: "#991b1b",
          showSpinner: false,
        };
    }
  };

  const cfg = getStatusConfig();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fcfaf6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: 24,
      }}
    >
      {/* Background warm subtle ambient radial */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(236,230,218,0.7), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: "relative",
          background: "#ffffff",
          border: "1px solid #ded7ca",
          borderRadius: 24,
          padding: "44px 36px",
          maxWidth: 380,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 40px -15px rgba(28,27,24,0.07), 0 0 1px rgba(28,27,24,0.1)",
        }}
      >
        {/* Brand eyebrow */}
        <p
          style={{
            fontSize: 11,
            letterSpacing: 2.5,
            color: "#78716c",
            textTransform: "uppercase",
            fontWeight: 700,
            margin: "0 0 24px",
          }}
        >
          NexTrack Telemetry
        </p>

        {/* Icon */}
        <div
          style={{
            fontSize: 48,
            marginBottom: 20,
            lineHeight: 1,
          }}
        >
          {cfg.icon}
        </div>

        {/* Spinner */}
        {cfg.showSpinner && (
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e7e0d3",
              borderTop: "3px solid #1c1b18",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 20px",
            }}
          />
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: cfg.color,
            margin: "0 0 8px",
            letterSpacing: -0.3,
            fontFamily: "'Newsreader', Georgia, serif",
          }}
        >
          {cfg.title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 12,
            color: "#57534e",
            margin: "0 0 24px",
            lineHeight: 1.6,
            fontFamily: "monospace",
          }}
        >
          {cfg.subtitle}
        </p>

        {/* Countdown / auto-close badge */}
        {(status === STATUS.SUCCESS || status === STATUS.GPS_OFF) && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "6px 16px",
              background: cfg.badgeBg,
              border: `1px solid ${cfg.badgeBorder}`,
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              color: cfg.badgeText,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: cfg.badgeText,
              }}
            />
            Dismissing in {countdown}s...
          </div>
        )}

        {/* Accuracy badge */}
        {coords && status === STATUS.SUCCESS && (
          <div
            style={{
              marginTop: 16,
              padding: "6px 12px",
              background: "#f7f4ed",
              border: "1px solid #e7e0d3",
              borderRadius: 8,
              fontSize: 11,
              color: "#44403c",
              fontFamily: "monospace",
            }}
          >
            Precision: ±{Math.round(coords.accuracy)} meters
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GhostLocation;
