import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const GRAD = 'linear-gradient(135deg,#FFB800,#FF8C42)';

const inputStyle = {
  background: '#F1F3F5', borderRadius: 14, height: 52,
  border: 'none', width: '100%', paddingLeft: 48,
  fontSize: 14, color: '#1A1A2E', fontFamily: 'Inter, sans-serif',
};

export default function PatientLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email) errs.email = 'Required';
    if (!form.password) errs.password = 'Required';
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form);
      if (data.user.role !== 'patient') {
        toast.error('Not a patient account. Use the correct login.');
        setForm({ email: '', password: '' });
        return;
      }
      login(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg px-5 pt-6 pb-10">
      <Link to="/" className="inline-flex items-center gap-1 text-text-sub text-sm mb-6">
        <ChevronLeft size={18} /> Back
      </Link>

      {/* Role circle */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: GRAD, boxShadow: '0 6px 20px rgba(255,184,0,0.35)' }}>
          <span style={{ fontSize: 40 }}>🏥</span>
        </div>
        <h1 className="text-2xl text-text-main" style={{ fontWeight: 800 }}>Welcome back!</h1>
        <p className="text-sm text-text-sub mt-1">Patient Portal</p>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="bg-card rounded-2xl p-5"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" style={inputStyle} placeholder="Email address"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPass ? 'text' : 'password'}
                style={{ ...inputStyle, paddingRight: 48 }} placeholder="Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
              </button>
            </div>
            {errors.password && <p className="text-danger text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="text-right">
            <span className="text-xs text-text-muted">Forgot password?</span>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', height: 52, borderRadius: 14, background: GRAD,
              color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-text-sub mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-yellow" style={{ fontWeight: 600 }}>Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
