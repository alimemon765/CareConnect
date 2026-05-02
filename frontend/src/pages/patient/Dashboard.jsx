import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, CalendarDays, Siren, Clock } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

const tiles = [
  { to: '/patient/doctors',      label: 'Our Specialties', Icon: Stethoscope, bg: '#4ECDC4', light: 'rgba(78,205,196,0.15)' },
  { to: '/patient/doctors',      label: 'Your Doctors',    Icon: Stethoscope, bg: '#F1F3F5', iconColor: '#6B7280', textColor: '#1A1A2E' },
  { to: '/patient/sos',          label: 'Emergency SOS',   Icon: Siren,        bg: 'linear-gradient(135deg,#FF8C42,#FF4757)', pulse: true },
  { to: '/patient/appointments', label: 'Your Schedule',   Icon: CalendarDays, bg: '#FFB800' },
];

function today() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [nextAppt, setNextAppt] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/patient/appointments`),
      axios.get(`${import.meta.env.VITE_API_URL}/patient/records`),
    ]).then(([appts, recs]) => {
      const upcoming = appts.data.filter((a) => ['Pending', 'Confirmed'].includes(a.status));
      setStats({ upcoming: upcoming.length, records: recs.data.length });
      if (upcoming.length) setNextAppt(upcoming[0]);
    });
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Layout title="CareConnect">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl text-text-main" style={{ fontWeight: 800 }}>
          Good Morning, {firstName}! 👋
        </h1>
        <p className="text-sm text-text-sub mt-0.5">{today()}</p>
      </div>

      {/* Hero card */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'linear-gradient(135deg,#FFB800,#FF8C42)', boxShadow: '0 4px 24px rgba(255,184,0,0.30)' }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {nextAppt ? (
              <>
                <p className="text-white text-xs mb-1" style={{ opacity: 0.85 }}>Upcoming appointment</p>
                <p className="text-white font-700 text-base" style={{ fontWeight: 700 }}>
                  with Dr. {nextAppt.doctorId?.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={13} color="rgba(255,255,255,0.8)" />
                  <p className="text-white text-sm" style={{ opacity: 0.85 }}>
                    {nextAppt.timeSlot} · {new Date(nextAppt.date).toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-white text-xs mb-1" style={{ opacity: 0.85 }}>Today</p>
                <p className="text-white font-700 text-base" style={{ fontWeight: 700 }}>No appointments today</p>
                <p className="text-white text-sm mt-1" style={{ opacity: 0.85 }}>You're all clear!</p>
              </>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <CalendarDays size={22} color="#fff" />
          </div>
        </div>
      </div>

      {/* Your Schedule mini card */}
      {stats && (
        <div className="rounded-2xl p-4 mb-5 bg-card flex items-center gap-3" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(78,205,196,0.12)' }}>
            <CalendarDays size={20} color="#4ECDC4" />
          </div>
          <div>
            <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Your Schedule</p>
            <p className="text-xs text-text-sub mt-0.5">
              {stats.upcoming} upcoming appointment{stats.upcoming !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* 2×2 action grid */}
      {!stats ? <Spinner /> : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
          {tiles.map(({ to, label, Icon, bg, iconColor, textColor, pulse }) => (
            <motion.div key={label + to} variants={item} whileTap={{ scale: 0.97 }}>
              <Link
                to={to}
                className={`flex flex-col items-start justify-end rounded-2xl p-4 ${pulse ? 'sos-pulse' : ''}`}
                style={{
                  height: 130,
                  background: bg,
                  boxShadow: pulse ? '0 4px 20px rgba(255,71,87,0.30)' : '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div className="mb-2">
                  <Icon size={28} color={iconColor || '#fff'} strokeWidth={1.8} />
                </div>
                <p className="text-sm" style={{ fontWeight: 600, color: textColor || '#fff' }}>{label}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Layout>
  );
}
