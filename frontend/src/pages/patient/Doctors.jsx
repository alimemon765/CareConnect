import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, ChevronRight } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const SPECS = ['All', 'Cardiologist', 'Dermatologist', 'General Physician', 'Neurologist'];

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/doctors`)
      .then((r) => setDoctors(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) => {
    const name = d.userId?.name?.toLowerCase() || '';
    const s = d.specialization?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = name.includes(q) || s.includes(q);
    const matchSpec = spec === 'All' || d.specialization === spec;
    return matchSearch && matchSpec;
  });

  return (
    <Layout title="Find Doctors">
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          placeholder="Search by name or specialization…"
          style={{
            background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none',
            width: '100%', paddingLeft: 44, fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
        {SPECS.map((s) => (
          <button
            key={s}
            onClick={() => setSpec(s)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              border: spec === s ? 'none' : '1px solid #E5E7EB',
              background: spec === s ? '#FFB800' : '#fff',
              color: spec === s ? '#fff' : '#6B7280',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-text-muted text-sm py-10">No doctors found.</p>
          )}
          {filtered.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}>
              <Link to={`/patient/doctors/${d.userId?._id}`}
                className="flex items-center gap-3 bg-card rounded-2xl p-4"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(78,205,196,0.15)' }}>
                  <span className="text-lg font-700" style={{ color: '#4ECDC4', fontWeight: 700 }}>
                    {d.userId?.name?.[0]}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-main truncate" style={{ fontWeight: 700 }}>{d.userId?.name}</p>
                  <p className="text-xs text-text-sub mt-0.5">{d.specialization}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-700 text-yellow" style={{ fontWeight: 700 }}>₹{d.consultationFee}</span>
                    <span className="flex items-center gap-0.5 text-xs text-text-muted">
                      <Star size={11} color="#FFB800" fill="#FFB800" />
                      {d.rating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-text-muted">{d.experience}y</span>
                  </div>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
