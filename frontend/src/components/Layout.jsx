import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  House, Stethoscope, CalendarDays, FileText, User,
  Users, Truck, Map, Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

const navItems = {
  patient: [
    { to: '/patient/dashboard',    label: 'Home',         Icon: House },
    { to: '/patient/doctors',      label: 'Doctors',      Icon: Stethoscope },
    { to: '/patient/appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/patient/records',      label: 'Records',      Icon: FileText },
    { to: '/patient/profile',      label: 'Profile',      Icon: User },
  ],
  doctor: [
    { to: '/doctor/dashboard',    label: 'Home',         Icon: House },
    { to: '/doctor/appointments', label: 'Appointments', Icon: CalendarDays },
    { to: '/doctor/profile',      label: 'Profile',      Icon: User },
  ],
  admin: [
    { to: '/admin/dashboard',    label: 'Home',         Icon: House },
    { to: '/admin/users',        label: 'Users',        Icon: Users },
    { to: '/admin/doctors',      label: 'Doctors',      Icon: Stethoscope },
    { to: '/admin/appointments', label: 'Appts',        Icon: CalendarDays },
    { to: '/admin/ambulances',   label: 'Fleet',        Icon: Truck },
  ],
  ambulance: [
    { to: '/ambulance/dashboard', label: 'Home', Icon: House },
    { to: '/ambulance/map',       label: 'Map',  Icon: Map },
  ],
};

export default function Layout({ children, title }) {
  const { user } = useAuth();
  if (!user) return null;
  const items = navItems[user.role] || [];

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-card border-b border-border h-14 flex items-center justify-between px-5"
        style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <span className="text-base font-800 text-text-main" style={{ fontWeight: 800 }}>
          {title || 'CareConnect'}
        </span>
        <NotificationBell />
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== 'undefined' ? window.location.pathname : ''}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ padding: '20px' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-card border-t border-border flex"
        style={{ height: 64, boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#FFB800' : '#9CA3AF'}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: isActive ? '#FFB800' : '#9CA3AF',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
