import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarX } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/admin/appointments`)
      .then((r) => setAppointments(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="All Appointments">
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-text-muted">
              <CalendarX size={48} strokeWidth={1.5} />
              <p className="text-sm mt-3">No appointments yet</p>
            </div>
          )}
          {appointments.map((a, i) => (
            <motion.div key={a._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{a.patientId?.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">→ Dr. {a.doctorId?.name}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-xs text-text-muted">
                {new Date(a.date).toLocaleDateString()} · {a.timeSlot}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
