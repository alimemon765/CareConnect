# CareConnect — Full Progress Report

## Everything Done So Far

---

### 1. Built the Entire Backend (Node.js + Express + MongoDB)

**How:** Wrote all files from scratch manually since Node.js wasn't installed yet.

| File | What it does |
|------|-------------|
| `server.js` | Entry point. Sets up Express, Socket.io, connects to MongoDB, registers all route files |
| `models/User.js` | Mongoose schema for all users (patient, doctor, admin, ambulance) |
| `models/DoctorProfile.js` | Doctor's specialization, fee, availability slots, rating |
| `models/PatientProfile.js` | Age, blood group, allergies, emergency contact (name, phone, email) |
| `models/Appointment.js` | Links patient + doctor, stores date/time/status/prescription |
| `models/MedicalRecord.js` | Stores uploaded files as base64 strings |
| `models/AmbulanceDriver.js` | Vehicle number, GPS coordinates, availability status |
| `models/EmergencyRequest.js` | Links patient SOS to assigned ambulance, tracks status + ETA |
| `models/Notification.js` | In-app notifications — type, title, message, isRead, per user |
| `middleware/authMiddleware.js` | Reads JWT from Authorization header, blocks unauthenticated requests |
| `middleware/roleMiddleware.js` | Checks `req.user.role` against allowed roles, returns 403 if blocked |
| `controllers/authController.js` | Register, login, get current user |
| `controllers/patientController.js` | Profile, doctor search, slot fetching, booking, records |
| `controllers/doctorController.js` | Profile update, appointment management, prescriptions |
| `controllers/adminController.js` | User list/delete, doctor approve/deactivate, dashboard stats |
| `controllers/emergencyController.js` | SOS dispatch (Haversine), accept/complete, email + in-app notification after dispatch |
| `controllers/ambulanceController.js` | GPS location update, get active emergency |
| `routes/auth.js` | POST /register, POST /login, GET /me |
| `routes/patient.js` | All patient-only routes, protected by role middleware |
| `routes/doctor.js` | All doctor-only routes |
| `routes/admin.js` | All admin-only routes |
| `routes/emergency.js` | SOS, status, accept, complete |
| `routes/ambulance.js` | Location update, active request |
| `routes/notifications.js` | GET / (last 20), PUT /:id/read, PUT /read-all |
| `utils/haversine.js` | Calculates km distance between two GPS coordinates |
| `utils/slotMatcher.js` | Generates free 30-min slots by comparing doctor availability vs booked appointments |
| `utils/mailer.js` | Nodemailer transporter — sends styled HTML emergency alert email via Gmail |
| `seed.js` | Wipes and repopulates DB with 1 admin, 3 doctors, 3 patients, 2 ambulances, 5 appointments |

---

### 2. Built the Entire Frontend (React + Vite + Tailwind CSS)

**How:** Wrote all 35+ React files from scratch.

| File | What it does |
|------|-------------|
| `context/AuthContext.jsx` | Stores user/token/socket globally. Creates Socket.io connection on login, emits `user:join`, exposes socket via context so all components share one connection |
| `App.jsx` | All routes including 4 role-specific login routes. ProtectedRoute redirects to `/` on logout |
| `components/Layout.jsx` | Sidebar + header with NotificationBell for all roles |
| `components/Sidebar.jsx` | Role-specific nav links |
| `components/StatusBadge.jsx` | Color-coded pill — yellow=Pending, blue=Confirmed, green=Completed, red=Cancelled |
| `components/Spinner.jsx` | Loading spinner |
| `components/NotificationBell.jsx` | 🔔 bell with unread badge. Polls every 30s, listens for real-time `notification:new` socket events. Dropdown with mark-as-read, red border for emergency type |
| `pages/Landing.jsx` | Public home page with 2×2 grid of 4 role-colored login buttons |
| `pages/Login.jsx` | Legacy fallback (redirects to PatientLogin) |
| `pages/Register.jsx` | Name/email/password + role selector |
| `pages/auth/PatientLogin.jsx` | Blue themed — blocks non-patient accounts with toast error |
| `pages/auth/DoctorLogin.jsx` | Green themed — blocks non-doctor accounts |
| `pages/auth/AdminLogin.jsx` | Purple themed — blocks non-admin accounts |
| `pages/auth/AmbulanceLogin.jsx` | Red themed — blocks non-ambulance accounts |
| `pages/patient/Dashboard.jsx` | Stats + 4 quick action buttons |
| `pages/patient/Doctors.jsx` | Search + filter by name/spec/fee |
| `pages/patient/DoctorDetail.jsx` | Profile + slot preview by date |
| `pages/patient/BookAppointment.jsx` | Pick date → pick slot → confirm |
| `pages/patient/Appointments.jsx` | Table with status badges, Cancel for Pending |
| `pages/patient/Records.jsx` | Upload (base64) + download records |
| `pages/patient/Profile.jsx` | Edit profile including Emergency Contact (name, phone, email) |
| `pages/patient/SOS.jsx` | SOS button → GPS → dispatch → live Leaflet map → status bar (red/green) → ETA + vehicle info → 10s fallback polling |
| `pages/doctor/Dashboard.jsx` | Today's count + schedule |
| `pages/doctor/Appointments.jsx` | Expandable cards — prescriptions + mark complete |
| `pages/doctor/Profile.jsx` | Edit slots, fee, bio |
| `pages/admin/Dashboard.jsx` | 4 stat cards + real-time emergency alert stack (up to 5, dismissable) |
| `pages/admin/Users.jsx` | All users, delete button |
| `pages/admin/Doctors.jsx` | Approve/deactivate toggle |
| `pages/admin/Appointments.jsx` | All appointments system-wide |
| `pages/admin/Ambulances.jsx` | Driver status + GPS coordinates |
| `pages/ambulance/Dashboard.jsx` | GPS broadcasts every 5s from login. Shows live coordinates + geolocation denied warning. Accept/complete emergency |
| `pages/ambulance/Map.jsx` | Leaflet map — driver (blue) + patient (red) markers |

---

### 3. Installed Node.js

**How:** Homebrew required sudo so used **nvm** instead — no admin access needed.

- Installed nvm v0.39.7
- Installed Node.js v24.15.0 + npm v11.12.1
- Added nvm to `~/.zshrc` so `node` and `npm` work in every terminal

---

### 4. Installed All Dependencies

- Backend: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, socket.io, **nodemailer**
- Frontend: react, vite, tailwindcss, axios, react-router-dom, socket.io-client, **leaflet**, **react-leaflet**, react-hot-toast

---

### 5. Replaced Google Maps with Leaflet (Free, No API Key)

**Why:** Google Maps requires a credit card. Leaflet + OpenStreetMap is 100% free.

- Both map pages (`patient/SOS.jsx`, `ambulance/Map.jsx`) use `react-leaflet` with OpenStreetMap tiles
- Removed `@react-google-maps/api` and `VITE_GOOGLE_MAPS_KEY` entirely

---

### 6. Seeded the Database

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@careconnect.com | admin123 |
| Doctor (Cardiologist) | priya@careconnect.com | doctor123 |
| Doctor (Dermatologist) | rahul@careconnect.com | doctor123 |
| Doctor (General Physician) | anjali@careconnect.com | doctor123 |
| Patient | amit@patient.com | patient123 |
| Patient | sneha@patient.com | patient123 |
| Patient | ravi@patient.com | patient123 |
| Ambulance Driver | suresh@ambulance.com | ambulance123 |
| Ambulance Driver | mukesh@ambulance.com | ambulance123 |

---

### 7. Fixed Port Conflict

macOS ControlCenter permanently holds port 5000. Changed backend to **port 5001** and updated `frontend/.env` to match.

---

### 8. SOS Flow Upgrades

- **Ambulance Dashboard** — GPS interval starts on login (not just when on duty). Shows live coordinates on screen. Red banner if geolocation is denied.
- **Patient SOS Page** — Shows driver vehicle, ETA, live ambulance marker on map, red/green status bar, 10s fallback polling.
- **Admin Dashboard** — Joins `admin-room` socket. Receives `admin:emergency_alert` events. Shows stacked dismissable alert cards with red left border.

---

### 9. Separate Role Login Pages

- Landing page replaced single Login button with a **2×2 grid** of 4 role-colored buttons
- `/login/patient` (blue 🏥), `/login/doctor` (green 🩺), `/login/admin` (purple ⚙️), `/login/ambulance` (red 🚑)
- Wrong role → error toast, form cleared, no redirect
- `/login` kept as fallback pointing to PatientLogin

---

### 10. Email to Emergency Contact (Nodemailer)

- `utils/mailer.js` — Gmail transporter, sends styled HTML email with patient name, driver, vehicle, Google Maps link
- Triggered on SOS dispatch as **fire-and-forget** — never delays or crashes the SOS response
- Gmail credentials stored in `backend/.env`: `ali.memon1507@gmail.com` configured ✅
- Emergency contact email field added to Patient Profile form and PatientProfile model

---

### 11. In-App Notification System

- `Notification` model — per-user, typed (emergency/appointment/general), isRead flag
- `GET/PUT /api/notifications` routes
- On SOS: if emergency contact email belongs to a CareConnect account, creates a Notification and emits `notification:new` to their socket room in real time
- `NotificationBell` component in every dashboard header — 🔔 badge, dropdown, mark-as-read, 30s polling + real-time socket updates
- `AuthContext` now creates a shared socket on login, emits `user:join`, exposes socket to all components

---

## Current App Status

| Service | Status |
|---------|--------|
| MongoDB | ✅ Running (port 27017) |
| Backend API | ✅ Running (port 5001) |
| Frontend | ✅ Running (port 5173) |
| Database | ✅ Seeded |
| Maps | ✅ Leaflet + OpenStreetMap (free) |
| Auth | ✅ JWT + 4 role-specific login pages |
| Socket.io | ✅ Ambulance tracking + admin alerts + user notifications |
| Email | ✅ Nodemailer via Gmail (ali.memon1507@gmail.com) |
| Notifications | ✅ Real-time bell for all 4 roles |

**Open in browser: http://localhost:5173**

---

## Restart Commands (After Mac Reboot)

```bash
# 1. Start MongoDB
brew services start mongodb-community

# 2. Terminal 1 — Backend
cd careconnect/backend && node server.js

# 3. Terminal 2 — Frontend
cd careconnect/frontend && npm run dev
```

---

## What's Left To Do

### Nice to Have (Not Critical)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Patient doctor list shows unapproved doctors | Add `{ isApproved: true }` filter in `patientController.js → getDoctors` |
| 2 | No server-side double-booking guard | Add uniqueness check in `bookAppointment` before creating record |
| 3 | Medical records stored as base64 in MongoDB | Use Cloudinary or AWS S3 for production — store URL instead |
| 4 | No forgot password flow | Build reset-password email flow using the existing Nodemailer setup |
| 5 | No automated tests | Add Jest + Supertest for API route tests |
| 6 | App only runs locally | Deploy: backend → Railway/Render, frontend → Vercel/Netlify, DB → MongoDB Atlas |
