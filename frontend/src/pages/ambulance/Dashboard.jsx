import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, AlertTriangle, MapPin, Clock, CheckCircle, Radio } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function AmbulanceDashboard() {
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLoc, setDriverLoc] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const socketRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => { requestRef.current = request; }, [request]);

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/ambulance/active-request`)
      .then((r) => setRequest(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace('/api', ''), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('driver:join', user._id);
    socket.on('emergency:assigned', () => { load(); toast('🚨 New emergency assigned!'); });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoError(true); return; }
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude: lat, longitude: lng } = coords;
          setDriverLoc({ lat, lng });
          setGeoError(false);
          axios.put(`${import.meta.env.VITE_API_URL}/ambulance/location`, { lat, lng });
          if (requestRef.current) {
            socketRef.current?.emit('driver:location', { requestId: requestRef.current._id, lat, lng });
          }
        },
        () => setGeoError(true)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (endpoint) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/emergency/${endpoint}/${request._id}`);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Layout title="Ambulance">
      {geoError && (
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
          style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)' }}>
          <AlertTriangle size={16} color="#FF4757" />
          <p className="text-xs" style={{ color: '#FF4757', fontWeight: 500 }}>
            Location access required. Enable it in your browser settings.
          </p>
        </div>
      )}

      {/* GPS card */}
      <div className="bg-card rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Radio size={14} color={driverLoc ? '#2ED573' : '#9CA3AF'} />
          <p className="text-xs text-text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live GPS</p>
        </div>
        {driverLoc ? (
          <p className="text-sm font-mono" style={{ color: '#2ED573', fontWeight: 600 }}>
            {driverLoc.lat.toFixed(6)}, {driverLoc.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-text-muted">Acquiring location…</p>
        )}
      </div>

      {loading ? <Spinner /> : !request ? (
        <div className="flex flex-col items-center justify-center py-14 bg-card rounded-2xl"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(46,213,115,0.12)' }}>
            <CheckCircle size={32} color="#2ED573" />
          </div>
          <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Available</p>
          <p className="text-xs text-text-muted mt-1">Waiting for emergency assignments</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl p-4"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', border: '1.5px solid rgba(255,71,87,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Active Emergency</p>
            <StatusBadge status={request.status} />
          </div>
          <div className="space-y-2 text-xs mb-4">
            {[
              { label: 'Patient', value: request.patientId?.name },
              { label: 'Phone',   value: request.patientId?.phone || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-text-muted w-14">{label}</span>
                <span className="text-text-main" style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <MapPin size={12} color="#9CA3AF" />
              <span className="font-mono text-text-sub text-[10px]">
                {request.patientLat?.toFixed(5)}, {request.patientLng?.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} color="#9CA3AF" />
              <span className="text-text-main" style={{ fontWeight: 600 }}>{request.eta} min ETA</span>
            </div>
          </div>
          <div className="flex gap-2">
            {request.status === 'Assigned' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateStatus('accept')}
                className="flex-1 py-2.5 rounded-xl text-sm text-white"
                style={{ fontWeight: 600, background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)', border: 'none', cursor: 'pointer' }}>
                Accept & En Route
              </motion.button>
            )}
            {['En Route', 'Arrived'].includes(request.status) && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateStatus('complete')}
                className="flex-1 py-2.5 rounded-xl text-sm text-white"
                style={{ fontWeight: 600, background: 'linear-gradient(135deg,#2ED573,#1fbc61)', border: 'none', cursor: 'pointer' }}>
                Mark Complete
              </motion.button>
            )}
            <Link to="/ambulance/map"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm"
              style={{ fontWeight: 600, background: '#F1F3F5', color: '#6B7280', textDecoration: 'none' }}>
              <Navigation size={14} />
              Map
            </Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
