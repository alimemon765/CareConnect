import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, CalendarX } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/appointments`)
      .then((r) => setAppointments(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const cancel = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/patient/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = appointments.filter((a) =>
    tab === 'upcoming' ? ['Pending', 'Confirmed'].includes(a.status) : ['Completed', 'Cancelled'].includes(a.status)
  );

  return (
    <Layout title="Appointments">
      {/* Toggle */}
      <div className="flex bg-input rounded-xl p-1 mb-5">
        {['upcoming', 'past'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 rounded-xl py-2 text-sm capitalize transition-all"
            style={{ fontWeight: 600, background: tab === t ? '#FFB800' : 'transparent', color: tab === t ? '#fff' : '#9CA3AF' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-text-muted">
              <CalendarX size={48} strokeWidth={1.5} />
              <p className="text-sm mt-3">No appointments yet</p>
            </div>
          )}
          {filtered.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }} className="bg-card rounded-2xl p-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Dr. {a.doctorId?.name}</p>
                <StatusBadge status={a.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-text-sub">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} color="#9CA3AF" />
                  {new Date(a.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} color="#9CA3AF" />
                  {a.timeSlot}
                </span>
              </div>
              {a.prescription && (
                <p className="text-xs text-text-sub bg-input rounded-xl px-3 py-2 mt-3 leading-relaxed">
                  Rx: {a.prescription}
                </p>
              )}
              {a.status === 'Pending' && (
                <button onClick={() => cancel(a._id)}
                  className="mt-3 text-xs rounded-xl px-4 py-2"
                  style={{ color: '#FF4757', border: '1.5px solid #FF4757', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel Appointment
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
