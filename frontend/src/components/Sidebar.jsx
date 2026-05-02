import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard' },
    { to: '/patient/doctors', label: 'Find Doctors' },
    { to: '/patient/appointments', label: 'Appointments' },
    { to: '/patient/records', label: 'Medical Records' },
    { to: '/patient/profile', label: 'Profile' },
    { to: '/patient/sos', label: '🚨 Emergency SOS' }
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/profile', label: 'Profile' }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/appointments', label: 'Appointments' },
    { to: '/admin/ambulances', label: 'Ambulances' }
  ],
  ambulance: [
    { to: '/ambulance/dashboard', label: 'Dashboard' },
    { to: '/ambulance/map', label: 'Live Map' }
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = navItems[user.role] || [];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">CareConnect</h1>
        <p className="text-xs text-gray-400 mt-1 capitalize">{user.role} Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-300 mb-2">{user.name}</div>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
