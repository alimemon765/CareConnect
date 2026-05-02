import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';

const roles = [
  { to: '/login/patient',   label: 'Patient',   emoji: '🏥', grad: 'linear-gradient(135deg,#FFB800,#FF8C42)' },
  { to: '/login/doctor',    label: 'Doctor',    emoji: '🩺', grad: 'linear-gradient(135deg,#4ECDC4,#44B8B0)' },
  { to: '/login/admin',     label: 'Admin',     emoji: '⚙️', grad: 'linear-gradient(135deg,#6C63FF,#9C88FF)' },
  { to: '/login/ambulance', label: 'Ambulance', emoji: '🚑', grad: 'linear-gradient(135deg,#FF6B9D,#FF4757)' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

export default function Landing() {
  return (
    <div className="min-h-dvh bg-card flex flex-col px-5 pt-12 pb-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg,#FFB800,#FF8C42)', boxShadow: '0 4px 16px rgba(255,184,0,0.35)' }}>
          <Stethoscope size={32} color="#fff" />
        </div>
        <h1 className="text-3xl text-text-main" style={{ fontWeight: 800 }}>CareConnect</h1>
      </div>

      {/* Hero text */}
      <div className="text-center mb-10">
        <h2 className="text-2xl text-text-main leading-tight mb-2" style={{ fontWeight: 800 }}>
          Healthcare at your<br />fingertips
        </h2>
        <p className="text-sm text-text-sub">Book doctors. Track emergencies. Stay healthy.</p>
      </div>

      {/* 2×2 role grid */}
      <p className="text-xs text-text-muted font-600 uppercase tracking-widest text-center mb-4" style={{ fontWeight: 600 }}>
        Sign in as
      </p>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {roles.map((r) => (
          <motion.div key={r.to} variants={item} whileTap={{ scale: 0.97 }}>
            <Link
              to={r.to}
              className="flex flex-col items-center justify-center rounded-2xl"
              style={{
                background: r.grad,
                height: 150,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            >
              <span style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>{r.emoji}</span>
              <span className="text-white text-sm" style={{ fontWeight: 600 }}>{r.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <p className="text-center text-sm text-text-sub">
        New here?{' '}
        <Link to="/register" className="text-yellow font-600" style={{ fontWeight: 600 }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
