import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Clock, BadgeIndianRupee } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

export default function DoctorDetail() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/doctors/${id}`)
      .then((r) => setDoctor(r.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !date) return;
    axios.get(`${import.meta.env.VITE_API_URL}/patient/doctors/${id}/slots?date=${date}`)
      .then((r) => setSlots(r.data)).catch(() => setSlots([]));
  }, [id, date]);

  if (loading) return <Layout><Spinner /></Layout>;
  if (!doctor) return <Layout><p className="text-text-muted">Doctor not found.</p></Layout>;

  return (
    <Layout title={doctor.userId?.name || 'Doctor'}>
      <Link to="/patient/doctors" className="inline-flex items-center gap-1 text-text-sub text-sm mb-4">
        <ChevronLeft size={18} /> Back
      </Link>

      {/* Hero card — teal gradient */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)', boxShadow: '0 4px 20px rgba(78,205,196,0.3)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <span className="text-2xl font-700 text-white" style={{ fontWeight: 700 }}>{doctor.userId?.name?.[0]}</span>
          </div>
          <div>
            <h1 className="text-lg text-white" style={{ fontWeight: 700 }}>{doctor.userId?.name}</h1>
            <p className="text-sm text-white" style={{ opacity: 0.85 }}>{doctor.specialization}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: Star, val: doctor.rating?.toFixed(1), label: 'Rating', fill: true },
            { Icon: Clock, val: `${doctor.experience}y`, label: 'Exp' },
            { Icon: BadgeIndianRupee, val: doctor.consultationFee, label: 'Fee' },
          ].map(({ Icon, val, label, fill }) => (
            <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Icon size={14} color="#fff" fill={fill ? '#fff' : 'none'} style={{ margin: '0 auto 4px' }} />
              <p className="text-white text-sm font-700" style={{ fontWeight: 700 }}>{val}</p>
              <p className="text-white text-[10px]" style={{ opacity: 0.75 }}>{label}</p>
            </div>
          ))}
        </div>
        {doctor.bio && (
          <p className="text-white text-xs mt-4 leading-relaxed" style={{ opacity: 0.85 }}>{doctor.bio}</p>
        )}
      </div>

      {/* Date picker */}
      <p className="text-xs text-text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Select Date
      </p>
      <input type="date"
        style={{ background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none', width: '100%', padding: '0 16px', fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif', marginBottom: 20 }}
        value={date} min={new Date().toISOString().split('T')[0]}
        onChange={(e) => setDate(e.target.value)} />

      {/* Slots */}
      <p className="text-xs text-text-muted mb-3" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Available Slots
      </p>
      {slots.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-6">No slots available for this date.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {slots.map((slot) => (
            <div key={slot} className="rounded-xl py-2.5 text-center text-xs text-teal"
              style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)', fontWeight: 600 }}>
              {slot}
            </div>
          ))}
        </div>
      )}

      {/* Fixed book button */}
      {slots.length > 0 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-3 pt-2" style={{ background: 'linear-gradient(to top, #F8F9FA 80%, transparent)' }}>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link to={`/patient/book/${id}?date=${date}`}
              className="flex items-center justify-center rounded-xl text-white font-600 text-sm"
              style={{ background: 'linear-gradient(135deg,#FFB800,#FF8C42)', height: 52, fontWeight: 600, boxShadow: '0 4px 16px rgba(255,184,0,0.35)' }}>
              Book Appointment
            </Link>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
