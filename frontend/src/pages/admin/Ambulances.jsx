import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Truck } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

export default function AdminAmbulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/admin/ambulances`)
      .then((r) => setAmbulances(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Ambulance Fleet">
      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {ambulances.map((a, i) => (
            <motion.div key={a._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-2xl p-4"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,71,87,0.10)' }}>
                    <Truck size={18} color="#FF4757" />
                  </div>
                  <div>
                    <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>{a.userId?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{a.vehicleNumber || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    fontWeight: 600,
                    ...(a.isAvailable
                      ? { background: 'rgba(46,213,115,0.12)', color: '#2ED573' }
                      : { background: '#F1F3F5', color: '#9CA3AF' })
                  }}>
                    {a.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  {a.isOnDuty && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,71,87,0.10)', color: '#FF4757', fontWeight: 600 }}>
                      On Duty
                    </span>
                  )}
                </div>
              </div>
              {(a.currentLat && a.currentLng) && (
                <div className="flex items-center gap-1.5 text-xs text-text-muted rounded-xl px-3 py-2"
                  style={{ background: '#F1F3F5' }}>
                  <MapPin size={12} color="#9CA3AF" />
                  <span className="font-mono">{a.currentLat.toFixed(5)}, {a.currentLng.toFixed(5)}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
