import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";
import { getAdminTrackingSessions } from "../../services/api";
import LoadingScreen from "../../components/common/LoadingScreen";
import BackButton from "../../components/common/BackButton";
import toast from "react-hot-toast";

// Ensure correct API fallback
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5005";

// Fix Leaflet blank marker bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Admin pin style - refined light luxury marker
const activeIcon = new L.divIcon({
  className: "",
  html: `<div style="
    width:22px;height:22px;border-radius:50%;
    background:#1c1b18;border:3px solid #ffffff;
    box-shadow:0 0 0 3px rgba(28,27,24,0.25), 0 3px 8px rgba(0,0,0,0.15);
    animation:pulse 2s ease-in-out infinite;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Auto-pan Leaflet map to targeted coords
const MapController = ({ focusPos }) => {
  const map = useMap();
  useEffect(() => {
    if (focusPos) {
      map.flyTo([focusPos.latitude, focusPos.longitude], 15, { animate: true, duration: 1.5 });
    }
  }, [focusPos, map]);
  return null;
};

const AdminLiveMap = () => {
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);
  const [focusedToken, setFocusedToken] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getAdminTrackingSessions();
        // Index by token for quick updates
        const indexed = {};
        res.data
          .filter(s => s.status === 'active' && s.latitude && s.longitude)
          .forEach((s) => {
            indexed[s.token] = {
              ...s,
              latitude: parseFloat(s.latitude),
              longitude: parseFloat(s.longitude),
              history: [{ latitude: parseFloat(s.latitude), longitude: parseFloat(s.longitude) }]
            };
          });
        setSessions(indexed);
      } catch (err) {
        toast.error("Failed to load map targets");
      } finally {
        setLoading(false);
      }
    };
    init();

    // Establish socket
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-admin-global");
    });

    // Listen to all location drops
    socketRef.current.on("admin-location-update", (data) => {
      const { token, latitude, longitude, timestamp } = data;
      setSessions(prev => {
        const existing = prev[token];
        if (!existing) return prev; // Ignore payloads not initially pulled
        
        const nextPos = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        return {
          ...prev,
          [token]: {
            ...existing,
            ...nextPos,
            updatedAt: timestamp,
            history: [...(existing.history || []), nextPos]
          }
        };
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  if (loading) return <LoadingScreen />;

  const activeTargets = Object.values(sessions);
  const centerPos = focusedToken && sessions[focusedToken] 
    ? sessions[focusedToken] 
    : (activeTargets.length > 0 ? activeTargets[0] : { latitude: 20, longitude: 0 }); // Fallback to equator

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] flex flex-col space-y-6">
      <BackButton to="/admin" label="Back to Control Center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#f0eae1] text-[#6e685f] border border-[#ded7ca] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d7a4f] animate-pulse"></span>
            Geospatial Telemetry Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#1c1b18] font-serif">
            Global Live Recon
          </h1>
          <p className="text-sm text-[#6e685f] mt-1">Real-time geospatial plotting of all active device handshakes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-[#ded7ca] text-xs font-mono font-medium text-[#1c1b18] shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2d7a4f]"></span>
            <span>{activeTargets.length} ACTIVE SESSIONS</span>
          </div>
        </div>
      </div>

      {/* Main Map Rig */}
      <div className="flex-1 bg-white border border-[#ded7ca] rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)] relative min-h-[460px]">
        {activeTargets.length === 0 && (
          <div className="absolute inset-0 z-50 bg-[#fcfaf6]/90 backdrop-blur-sm flex items-center justify-center pointer-events-none p-6">
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-2xl">
                📡
              </div>
              <p className="text-[#1c1b18] font-serif text-xl font-normal">No active tracking sessions</p>
              <p className="text-xs text-[#6e685f] mt-1.5 leading-relaxed">
                Waiting for client beacons or mobile sessions to initialize real-time transmission.
              </p>
            </div>
          </div>
        )}

        <MapContainer
          center={[centerPos.latitude, centerPos.longitude]}
          zoom={activeTargets.length > 0 ? 4 : 2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {activeTargets.map(target => (
            <div key={target.token}>
              <Marker position={[target.latitude, target.longitude]} icon={activeIcon}>
                <Popup className="admin-map-popup">
                  <div className="font-sans p-1">
                    <div className="flex justify-between items-center border-b border-[#ded7ca] pb-2 mb-2">
                      <p className="font-bold text-[#1c1b18]">📱 {target.phoneNumber}</p>
                      <span className="bg-[#2d7a4f]/10 text-[#2d7a4f] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
                    </div>
                    <p className="text-xs text-[#6e685f] font-medium mb-0.5">Owner: <span className="text-[#1c1b18] font-semibold">{target.user?.name || "Unassigned"}</span></p>
                    <p className="text-xs text-[#6e685f] font-medium mb-2.5">Ping: <span className="font-mono text-[#1c1b18]">{new Date(target.updatedAt).toLocaleTimeString()}</span></p>
                    
                    <div className="bg-[#fcfaf6] border border-[#ded7ca] rounded-lg p-2">
                      <p className="text-[10px] uppercase font-bold text-[#6e685f] mb-0.5 tracking-wider">Coordinates</p>
                      <p className="font-mono text-xs text-[#1c1b18] font-semibold">{target.latitude.toFixed(6)}, {target.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Movement Trail */}
              {target.history && target.history.length > 1 && (
                <Polyline 
                  positions={target.history.map(p => [p.latitude, p.longitude])} 
                  color={focusedToken === target.token ? "#1c1b18" : "#8c8273"} 
                  weight={focusedToken === target.token ? 4 : 2}
                  opacity={focusedToken === target.token ? 0.85 : 0.45}
                />
              )}
            </div>
          ))}

          <MapController focusPos={focusedToken ? sessions[focusedToken] : null} />
        </MapContainer>
      </div>

      {/* Ground Control Target Selection */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6e685f]">
            Active Telemetry Feeds ({activeTargets.length})
          </h2>
          <span className="text-xs text-[#9c9489]">Click a target to auto-pan map</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {activeTargets.length === 0 ? (
            <div className="w-full py-6 text-center text-xs text-[#9c9489] bg-white border border-[#ded7ca] rounded-xl">
              No live telemetry targets connected at this time.
            </div>
          ) : (
            activeTargets.map(target => {
              const isFocused = focusedToken === target.token;
              return (
                <div 
                  key={target.token} 
                  onClick={() => setFocusedToken(target.token)}
                  className={`snap-start min-w-[300px] cursor-pointer transition-all duration-200 rounded-xl p-4 bg-white shadow-sm border ${isFocused ? 'border-[#1c1b18] ring-2 ring-[#1c1b18]/10 shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-[#ded7ca] hover:border-[#b8afa0]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-sm">
                        🎯
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm ${isFocused ? 'text-[#1c1b18]' : 'text-[#2b2a27]'}`}>{target.phoneNumber}</h3>
                        <p className="text-[11px] font-mono text-[#9c9489]">ID: {target.token.slice(0,8)}</p>
                      </div>
                    </div>
                    {isFocused && (
                      <span className="bg-[#1c1b18] text-[#fcfaf6] text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold tracking-wider">
                        FOCUSED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#fcfaf6] border border-[#ded7ca]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6e685f]">User</span>
                      <span className="text-[#1c1b18] font-medium truncate max-w-[140px]">{target.user?.email || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#6e685f]">Latency</span>
                      <span className="text-[#2b2a27] font-mono font-medium">
                        {Math.max(0, Math.floor((new Date() - new Date(target.updatedAt))/1000))}s ago
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminLiveMap;
