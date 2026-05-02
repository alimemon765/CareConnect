import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Heart, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';

const inputStyle = {
  background: '#F1F3F5', borderRadius: 14, height: 48, border: 'none',
  width: '100%', padding: '0 16px', fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
};

export default function PatientProfile() {
  const [form, setForm] = useState({
    age: '', gender: '', bloodGroup: '', allergies: '', chronicConditions: '',
    emergencyContact: { name: '', phone: '', email: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/patient/profile`).then((r) => {
      if (r.data) {
        setForm({
          age: r.data.age || '',
          gender: r.data.gender || '',
          bloodGroup: r.data.bloodGroup || '',
          allergies: (r.data.allergies || []).join(', '),
          chronicConditions: (r.data.chronicConditions || []).join(', '),
          emergencyContact: r.data.emergencyContact || { name: '', phone: '', email: '' },
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/patient/profile`, {
        ...form,
        allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEC = (k, v) => setForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, [k]: v } }));

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout title="My Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="bg-card rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.12)' }}>
              <User size={16} color="#FFB800" />
            </div>
            <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Basic Information</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</p>
              <input type="number" style={inputStyle} value={form.age} onChange={(e) => set('age', e.target.value)} placeholder="25" />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</p>
              <input style={inputStyle} value={form.gender} onChange={(e) => set('gender', e.target.value)} placeholder="Male" />
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blood Group</p>
            <input style={inputStyle} value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)} placeholder="O+" />
          </div>
        </div>

        {/* Medical info */}
        <div className="bg-card rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(78,205,196,0.12)' }}>
              <Heart size={16} color="#4ECDC4" />
            </div>
            <p className="text-sm text-text-main" style={{ fontWeight: 700 }}>Medical Info</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Allergies (comma-separated)
              </p>
              <input style={inputStyle} value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penicillin, Pollen" />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chronic Conditions
              </p>
              <input style={inputStyle} value={form.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} placeholder="Diabetes, Hypertension" />
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="bg-card rounded-2xl p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1.5px solid rgba(255,71,87,0.2)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,71,87,0.1)' }}>
              <AlertCircle size={16} color="#FF4757" />
            </div>
            <p className="text-sm" style={{ fontWeight: 700, color: '#FF4757' }}>Emergency Contact</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</p>
              <input style={inputStyle} value={form.emergencyContact.name} onChange={(e) => setEC('name', e.target.value)} placeholder="Contact name" />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</p>
              <input style={inputStyle} value={form.emergencyContact.phone} onChange={(e) => setEC('phone', e.target.value)} placeholder="+91 9999999999" />
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1.5" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
              <input type="email" style={inputStyle} value={form.emergencyContact.email} onChange={(e) => setEC('email', e.target.value)} placeholder="contact@email.com" />
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          style={{
            width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#FFB800,#FF8C42)',
            color: '#fff', fontWeight: 600, fontSize: 15, opacity: saving ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(255,184,0,0.30)',
          }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </motion.button>
      </form>
    </Layout>
  );
}
