import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { getTrackingByToken } from "../../services/api";
import geocodingService from "../../services/geocodingService";
import useSocket from "../../hooks/useSocket";
import toast from "react-hot-toast";
import BackButton from "../../components/common/BackButton";
import LoadingScreen from "../../components/common/LoadingScreen";

// Leaflet Icon Fixes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const liveIcon = new L.divIcon({
  className: "",
  html: `<div style="
    width:22px;height:22px;border-radius:50%;
    background:#1c1b18;border:3px solid #ffffff;
    box-shadow:0 0 0 4px rgba(28,27,24,0.25), 0 4px 10px rgba(0,0,0,0.15);
    animation:pulse 1.5s ease-in-out infinite;
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.latitude, position.longitude], 16, { animate: true });
  }, [position, map]);
  return null;
};

const InfoCard = ({ icon, label, value, subValue, highlight = false }) => (
  <div className={`bg-white border rounded-2xl p-5 transition-all duration-200 shadow-sm hover:border-[#b8afa0] ${highlight ? 'border-[#1c1b18] ring-1 ring-[#1c1b18]/10' : 'border-[#ded7ca]'}`}>
    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6e685f]">
      <span className="text-sm opacity-90">{icon}</span>
      <span>{label}</span>
    </div>
    <p className={`text-[#1c1b18] font-bold leading-tight ${value?.length > 22 ? 'text-sm' : 'text-lg'}`}>
      {value || "—"}
    </p>
    {subValue && <p className="text-[11px] text-[#6e685f] mt-1 font-medium">{subValue}</p>}
  </div>
);

const AdminMapDetail = () => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState(null);
  const [addrLoading, setAddrLoading] = useState(false);
  const [updates, setUpdates] = useState(0);

  const {
    connected,
    location,
    locationHistory,
  } = useSocket(token);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrackingByToken(token);
        setTracking(res.data.tracking);
      } catch {
        toast.error("Could not load session data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const fetchAddress = useCallback(async (lat, lon) => {
    if (addrLoading) return;
    setAddrLoading(true);
    try {
      const addr = await geocodingService.reverseGeocode(lat, lon);
      setAddress(addr);
      setUpdates(prev => prev + 1);
    } finally {
      setAddrLoading(false);
    }
  }, [addrLoading]);

  useEffect(() => {
    if (location?.latitude) {
      fetchAddress(location.latitude, location.longitude);
    } else if (tracking?.latitude && !address) {
      fetchAddress(parseFloat(tracking.latitude), parseFloat(tracking.longitude));
    }
  }, [location, tracking, address, fetchAddress]);

  if (loading) return <LoadingScreen />;

  const activePos = location || (tracking?.latitude ? {
    latitude: parseFloat(tracking.latitude),
    longitude: parseFloat(tracking.longitude)
  } : null);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 min-h-[calc(100vh-64px)]">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .leaflet-container { border-radius: 20px; }
      `}</style>

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton to="/admin/tracking" label="Back to Active Sessions" />
        <div className={`px-4 py-2 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm ${connected ? 'bg-[#2d7a4f]/10 border-[#2d7a4f]/30 text-[#2d7a4f]' : 'bg-[#f0eae1] border-[#ded7ca] text-[#6e685f]'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2d7a4f] animate-pulse' : 'bg-[#9c9489]'}`}></span>
          {connected ? 'Live Feed Connected' : 'Connecting Data Link...'}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* LEFT: MAP PANEL */}
        <div className="lg:w-1/2 min-h-[500px] lg:min-h-0 flex flex-col gap-4">
          <div className="flex-1 rounded-2xl border border-[#ded7ca] bg-white relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
            {activePos ? (
              <MapContainer
                center={[activePos.latitude, activePos.longitude]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[activePos.latitude, activePos.longitude]} icon={liveIcon}>
                  <Popup className="admin-map-popup">
                    <div className="p-1 font-sans">
                      <p className="font-bold text-[#1c1b18] mb-1">🎯 Live Telemetry</p>
                      <p className="text-xs text-[#6e685f] font-mono">
                        {activePos.latitude.toFixed(6)}, {activePos.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                
                {locationHistory.length > 1 && (
                  <Polyline 
                    positions={locationHistory.map(p => [p.latitude, p.longitude])} 
                    color="#1c1b18" 
                    weight={3} 
                    opacity={0.7} 
                    dashArray="6, 6" 
                  />
                )}
                
                <MapUpdater position={location} />
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#6e685f] gap-4 p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#f0eae1] border border-[#ded7ca] flex items-center justify-center text-3xl animate-pulse">
                  📡
                </div>
                <p className="text-sm font-medium">Establishing Geospatial Coordinates...</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INSIGHTS GRID */}
        <div className="lg:w-1/2 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#ded7ca] flex items-center justify-center shadow-sm">
              <img src="/location.png" alt="NexTrack" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-normal text-[#1c1b18] tracking-tight">Location Telemetry</h2>
              <p className="text-xs text-[#6e685f]">Detailed reverse-geocoded spatial intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* FULL WIDTH ADDRESS */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white border border-[#ded7ca] p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6e685f]">
                  <span className="text-sm">📍</span> Reverse Geocoded Address
                </div>
                {addrLoading ? (
                  <div className="flex items-center gap-2 text-[#6e685f] text-sm font-medium py-1">
                    <div className="w-4 h-4 border-2 border-[#1c1b18] border-t-transparent rounded-full animate-spin"></div>
                    Resolving coordinates into physical address...
                  </div>
                ) : (
                  <p className="text-base sm:text-lg font-medium text-[#1c1b18] leading-relaxed">
                    {address?.formatted || "Awaiting precise coordinate lock from device..."}
                  </p>
                )}
              </div>
            </div>

            {/* COMPANY / BUILDING / LANDMARK */}
            <InfoCard icon="🏢" label="Organization" value={address?.company || "—"} />
            <InfoCard icon="🏙️" label="Premises" value={address?.building || "—"} />
            <InfoCard icon="🏛️" label="Landmark" value={address?.landmark || "—"} />

            {/* CITY / STATE / STATUS */}
            <InfoCard icon="🏙️" label="City" value={address?.city || "Surat"} />
            <InfoCard icon="📌" label="State / Region" value={address?.state || "Gujarat"} />
            <div className="bg-white border border-[#ded7ca] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6e685f]">
                <span>📡</span> Connection Mode
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#2d7a4f]' : 'bg-[#9c9489]'}`}></span>
                <p className="text-[#1c1b18] font-bold text-base">{connected ? 'Active Ping' : 'Idle'}</p>
              </div>
            </div>

            {/* GPS ACCURACY */}
            <div className="bg-white border border-[#ded7ca] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6e685f]">
                <span>🛰️</span> GPS Accuracy
              </div>
              <p className="text-[#1c1b18] font-bold text-base font-mono">
                {location?.accuracy ? `±${Math.round(location.accuracy)} meters` : "Standard Fix"}
              </p>
            </div>

            {/* COORDINATES & GOOGLE MAPS */}
            <div className="md:col-span-2 lg:col-span-2 bg-[#faf6f0] border border-[#ded7ca] p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#6e685f] mb-1">
                  <span>🔍</span> High-Precision Coordinates
                </div>
                <p className="text-[#1c1b18] font-mono text-sm font-semibold mb-4">
                  {activePos?.latitude?.toFixed(8) || "0.00000000"}, {activePos?.longitude?.toFixed(8) || "0.00000000"}
                </p>
              </div>
              <a 
                href={activePos ? `https://www.google.com/maps?q=${activePos.latitude},${activePos.longitude}` : "#"}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1c1b18] hover:bg-[#2b2a27] text-[#fcfaf6] text-xs font-semibold py-3 rounded-xl transition-all shadow-sm uppercase tracking-wider"
              >
                <span>📍</span> Open External Satellite Map
              </a>
            </div>

            {/* STREET / AREA / TOTAL UPDATES */}
            <InfoCard icon="🗺️" label="Street" value={address?.road || "—"} />
            <InfoCard icon="🏘️" label="District" value={address?.suburb || address?.neighbourhood || "—"} />
            <InfoCard icon="📶" label="Updates Synced" value={updates.toString()} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMapDetail;
