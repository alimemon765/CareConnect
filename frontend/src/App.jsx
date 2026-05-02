import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public
import Landing from './pages/Landing';
import Register from './pages/Register';

// Role-specific login pages
import PatientLogin from './pages/auth/PatientLogin';
import DoctorLogin from './pages/auth/DoctorLogin';
import AdminLogin from './pages/auth/AdminLogin';
import AmbulanceLogin from './pages/auth/AmbulanceLogin';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import DoctorDetail from './pages/patient/DoctorDetail';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientRecords from './pages/patient/Records';
import PatientProfile from './pages/patient/Profile';
import PatientSOS from './pages/patient/SOS';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorProfile from './pages/doctor/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import AdminAmbulances from './pages/admin/Ambulances';

// Ambulance
import AmbulanceDashboard from './pages/ambulance/Dashboard';
import AmbulanceMap from './pages/ambulance/Map';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#F8F9FA' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #F1F3F5', borderTopColor: '#FFB800', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login/patient"   element={<PatientLogin />} />
      <Route path="/login/doctor"    element={<DoctorLogin />} />
      <Route path="/login/admin"     element={<AdminLogin />} />
      <Route path="/login/ambulance" element={<AmbulanceLogin />} />
      <Route path="/login"           element={<PatientLogin />} />
      <Route path="/register"        element={<Register />} />

      {/* Patient */}
      <Route path="/patient/dashboard"     element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/doctors"       element={<ProtectedRoute allowedRoles={['patient']}><PatientDoctors /></ProtectedRoute>} />
      <Route path="/patient/doctors/:id"   element={<ProtectedRoute allowedRoles={['patient']}><DoctorDetail /></ProtectedRoute>} />
      <Route path="/patient/book/:doctorId" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
      <Route path="/patient/appointments"  element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/records"       element={<ProtectedRoute allowedRoles={['patient']}><PatientRecords /></ProtectedRoute>} />
      <Route path="/patient/profile"       element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />
      <Route path="/patient/sos"           element={<ProtectedRoute allowedRoles={['patient']}><PatientSOS /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor/dashboard"    element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
      <Route path="/doctor/profile"      element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard"    element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"        element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/doctors"      element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
      <Route path="/admin/ambulances"   element={<ProtectedRoute allowedRoles={['admin']}><AdminAmbulances /></ProtectedRoute>} />

      {/* Ambulance */}
      <Route path="/ambulance/dashboard" element={<ProtectedRoute allowedRoles={['ambulance']}><AmbulanceDashboard /></ProtectedRoute>} />
      <Route path="/ambulance/map"       element={<ProtectedRoute allowedRoles={['ambulance']}><AmbulanceMap /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1A1A2E',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
