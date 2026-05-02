import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const inputStyle = {
  background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none',
  width: '100%', padding: '0 16px', fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/doctors/${doctorId}`)
      .then((r) => setDoctor(r.data)).finally(() => setLoadingDoctor(false));
  }, [doctorId]);

  useEffect(() => {
    if (!date) return;
    axios.get(`${import.meta.env.VITE_API_URL}/patient/doctors/${doctorId}/slots?date=${date}`)
      .then((r) => { setSlots(r.data); setSelected(''); }).catch(() => setSlots([]));
  }, [doctorId, date]);

  const book = async () => {
    if (!selected) return toast.error('Pick a time slot');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/patient/appointments`, { doctorId, date, timeSlot: selected, notes });
      toast.success('Appointment booked!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  if (loadingDoctor) return <Layout><Spinner /></Layout>;

  return (
    <Layout title="Book Appointment">
      <Link to={`/patient/doctors/${doctorId}`} className="inline-flex items-center gap-1 text-text-sub text-sm mb-4">
        <ChevronLeft size={18} /> Back
      </Link>
      <h1 className="text-xl text-text-main mb-1" style={{ fontWeight: 800 }}>Book Appointment</h1>
      {doctor && <p className="text-sm text-text-sub mb-6">with <span style={{ color: '#4ECDC4', fontWeight: 600 }}>Dr. {doctor.userId?.name}</span></p>}

      <div className="space-y-5">
        <div>
          <p className="text-xs text-text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
          <input type="date" style={inputStyle} value={date} min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <p className="text-xs text-text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Slot</p>
          {slots.length === 0 ? (
            <p className="text-sm text-text-muted">No slots available for this date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <motion.button key={slot} whileTap={{ scale: 0.95 }} onClick={() => setSelected(slot)}
                  className="flex items-center justify-center gap-1.5 rounded-xl text-xs"
                  style={{
                    height: 44, fontWeight: 600,
                    background: selected === slot ? 'rgba(78,205,196,0.15)' : '#F1F3F5',
                    color: selected === slot ? '#4ECDC4' : '#6B7280',
                    border: selected === slot ? '1.5px solid #4ECDC4' : '1.5px solid transparent',
                  }}>
                  <Clock size={12} />
                  {slot}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-text-muted mb-2" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes (optional)</p>
          <textarea rows={3} style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none', borderRadius: 14 }}
            placeholder="Any symptoms or reason for visit…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={book} disabled={loading || !selected}
          style={{ width: '100%', height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#FFB800,#FF8C42)',
            color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
            opacity: loading || !selected ? 0.5 : 1, boxShadow: '0 4px 16px rgba(255,184,0,0.30)' }}>
          {loading ? 'Booking…' : 'Confirm Appointment'}
        </motion.button>
      </div>
    </Layout>
  );
}
