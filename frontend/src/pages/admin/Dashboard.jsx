import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Stethoscope, CalendarDays, Ambulance, X } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard`).then((r) => setStats(r.data));

    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
    socketRef.current = socket;
    socket.emit('admin:join');
    socket.on('admin:emergency_alert', (payload) => {
      setAlerts((prev) => [{ ...payload, id: Date.now() }, ...prev].slice(0, 5));
    });
    return () => socket.disconnect();
  }, []);

  const dismiss = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const cards = stats ? [
    { label: 'Total Patients',        value: stats.totalPatients,     Icon: Users,       color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)' },
    { label: 'Total Doctors',         value: stats.totalDoctors,      Icon: Stethoscope, color: '#FFB800', bg: 'rgba(255,184,0,0.12)' },
    { label: "Today's Appointments",  value: stats.todayAppointments, Icon: CalendarDays,color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
    { label: 'Active Ambulances',     value: stats.activeAmbulances,  Icon: Ambulance,   color: '#FF4757', bg: 'rgba(255,71,87,0.12)' },
  ] : [];

  return (
    <Layout title="Admin Dashboard">
      {/* Emergency alert stack */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div key={alert.id}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }}
            className="mb-3 bg-card rounded-2xl p-4 flex items-start justify-between"
            style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderLeft: '4px solid #FF4757' }}>
            <div className="text-xs space-y-0.5">
              <p className="text-text-main" style={{ fontWeight: 700 }}>
                🚨 {alert.patientName} — SOS at {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-text-muted">
                Vehicle <span className="text-text-sub" style={{ fontWeight: 600 }}>{alert.vehicleNumber}</span> · Driver: {alert.driverName}
              </p>
              <p className="text-text-muted" style={{ opacity: 0.7 }}>
                {Number(alert.patientLat).toFixed(5)}, {Number(alert.patientLng).toFixed(5)}
              </p>
            </div>
            <button onClick={() => dismiss(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', marginLeft: 12, flexShrink: 0 }}>
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {!stats ? <Spinner /> : (
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ label, value, Icon, color, bg }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={20} color={color} />
              </div>
              <p className="text-2xl text-text-main" style={{ fontWeight: 800 }}>{value}</p>
              <p className="text-xs text-text-muted mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
