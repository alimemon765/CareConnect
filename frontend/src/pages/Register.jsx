import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Lock, User, Phone, ChevronDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const roleRedirect = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', ambulance: '/ambulance/dashboard' };

const inputStyle = {
  background: '#F1F3F5',
  borderRadius: 14,
  height: 52,
  border: 'none',
  width: '100%',
  paddingLeft: 48,
  paddingRight: 16,
  fontSize: 14,
  color: '#1A1A2E',
  fontFamily: 'Inter, sans-serif',
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!form.email) e.email = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      login(data.token, data.user);
      toast.success('Account created!');
      navigate(roleRedirect[data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name',        type: 'text',     Icon: User },
    { key: 'email',    label: 'Email',             type: 'email',    Icon: Mail },
    { key: 'password', label: 'Password',          type: 'password', Icon: Lock },
    { key: 'phone',    label: 'Phone (optional)',  type: 'tel',      Icon: Phone },
  ];

  return (
    <div className="min-h-dvh bg-bg px-5 pt-6 pb-10">
      <Link to="/" className="inline-flex items-center gap-1 text-text-sub text-sm mb-6">
        <ChevronLeft size={18} /> Back
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl text-text-main mb-1" style={{ fontWeight: 800 }}>Create account</h1>
        <p className="text-sm text-text-sub">Join CareConnect today</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-card rounded-2xl p-5"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, Icon }) => (
            <div key={key}>
              <label className="block text-xs text-text-muted mb-1.5" style={{ fontWeight: 600 }}>{label}</label>
              <div className="relative">
                <Icon size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={type}
                  style={inputStyle}
                  placeholder={label}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
              {errors[key] && <p className="text-danger text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-xs text-text-muted mb-1.5" style={{ fontWeight: 600 }}>I am a</label>
            <div className="relative">
              <ChevronDown size={16} color="#9CA3AF" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                style={{ ...inputStyle, paddingLeft: 16, appearance: 'none' }}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="ambulance">Ambulance Driver</option>
              </select>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#FFB800,#FF8C42)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : 'Register'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-text-sub mt-4">
          Already have an account?{' '}
          <Link to="/" className="text-yellow" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
