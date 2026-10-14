import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getTrackingByToken } from "../../services/api";
import geocodingService from "../../services/geocodingService";
import useSocket from "../../hooks/useSocket";
import toast from "react-hot-toast";

// Fix Leaflet default icon using bundled local assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Precise GPS live marker (green pulse)
const liveIcon = new L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#16a34a;border:3px solid white;
    box-shadow:0 0 0 4px rgba(22,163,74,0.35);
    animation:gps-pulse 1.5s ease-in-out infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// IP-mode approximate marker (orange)
const ipIcon = new L.divIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#ea580c;border:3px solid white;
    box-shadow:0 0 0 4px rgba(234,88,12,0.3);
    animation:ip-pulse 2s ease-in-out infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Auto-center map on new position
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], 16);
  }, [position, map]);
  return null;
};

// ── NEURAL PING STATUS BAR ─────────────────────────────────────────────────────
const NeuralPingStatusBar = memo(({
  locationMode,
  sharerOnline,
  offlineEvent,
  ipLocation,
}) => {
  if (locationMode === "gps" && sharerOnline) {
    return (
      <div
        style={{
          background: "#edf7f1",
          border: "1px solid #c4e8d3",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#16a34a",
            animation: "gps-pulse 1.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div>
          <p
            style={{
              color: "#166534",
              fontWeight: 700,
              fontSize: 13,
              margin: 0,
            }}
          >
            ✅ Precision GPS Mode — Live
          </p>
          <p
            style={{ color: "#3f6212", fontSize: 11, margin: "2px 0 0" }}
          >
            Real-time GPS coordinates are streaming. Accuracy: ±5m
          </p>
        </div>
        <div
          style={{
            marginLeft: "auto",
            background: "#dcfce7",
            borderRadius: 6,
            padding: "2px 8px",
          }}
        >
          <span style={{ color: "#15803d", fontSize: 11, fontWeight: 700 }}>
            LIVE
          </span>
        </div>
      </div>
    );
  }

  if (locationMode === "ip" && ipLocation) {
    return (
      <div
        style={{
          background: "#fdf6e9",
          border: "1px solid #f5dfb8",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ea580c",
              animation: "ip-pulse 2s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                color: "#9a3412",
                fontWeight: 700,
                fontSize: 13,
                margin: 0,
              }}
            >
              ⚠️ Internet Mode — GPS is Off
            </p>
            <p
              style={{ color: "#7c2d12", fontSize: 11, margin: "2px 0 0" }}
            >
              Location fetched via mobile network (IP address). Showing approximate area.
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: "#ffedd5",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            <span style={{ color: "#c2410c", fontSize: 11, fontWeight: 700 }}>
              ~IP
            </span>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginTop: 8,
            background: "#fff7ed",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid #fed7aa",
          }}
        >
          <div>
            <p style={{ color: "#9a3412", fontSize: 10, margin: 0, fontWeight: 500 }}>City</p>
            <p style={{ color: "#431407", fontSize: 12, fontWeight: 600, margin: 0 }}>
              {ipLocation.city || "—"}
            </p>
          </div>
          <div>
            <p style={{ color: "#9a3412", fontSize: 10, margin: 0, fontWeight: 500 }}>Country</p>
            <p style={{ color: "#431407", fontSize: 12, fontWeight: 600, margin: 0 }}>
              {ipLocation.country || "—"}
            </p>
          </div>
          <div>
            <p style={{ color: "#9a3412", fontSize: 10, margin: 0, fontWeight: 500 }}>ISP</p>
            <p style={{ color: "#431407", fontSize: 12, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ipLocation.isp || "—"}
            </p>
          </div>
        </div>
        <p style={{ color: "#9a3412", fontSize: 10, margin: "6px 0 0" }}>
          📡 Accuracy: {ipLocation.accuracyNote || "±1–5km"} — Circle on map shows uncertainty radius
        </p>
      </div>
    );
  }

  if (locationMode === "offline" || offlineEvent) {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>📴</span>
        <div>
          <p
            style={{
              color: "#991b1b",
              fontWeight: 700,
              fontSize: 13,
              margin: 0,
            }}
          >
            Target is Offline — Last Known Location Shown
          </p>
          <p
            style={{
              color: "#7f1d1d",
              fontSize: 11,
              margin: "3px 0 0",
            }}
          >
            {offlineEvent?.message ||
              "GPS and browser tab are closed. Attempting background Internet tracking..."}
          </p>
          {offlineEvent?.timestamp && (
            <p
              style={{
                color: "#991b1b",
                fontSize: 10,
                margin: "3px 0 0",
              }}
            >
              Went offline at {offlineEvent.timestamp.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
});

// ── GPS RESTORE NOTIFICATION ──────────────────────────────────────────────────
const GpsRestoredToast = memo(({ locationMode }) => {
  const prevMode = useRef(null);

  useEffect(() => {
    if (prevMode.current === "ip" && locationMode === "gps") {
      toast.success("✅ GPS Restored — Precision tracking resumed!", {
        duration: 5000,
        icon: "🛰️",
      });
    }
    if (prevMode.current === "gps" && locationMode === "ip") {
      toast("⚠️ GPS Offline — Switched to Internet Mode", {
        duration: 5000,
        icon: "📡",
      });
    }
    prevMode.current = locationMode;
  }, [locationMode]);

  return null;
});

const LiveMap = memo(() => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(null);
  const [addrLoading, setAddrLoading] = useState(false);

  const {
    connected,
    location,
    locationHistory,
    trackingStopped,
    error: socketError,
    locationMode,
    sharerOnline,
    ipLocation,
    offlineEvent,
  } = useSocket(token);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrackingByToken(token);
        setTracking(res.data.tracking);
      } catch {
        toast.error("Could not load tracking info.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (socketError) toast.error(socketError);
  }, [socketError]);

  const fetchAddress = useCallback(async (lat, lon) => {
    setAddrLoading(true);
    try {
      const addr = await geocodingService.reverseGeocode(lat, lon);
      setAddress(addr);
    } finally {
      setAddrLoading(false);
    }
  }, []);

  const lastGeocodedRef = useRef({ lat: 0, lon: 0, time: 0 });

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      const now = Date.now();
      const latDiff = Math.abs(location.latitude - lastGeocodedRef.current.lat);
      const lonDiff = Math.abs(location.longitude - lastGeocodedRef.current.lon);
      const timeDiff = now - lastGeocodedRef.current.time;

      // Throttle Nominatim: require > 50m change or > 15s elapsed
      if (latDiff > 0.0005 || lonDiff > 0.0005 || timeDiff > 15000 || !lastGeocodedRef.current.time) {
        lastGeocodedRef.current = { lat: location.latitude, lon: location.longitude, time: now };
        fetchAddress(location.latitude, location.longitude);
      }
    }
  }, [location, fetchAddress]);

  useEffect(() => {
    if (!address && tracking?.latitude && tracking?.longitude) {
      fetchAddress(
        parseFloat(tracking.latitude),
        parseFloat(tracking.longitude),
      );
    }
  }, [tracking, address, fetchAddress]);

  const activePos =
    location ||
    (tracking?.latitude && tracking?.longitude
      ? {
          latitude: parseFloat(parseFloat(tracking.latitude).toFixed(8)),
          longitude: parseFloat(parseFloat(tracking.longitude).toFixed(8)),
        }
      : null);

  const mapCenter =
    location ||
    ipLocation ||
    (tracking?.latitude && tracking?.longitude
      ? {
          latitude: parseFloat(tracking.latitude),
          longitude: parseFloat(tracking.longitude),
        }
      : null);

  const trackingLink = `${window.location.origin}/track/${token}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(trackingLink);
    toast.success("Link copied!");
  }, [trackingLink]);

  const handlePing = useCallback(async () => {
    const toastId = toast.loading("Sending manual ping...");
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API_BASE}/push/ping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Ping sent — user will be notified!", { id: toastId });
      } else {
        toast.error(data.message || "Failed to send ping.", { id: toastId });
      }
    } catch {
      toast.error("Error sending ping.", { id: toastId });
    }
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 min-h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gps-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(22,163,74,0.35); }
          50% { box-shadow: 0 0 0 12px rgba(22,163,74,0); }
        }
        @keyframes ip-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(234,88,12,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(234,88,12,0); }
        }
      `}} />

      <div className="max-w-7xl mx-auto relative z-10">

      {/* GPS Restored / Mode Change Toast Emitter */}
      <GpsRestoredToast locationMode={locationMode} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="card-title text-2xl font-bold text-stone-900 tracking-tight">
              {tracking?.label ? tracking.label : "Live Location Tracking"}
            </h1>
            {tracking?.label && (
              <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Target Device
              </span>
            )}
          </div>
          <p className="caption-metadata text-stone-600 text-sm mt-1 flex items-center gap-2">
            <span>📞 {tracking?.phoneNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {trackingStopped ? (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-rose-50 border-rose-200 text-rose-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Session Ended
            </span>
          ) : locationMode === "gps" && sharerOnline ? (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              GPS Live
            </span>
          ) : locationMode === "ip" ? (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-amber-50 border-amber-200 text-amber-800 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Internet Mode
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-stone-100 border-stone-200 text-stone-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              {connected ? "Waiting for GPS..." : "Connecting..."}
            </span>
          )}

          {!trackingStopped && (
            <button
              onClick={handlePing}
              className="btn-cta-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
            >
              🔔 Ping
            </button>
          )}
          <Link to="/dashboard" className="btn-cta-secondary text-xs px-3 py-1.5 shadow-xs">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── NEURAL PING STATUS BAR ─────────────────────────────────────── */}
      {!trackingStopped && (
        <NeuralPingStatusBar
          locationMode={locationMode}
          sharerOnline={sharerOnline}
          offlineEvent={offlineEvent}
          ipLocation={ipLocation}
        />
      )}

      {/* Tracking stopped banner */}
      {trackingStopped && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🛑</span>
          <div>
            <p className="text-rose-700 font-semibold text-sm">
              Tracking session ended
            </p>
            <p className="text-stone-600 text-xs mt-0.5">
              You deleted this tracking request. The sharer has been notified
              and location sharing has stopped.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Layout — Map as PRIMARY */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
        {/* Left Column: Map */}
        <div className="w-full lg:w-7/12 xl:w-2/3 lg:sticky lg:top-20">
          <div
            className="surface-card p-0 overflow-hidden shadow-sm rounded-2xl border border-stone-200/90"
            style={{
              height: "calc(100vh - 180px)",
              minHeight: "520px",
            }}
          >
            {mapCenter ? (
              <MapContainer
                center={[mapCenter.latitude, mapCenter.longitude]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {/* IP mode uncertainty circle */}
                {locationMode === "ip" && ipLocation && (
                  <Circle
                    center={[ipLocation.latitude, ipLocation.longitude]}
                    radius={2000}
                    pathOptions={{
                      color: "#ea580c",
                      fillColor: "#ea580c",
                      fillOpacity: 0.08,
                      weight: 2,
                      dashArray: "6 4",
                    }}
                  />
                )}

                {/* IP mode marker */}
                {locationMode === "ip" && ipLocation && (
                  <Marker
                    position={[ipLocation.latitude, ipLocation.longitude]}
                    icon={ipIcon}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-semibold text-stone-900 mb-1">
                          📡 Internet-Based Location
                        </p>
                        <p className="text-amber-700 text-xs font-medium mb-2">
                          ⚠️ Approximate — GPS is off
                        </p>
                        <div className="space-y-1 text-stone-600 text-xs">
                          {ipLocation.city && <p>🏙️ {ipLocation.city}</p>}
                          {ipLocation.country && <p>🌍 {ipLocation.country}</p>}
                          {ipLocation.isp && <p>📶 {ipLocation.isp}</p>}
                        </div>
                        <p className="text-stone-400 text-xs mt-2">
                          Accuracy: {ipLocation.accuracyNote || "±1–5km"}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* GPS mode: precise marker */}
                {activePos && locationMode === "gps" && (
                  <Marker
                    position={[activePos.latitude, activePos.longitude]}
                    icon={liveIcon}
                  >
                    <Popup>
                      <div className="text-sm min-w-[180px]">
                        <p className="font-semibold text-stone-900 mb-1">
                          📞 {tracking?.phoneNumber}
                        </p>
                        <p className="text-emerald-700 text-xs font-semibold mb-2">
                          ✅ Precise GPS Location
                        </p>
                        {addrLoading ? (
                          <p className="text-stone-400 text-xs">
                            Fetching address...
                          </p>
                        ) : address ? (
                          <div className="space-y-1 text-xs">
                            <p className="text-stone-800 leading-snug font-medium">
                              {address.formatted}
                            </p>
                            {address.road && <p className="text-stone-500">🛣️ {address.road}</p>}
                            {address.area && <p className="text-stone-500">🏘️ {address.area}</p>}
                            {address.city && <p className="text-stone-500">🏙️ {address.city}</p>}
                          </div>
                        ) : (
                          <p className="text-stone-500 text-xs">
                            {activePos.latitude?.toFixed(6)},{" "}
                            {activePos.longitude?.toFixed(6)}
                          </p>
                        )}
                        <div className="bg-stone-100 rounded p-2 mt-2">
                          <p className="text-stone-700 text-xs font-mono">
                            {activePos.latitude?.toFixed(8)},{" "}
                            {activePos.longitude?.toFixed(8)}
                          </p>
                        </div>
                        {location?.accuracy && (
                          <p className="text-stone-500 text-xs mt-1">
                            GPS ±{Math.round(location.accuracy)}m
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Show last known DB position when in IP/offline mode */}
                {activePos && locationMode !== "gps" && (
                  <Marker
                    position={[activePos.latitude, activePos.longitude]}
                    icon={
                      new L.divIcon({
                        className: "",
                        html: `<div style="
                        width:14px;height:14px;border-radius:50%;
                        background:rgba(120,113,108,0.8);border:2px solid white;
                        box-shadow:0 1px 3px rgba(0,0,0,0.2);
                      "></div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7],
                      })
                    }
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold text-stone-700 mb-1">
                          Last GPS Position
                        </p>
                        <p className="text-stone-400 text-xs">
                          GPS is currently off
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Movement path */}
                {locationHistory.length > 1 && (
                  <Polyline
                    positions={locationHistory.map((p) => [
                      p.latitude,
                      p.longitude,
                    ])}
                    color={locationMode === "gps" ? "#16a34a" : "#6366f1"}
                    weight={3.5}
                    opacity={0.65}
                  />
                )}

                <MapUpdater position={location || ipLocation} />
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-500 bg-[#fbf9f4]">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="font-bold text-stone-900 mb-1 text-base">
                  Waiting for location...
                </p>
                <p className="text-sm text-stone-600 max-w-xs text-center">
                  Share the tracking link to start receiving live GPS data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tracking Details & Telemetry */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-4">
          {/* Neural Ping Info Block */}
          {locationMode === "ip" && ipLocation && (
            <div className="surface-card p-4 border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-800 font-bold text-xs">🛰️ Internet-Mode Telemetry</span>
                <span className="ml-auto text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  Uncertainty Circle
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mb-3">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Region</span>
                  <span className="text-stone-800 font-medium truncate block">
                    {[ipLocation.city, ipLocation.region, ipLocation.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Carrier / ISP</span>
                  <span className="text-stone-800 font-medium truncate block">{ipLocation.isp || "—"}</span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps?q=${ipLocation.latitude},${ipLocation.longitude}&z=13`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5 text-stone-700 shadow-xs"
              >
                🗺️ View Approximate Radius on Maps
              </a>
            </div>
          )}

          {/* PRIMARY CARD: Location & Direct Navigation CTA */}
          <div className="surface-card p-5 space-y-4 border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="eyebrow-pill text-stone-700 bg-stone-100 border border-stone-200">
                Current Pinpoint
              </span>
              <span className="caption-metadata text-xs">
                {activePos?.timestamp
                  ? new Date(activePos.timestamp).toLocaleTimeString()
                  : location?.timestamp
                    ? new Date(location.timestamp).toLocaleTimeString()
                    : "Live Feed"}
              </span>
            </div>

            {/* Address */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                📍 Street Address
              </p>
              {locationMode === "ip" ? (
                <p className="text-base font-semibold text-amber-900 leading-snug">
                  📡 {[ipLocation?.city, ipLocation?.region, ipLocation?.country].filter(Boolean).join(", ") || "Internet-based approximate location"}
                  <span className="text-xs text-amber-700 block mt-1 font-normal">
                    (Target GPS is inactive · showing network area)
                  </span>
                </p>
              ) : addrLoading ? (
                <p className="text-sm text-indigo-700 animate-pulse font-medium">
                  Resolving reverse geocoded address...
                </p>
              ) : address?.formatted ? (
                <p className="text-base font-semibold text-stone-900 leading-snug">
                  {address.formatted}
                </p>
              ) : (
                <p className="text-sm text-stone-500 italic">
                  Awaiting first GPS coordinate broadcast...
                </p>
              )}
            </div>

            {/* Coordinates Spec Strip */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                  Coordinates
                </span>
                <span className="font-mono text-xs text-indigo-700 font-semibold">
                  {(activePos || ipLocation)
                    ? `${(activePos || ipLocation).latitude.toFixed(locationMode === "ip" ? 4 : 6)}, ${(activePos || ipLocation).longitude.toFixed(locationMode === "ip" ? 4 : 6)}`
                    : "—"}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider text-stone-600 bg-white border-stone-200">
                {locationMode === "ip" ? "Approx" : "WGS84"}
              </span>
            </div>

            {/* Primary Action Button */}
            {(activePos || ipLocation) && (
              <a
                href={`https://www.google.com/maps?q=${(activePos || ipLocation).latitude},${(activePos || ipLocation).longitude}&z=${locationMode === "ip" ? 13 : 18}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {locationMode === "ip" ? "Inspect Radius in Google Maps" : "Open in Google Maps"}
              </a>
            )}
          </div>

          {/* TELEMETRY & HARDWARE METRICS STRIP */}
          <div className="surface-card p-4 grid grid-cols-3 gap-3 text-center border-stone-200/90 bg-stone-50/50">
            <div className="p-2 rounded-lg bg-white border border-stone-200/60 shadow-2xs">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Mode</span>
              <span className={`text-xs font-bold mt-0.5 block ${
                locationMode === "gps" ? "text-emerald-700" : locationMode === "ip" ? "text-amber-800" : "text-stone-500"
              }`}>
                {locationMode === "gps" ? "GPS Live" : locationMode === "ip" ? "Internet" : "Offline"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-stone-200/60 shadow-2xs">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Accuracy</span>
              <span className="text-xs font-bold text-stone-900 mt-0.5 block">
                {locationMode === "gps" && location?.accuracy
                  ? `±${Math.round(location.accuracy)}m`
                  : locationMode === "ip"
                    ? "±1–5km"
                    : "—"}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-stone-200/60 shadow-2xs">
              <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider block">Pings</span>
              <span className="text-xs font-bold text-indigo-700 mt-0.5 block">
                {locationHistory.length}
              </span>
            </div>
          </div>

          {/* STRUCTURED GEOGRAPHIC SPECS */}
          <div className="surface-card p-5 border-stone-200/90 space-y-3">
            <h3 className="card-title text-sm font-semibold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
              <span>🏛️</span> Geographic Breakdown
            </h3>
            <div className="divide-y divide-stone-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="text-stone-500">City</span>
                <span className="font-semibold text-stone-900">{address?.city || ipLocation?.city || "—"}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-stone-500">State / Region</span>
                <span className="font-semibold text-stone-900">{address?.state || ipLocation?.region || "—"}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-stone-500">Neighborhood / Area</span>
                <span className="font-semibold text-stone-900 truncate max-w-[180px]">{address?.area || "—"}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-stone-500">Street / Road</span>
                <span className="font-semibold text-stone-900 truncate max-w-[180px]">{address?.road || "—"}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-stone-500">Landmark / Venue</span>
                <span className="font-semibold text-stone-900 truncate max-w-[180px]">{address?.landmark || "—"}</span>
              </div>
            </div>
          </div>

          {/* SHARE TRACKING LINK */}
          <div className="surface-card p-5 border-stone-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="card-title text-xs font-semibold text-stone-900">🔗 Shareable Tracking Link</span>
              <span className="text-[10px] text-stone-500">Recipient uses this URL</span>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                className="input flex-1 text-xs font-mono py-2 bg-stone-50 text-stone-800"
                value={trackingLink}
              />
              <button
                onClick={copyLink}
                className="btn-cta-secondary text-xs px-3.5 whitespace-nowrap shadow-xs"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});

export default LiveMap;
