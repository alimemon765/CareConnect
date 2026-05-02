import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Save, CalendarX } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/doctor/appointments`)
      .then((r) => setAppointments(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id, payload) => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/doctor/appointments/${id}`, payload);
      toast.success('Updated');
      load();
      setExpanded(null);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Appointments">
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {appointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-text-muted">
              <CalendarX size={48} strokeWidth={1.5} />
              <p className="text-sm mt-3">No appointments yet</p>
            </div>
          )}
          {appointments.map((a) => (
            <div key={a._id} className="bg-card rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => {
                  setExpanded(expanded === a._id ? null : a._id);
                  setPrescription(a.prescription || '');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(78,205,196,0.12)' }}>
                    <span className="text-sm" style={{ color: '#4ECDC4', fontWeight: 700 }}>{a.patientId?.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{a.patientId?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(a.date).toLocaleDateString()} · {a.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {expanded === a._id
                    ? <ChevronUp size={16} color="#9CA3AF" />
                    : <ChevronDown size={16} color="#9CA3AF" />}
                </div>
              </button>

              <AnimatePresence>
                {expanded === a._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid #F1F3F5', paddingTop: 16 }}>
                      <div className="space-y-1">
                        <p className="text-xs text-text-sub"><span className="text-text-muted">Email:</span> {a.patientId?.email}</p>
                        {a.notes && <p className="text-xs text-text-sub"><span className="text-text-muted">Notes:</span> {a.notes}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Prescription
                        </p>
                        <textarea
                          rows={3}
                          style={{
                            background: '#F1F3F5', borderRadius: 14, border: 'none', width: '100%',
                            padding: '12px 16px', fontSize: 14, color: '#1A1A2E', resize: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          placeholder="Enter prescription…"
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => update(a._id, { prescription, status: 'Completed' })}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white"
                          style={{ fontWeight: 600, background: 'linear-gradient(135deg,#2ED573,#1fbc61)', opacity: saving ? 0.6 : 1, border: 'none', cursor: 'pointer' }}
                        >
                          <CheckCircle size={15} />
                          Complete
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => update(a._id, { prescription })}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                          style={{ fontWeight: 600, background: '#F1F3F5', color: '#6B7280', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                        >
                          <Save size={15} />
                          Save Rx
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
