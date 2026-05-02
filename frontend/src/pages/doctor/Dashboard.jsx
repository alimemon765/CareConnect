import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/doctor/appointments`)
      .then((r) => setAppointments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter((a) => new Date(a.date).toDateString() === today);
  const upcoming = appointments.filter((a) => ['Pending', 'Confirmed'].includes(a.status));
  const firstName = user?.name?.split(' ')[0] || 'Doctor';

  return (
    <Layout title="Dashboard">
      {/* Greeting hero */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)', boxShadow: '0 4px 20px rgba(78,205,196,0.3)' }}>
        <p className="text-white text-sm mb-1" style={{ opacity: 0.85 }}>Good day,</p>
        <h1 className="text-xl text-white" style={{ fontWeight: 800 }}>Dr. {firstName}</h1>
        <p className="text-white text-xs mt-2" style={{ opacity: 0.75 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Today's", value: todayAppts.length, sub: 'appointments', Icon: CalendarDays, color: '#4ECDC4', bg: 'rgba(78,205,196,0.12)' },
          { label: 'Upcoming', value: upcoming.length, sub: 'appointments', Icon: TrendingUp, color: '#FFB800', bg: 'rgba(255,184,0,0.12)' },
        ].map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <p className="text-2xl text-text-main" style={{ fontWeight: 800, color }}>{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label} {sub}</p>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <p className="text-xs text-text-muted mb-3" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Today's Schedule
      </p>
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {todayAppts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-card rounded-2xl"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <CheckCircle size={40} color="#2ED573" strokeWidth={1.5} />
              <p className="text-sm text-text-sub mt-3">No appointments today</p>
            </div>
          )}
          {todayAppts.map((a, i) => (
            <motion.div key={a._id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(78,205,196,0.12)' }}>
                  <span className="text-sm" style={{ color: '#4ECDC4', fontWeight: 700 }}>{a.patientId?.name?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{a.patientId?.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} color="#9CA3AF" />
                    <p className="text-xs text-text-muted">{a.timeSlot}</p>
                  </div>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
