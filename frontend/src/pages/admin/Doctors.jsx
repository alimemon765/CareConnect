import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/admin/doctors`)
      .then((r) => setDoctors(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (userId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/doctors/${userId}/approve`);
      toast.success('Status updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <Layout title="Doctors">
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {doctors.map((d, i) => (
            <motion.div key={d._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(78,205,196,0.12)' }}>
                    <span className="text-sm" style={{ color: '#4ECDC4', fontWeight: 700 }}>{d.userId?.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{d.userId?.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#4ECDC4', fontWeight: 600 }}>{d.specialization || '—'}</p>
                    <p className="text-xs text-text-muted">{d.userId?.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full" style={
                  d.isApproved
                    ? { background: 'rgba(46,213,115,0.12)', color: '#2ED573', fontWeight: 600 }
                    : { background: 'rgba(255,184,0,0.12)', color: '#FFB800', fontWeight: 600 }
                }>
                  {d.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs text-text-muted">
                  <span>₹{d.consultationFee || '—'}</span>
                  <span>{d.experience ? `${d.experience}y exp` : '—'}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggle(d.userId?._id)}
                  className="text-xs px-3 py-1.5 rounded-xl"
                  style={{
                    fontWeight: 600, border: 'none', cursor: 'pointer',
                    ...(d.isApproved
                      ? { background: 'rgba(255,71,87,0.1)', color: '#FF4757' }
                      : { background: 'rgba(46,213,115,0.1)', color: '#2ED573' })
                  }}
                >
                  {d.isApproved ? 'Deactivate' : 'Approve'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
