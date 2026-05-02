import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Siren, Car, Clock, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const patientIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>
  </div>
  <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}</style>`,
  iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
});

const ambulanceIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.2);animation:ambulancePulse 1.2s ease-in-out infinite;"></div>
    <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#EF4444,#DC2626);border:3px solid white;box-shadow:0 3px 12px rgba(239,68,68,0.5);display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;">🚑</div>
  </div>
  <style>@keyframes ambulancePulse{0%,100%{transform:scale(1);opacity:0.6;}50%{transform:scale(1.6);opacity:0;}}</style>`,
  iconSize: [48, 48], iconAnchor: [24, 24], popupAnchor: [0, -24],
});

function FitBounds({ patientLoc, ambulanceLoc }) {
  const map = useMap();
  useEffect(() => {
    if (patientLoc && ambulanceLoc) {
      const bounds = L.latLngBounds([patientLoc, ambulanceLoc]).pad(0.25);
      map.fitBounds(bounds, { animate: true, duration: 0.8 });
    } else if (patientLoc) {
      map.setView(patientLoc, 15, { animate: true });
    }
  }, [ambulanceLoc]);
  return null;
}

function AmbulanceMarker({ position, vehicleNumber }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (markerRef.current && position) markerRef.current.setLatLng(position);
  }, [position]);
  if (!position) return null;
  return (
    <Marker ref={markerRef} position={position} icon={ambulanceIcon}>
      <Popup>
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <strong>🚑 Ambulance En Route</strong><br />
          <span style={{ fontSize: 12, color: '#6B7280' }}>{vehicleNumber}</span>
        </div>
      </Popup>
    </Marker>
  );
}

export default function PatientSOS() {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [ambulanceLoc, setAmbulanceLoc] = useState(null);
  const [patientLoc, setPatientLoc] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    // Check for an ongoing emergency on mount and restore tracking
    axios.get(`${import.meta.env.VITE_API_URL}/emergency/active`).then(({ data }) => {
      if (data) {
        setRequest(data);
        if (data.patientLat && data.patientLng) setPatientLoc([data.patientLat, data.patientLng]);
        connectSocket(data._id);
        startPolling(data._id);
      }
    }).catch(() => {});

    return () => {
      socketRef.current?.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const connectSocket = (requestId) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
    socketRef.current = socket;
    socket.emit('patient:join', requestId);
    socket.on('driver:location', ({ lat, lng }) => {
      setAmbulanceLoc([lat, lng]);
      setLastUpdate(new Date());
    });
  };

  const startPolling = (requestId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/emergency/status/${requestId}`);
        setRequest(data);
        if (data.status === 'Completed') {
          clearInterval(pollRef.current);
          socketRef.current?.disconnect();
        }
      } catch {}
    }, 10000);
  };

  const reset = () => {
    setRequest(null);
    setAmbulanceLoc(null);
    setPatientLoc(null);
    setLastUpdate(null);
  };

  const handleSOS = async () => {
    setLoading(true);
    try {
      const position = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const { latitude, longitude } = position.coords;
      setPatientLoc([latitude, longitude]);

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/emergency/sos`, {
        patientLat: latitude, patientLng: longitude,
      });
      setRequest(data);
      toast.success('Ambulance dispatched!');
      connectSocket(data._id);
      startPolling(data._id);
    } catch (err) {
      if (err.code === 1) {
        toast.error('Location permission denied. Please enable it and try again.');
      } else {
        toast.error(err.response?.data?.message || 'SOS failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = patientLoc || [19.076, 72.8777];
  const arrived = request?.status === 'Arrived';
  const completed = request?.status === 'Completed';
  const driver = request?.assignedAmbulanceId;

  return (
    <Layout title="Emergency SOS">
      {completed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(46,213,115,0.12)' }}>
            <CheckCircle size={52} color="#2ED573" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl text-text-main mb-2" style={{ fontWeight: 800 }}>Help has arrived</h2>
          <p className="text-sm text-text-sub mb-10 max-w-xs leading-relaxed">
            The ambulance has completed the emergency. You're all set.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={reset}
            style={{
              height: 52, paddingLeft: 36, paddingRight: 36, borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#FFB800,#FF8C42)',
              color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,184,0,0.30)',
            }}
          >
            Back to Safety
          </motion.button>
        </motion.div>
      ) : !request ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-text-sub text-center max-w-xs mb-12 leading-relaxed">
            Press the button to instantly dispatch the nearest ambulance to your GPS location.
          </p>

          {/* Pulsing SOS button */}
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(255,71,87,0.15)',
              animation: 'sosPing 2s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: 12, borderRadius: '50%',
              background: 'rgba(255,71,87,0.1)',
              animation: 'sosPing 2s ease-out infinite 0.4s',
            }} />
            <motion.button
              onClick={handleSOS}
              disabled={loading}
              whileTap={{ scale: 0.93 }}
              style={{
                position: 'absolute', inset: 24, borderRadius: '50%', border: 'none',
                background: 'linear-gradient(135deg,#FF4757,#FF6B81)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 8px 32px rgba(255,71,87,0.45)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Siren size={36} color="#fff" style={{ marginBottom: 4 }} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: 2 }}>
                {loading ? '…' : 'SOS'}
              </span>
            </motion.button>
          </div>

          <style>{`
            @keyframes sosPing {
              0% { transform: scale(0.95); opacity: 0.7; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          `}</style>

          <p className="text-xs text-text-muted mt-10">Tap to call for emergency help</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Driver info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1.5px solid rgba(255,71,87,0.2)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Ambulance Dispatched</p>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,71,87,0.1)', color: '#FF4757', fontWeight: 600 }}>
                {request.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Car size={16} color="#9CA3AF" />
                <div>
                  <p className="text-[10px] text-text-muted">Vehicle</p>
                  <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{driver?.vehicleNumber || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} color="#9CA3AF" />
                <div>
                  <p className="text-[10px] text-text-muted">ETA</p>
                  <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{request.eta} min</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: ambulanceLoc ? '#2ED573' : '#FFB800',
                  boxShadow: ambulanceLoc ? '0 0 6px #2ED573' : 'none',
                }}
              />
              <span className="text-xs text-text-muted">
                {ambulanceLoc
                  ? `Live GPS · updated ${lastUpdate ? Math.round((Date.now() - lastUpdate) / 1000) + 's ago' : 'now'}`
                  : 'Waiting for driver GPS…'}
              </span>
            </div>
          </motion.div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden" style={{ height: 300, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds patientLoc={patientLoc} ambulanceLoc={ambulanceLoc} />
              {patientLoc && (
                <Marker position={patientLoc} icon={patientIcon}>
                  <Popup>📍 Your location</Popup>
                </Marker>
              )}
              <AmbulanceMarker position={ambulanceLoc} vehicleNumber={driver?.vehicleNumber} />
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#3B82F6' }} />
              <span className="text-xs text-text-muted">You</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🚑</span>
              <span className="text-xs text-text-muted">Ambulance {ambulanceLoc ? '(live)' : '(waiting)'}</span>
            </div>
          </div>

          {/* Status bar */}
          {arrived ? (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)' }}>
              <CheckCircle size={18} color="#2ED573" />
              <span className="text-sm" style={{ fontWeight: 600, color: '#2ED573' }}>Ambulance has arrived</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)' }}>
              <Siren size={18} color="#FF4757" />
              <span className="text-sm" style={{ fontWeight: 600, color: '#FF4757' }}>En route to your location</span>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

