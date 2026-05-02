import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const inputStyle = {
  background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none',
  width: '100%', padding: '0 16px', fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
};

export default function DoctorProfile() {
  const [form, setForm] = useState({
    specialization: '', experience: '', consultationFee: '', bio: '', availableSlots: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', startTime: '09:00', endTime: '12:00' });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/doctor/profile`).then((r) => {
      if (r.data) setForm({ ...r.data, experience: r.data.experience || '', consultationFee: r.data.consultationFee || '' });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/doctor/profile`, form);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const addSlot = () => setForm({ ...form, availableSlots: [...form.availableSlots, { ...newSlot }] });
  const removeSlot = (i) => setForm({ ...form, availableSlots: form.availableSlots.filter((_, idx) => idx !== i) });

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout title="Doctor Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Cardiologist' },
          { key: 'experience', label: 'Experience (years)', type: 'number', placeholder: '5' },
          { key: 'consultationFee', label: 'Consultation Fee (₹)', type: 'number', placeholder: '500' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <input
              type={type}
              placeholder={placeholder}
              style={inputStyle}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        <div>
          <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</p>
          <textarea
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '12px 16px', resize: 'none', borderRadius: 14 }}
            placeholder="Brief description of your practice…"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* Slots card */}
        <div className="bg-card rounded-2xl p-4" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-xs text-text-muted mb-3" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available Slots
          </p>

          <div className="space-y-2 mb-4">
            {(form.availableSlots || []).map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: '#F1F3F5' }}>
                <span className="text-xs text-text-sub" style={{ fontWeight: 600 }}>
                  {s.day} · {s.startTime}–{s.endTime}
                </span>
                <button type="button" onClick={() => removeSlot(i)} style={{ color: '#FF4757', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
            {form.availableSlots?.length === 0 && (
              <p className="text-xs text-text-muted text-center py-2">No slots added yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="time" style={inputStyle} value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })} />
              <input type="time" style={inputStyle} value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })} />
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={addSlot}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
              style={{
                fontWeight: 600, background: 'rgba(78,205,196,0.1)', color: '#4ECDC4',
                border: '1.5px solid rgba(78,205,196,0.4)', cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              Add Slot
            </motion.button>
          </div>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          style={{
            width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)',
            color: '#fff', fontWeight: 600, fontSize: 15, opacity: saving ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(78,205,196,0.30)',
          }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </motion.button>
      </form>
    </Layout>
  );
}
