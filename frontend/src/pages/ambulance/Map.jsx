import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const patientIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(255,71,87,0.2);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="width:18px;height:18px;border-radius:50%;background:#FF4757;border:3px solid white;box-shadow:0 2px 8px rgba(255,71,87,0.4);"></div>
  </div>
  <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}</style>`,
  iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#4ECDC4,#44B8B0);border:3px solid white;box-shadow:0 3px 12px rgba(78,205,196,0.5);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;">🚑</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -19],
});

export default function AmbulanceMap() {
  const [request, setRequest] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/ambulance/active-request`)
      .then((r) => setRequest(r.data))
      .finally(() => setLoading(false));

    const watchId = navigator.geolocation.watchPosition(({ coords }) => {
      setDriverLoc([coords.latitude, coords.longitude]);
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const patientLoc = request ? [request.patientLat, request.patientLng] : null;
  const center = patientLoc || driverLoc || [19.076, 72.8777];

  return (
    <Layout title="Live Map">
      {loading ? <Spinner /> : (
        <div className="rounded-2xl overflow-hidden" style={{ height: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {driverLoc && (
              <Marker position={driverLoc} icon={driverIcon}>
                <Popup>🚑 Your location</Popup>
              </Marker>
            )}
            {patientLoc && (
              <Marker position={patientLoc} icon={patientIcon}>
                <Popup>📍 Patient — {request?.patientId?.name}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}

      {request && (
        <div className="mt-4 bg-card rounded-2xl p-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} color="#FF4757" />
            <p className="text-xs text-text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Destination
            </p>
          </div>
          <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{request.patientId?.name}</p>
          <p className="text-xs text-text-muted font-mono mt-1">
            {request.patientLat?.toFixed(5)}, {request.patientLng?.toFixed(5)}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-5 px-1 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🚑</span>
          <span className="text-xs text-text-muted">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#FF4757' }} />
          <span className="text-xs text-text-muted">Patient</span>
        </div>
      </div>
    </Layout>
  );
}
