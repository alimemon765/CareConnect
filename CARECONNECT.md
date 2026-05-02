# CareConnect — Full Project Documentation

---

## What Is CareConnect?

CareConnect is a full-stack **healthcare mobile web app** built to run in a phone browser. It connects four types of users — patients, doctors, ambulance drivers, and admins — in one unified platform.

Patients can find doctors, book appointments, manage medical records, and trigger an emergency SOS that dispatches a real ambulance with live GPS tracking. Doctors manage their availability and write prescriptions. Ambulance drivers receive emergency assignments and broadcast their live location. Admins see everything in real time.

It looks and feels like a native mobile app — white and yellow design, smooth animations, bottom navigation, installable on your phone home screen (PWA).

---

## Tech Stack

| Layer | What We Used | Why |
|-------|-------------|-----|
| Frontend | React 18 + Vite | Fast modern UI framework |
| Styling | Tailwind CSS + inline styles | Utility-first, easy responsive design |
| Animations | Framer Motion | Smooth enter/exit/tap animations |
| Icons | Lucide React | Clean consistent icon set |
| Maps | Leaflet + OpenStreetMap | Free, no API key needed |
| Real-time | Socket.io | Bidirectional events (GPS, alerts) |
| Backend | Node.js + Express | JavaScript on the server |
| Database | MongoDB + Mongoose | Flexible document storage |
| Auth | JWT tokens | Stateless, works across devices |
| Email | Nodemailer + Gmail App Password | Emergency contact alerts |
| PWA | Web Manifest + Service Worker | Installable, themed browser chrome |

---

## Project Structure

```
careconnect/
├── backend/
│   ├── controllers/         Business logic — one file per domain
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── adminController.js
│   │   ├── emergencyController.js
│   │   └── ambulanceController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   Checks JWT on every protected route
│   │   └── roleMiddleware.js   Blocks wrong-role access
│   ├── models/              MongoDB schemas
│   │   ├── User.js
│   │   ├── DoctorProfile.js
│   │   ├── PatientProfile.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── AmbulanceDriver.js
│   │   ├── EmergencyRequest.js
│   │   └── Notification.js
│   ├── routes/              Express routers — one per role
│   │   ├── auth.js
│   │   ├── patient.js
│   │   ├── doctor.js
│   │   ├── admin.js
│   │   ├── emergency.js
│   │   ├── ambulance.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── haversine.js     Great-circle distance for nearest ambulance
│   │   └── mailer.js        Nodemailer email sender
│   ├── server.js            Entry point — Express + Socket.io + MongoDB
│   ├── seed.js              Populates DB with sample data
│   └── .env
│
└── frontend/
    ├── public/
    │   ├── manifest.json    PWA config (name, icons, theme color)
    │   └── sw.js            Service worker for offline caching
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx   Global auth state (user, login, logout)
    │   ├── components/
    │   │   ├── Layout.jsx         Header + bottom nav wrapper
    │   │   ├── NotificationBell.jsx
    │   │   ├── StatusBadge.jsx    Color-coded status pill
    │   │   └── Spinner.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx        Role selector home page
    │   │   ├── Register.jsx
    │   │   ├── auth/
    │   │   │   ├── PatientLogin.jsx     Yellow theme
    │   │   │   ├── DoctorLogin.jsx      Teal theme
    │   │   │   ├── AdminLogin.jsx       Purple theme
    │   │   │   └── AmbulanceLogin.jsx   Pink-red theme
    │   │   ├── patient/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Doctors.jsx
    │   │   │   ├── DoctorDetail.jsx
    │   │   │   ├── BookAppointment.jsx
    │   │   │   ├── Appointments.jsx
    │   │   │   ├── Records.jsx
    │   │   │   ├── Profile.jsx
    │   │   │   └── SOS.jsx
    │   │   ├── doctor/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Appointments.jsx
    │   │   │   └── Profile.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Users.jsx
    │   │   │   ├── Doctors.jsx
    │   │   │   ├── Appointments.jsx
    │   │   │   └── Ambulances.jsx
    │   │   └── ambulance/
    │   │       ├── Dashboard.jsx
    │   │       └── Map.jsx
    │   ├── App.jsx           All routes + ProtectedRoute
    │   ├── main.jsx          PWA service worker registration
    │   └── index.css         Tailwind + custom keyframes
    ├── index.html
    ├── tailwind.config.js
    └── .env
```

---

## Every Feature — What It Does

### Landing Page
- Four colored tiles: Patient (yellow), Doctor (teal), Admin (purple), Ambulance (pink-red)
- Tapping a tile goes to that role's login page
- Staggered animation on load

### Registration
- Single form — pick role, enter name, email, password
- Backend creates a `User` record + an empty linked profile (e.g. `PatientProfile`) in one request

### Role-Specific Login Pages
- Each has its own color gradient hero section
- Password show/hide toggle
- On success, JWT is saved and user is redirected to their dashboard

---

### Patient — Dashboard
- Greets patient by first name with today's date
- Hero card shows the next upcoming appointment (doctor, time, date). If none, shows "You're all clear"
- Mini schedule card showing count of upcoming appointments
- 2×2 action grid: Find Doctors, Emergency SOS, Your Schedule, (teal/red/yellow tiles)

### Patient — Find Doctors
- Lists all approved doctors with avatar (first letter), name, specialization, fee, rating, experience
- Live search by name or specialization
- Horizontal filter chips for specializations
- Tap any doctor to open their detail page

### Patient — Doctor Detail
- Teal gradient card with doctor stats (rating, years experience, consultation fee, bio)
- Date picker — select any future date
- Available time slots appear as teal pills for that date (fetched live from backend)
- Fixed "Book Appointment" button at the bottom — passes selected date to booking page

### Patient — Book Appointment
- Pre-filled with date from doctor detail
- Time slot grid — tap to select one
- Optional notes field (symptoms, reason for visit)
- Confirm button books and redirects to appointments list

### Patient — Appointments
- Toggle: Upcoming (Pending/Confirmed) vs Past (Completed/Cancelled)
- Each card: doctor name, date, time, status badge
- Prescription shown if doctor has written one
- Cancel button on Pending appointments

### Patient — Medical Records
- Upload any file (PDF, image, document) with optional description
- Stored as base64 in MongoDB
- List of all records with download button

### Patient — Profile
- Basic info: age, gender, blood group
- Medical info: allergies (comma-separated), chronic conditions
- Emergency contact: name, phone, email — **this email receives an alert when SOS is triggered**

### Patient — Emergency SOS
Full flow:
1. Large pulsing red SOS button
2. Press it → browser requests GPS location
3. Coordinates sent to backend → nearest available ambulance found → dispatched
4. Tracking view slides up:
   - White card with vehicle number, ETA, live GPS indicator
   - Map showing blue dot (you) and animated 🚑 emoji (ambulance)
   - Ambulance marker moves in real time as driver broadcasts GPS
   - Map auto-pans to keep both markers in view
5. Status bar: "En Route" → "Arrived"
6. When driver marks complete → page auto-switches to green "Help has arrived" screen
7. "Back to Safety" button resets back to the SOS button
8. **If you navigate away mid-SOS and come back, tracking is restored automatically** (fetches active request on mount)

---

### Doctor — Dashboard
- Teal gradient greeting card with today's date
- Two stat tiles: today's appointments, total upcoming
- Today's schedule list with patient name, time slot, status badge

### Doctor — Appointments
- Full list of all appointments (all dates)
- Tap to expand any appointment:
  - Shows patient email and notes
  - Prescription textarea
  - "Complete" button — saves prescription and marks appointment done
  - "Save Rx" button — saves prescription without marking done

### Doctor — Profile
- Edit specialization, experience (years), consultation fee, bio
- Available Slots manager:
  - Pick day of week, start time, end time → Add Slot
  - Existing slots shown as pills with X to remove
  - These slots are what patients see when booking

---

### Admin — Dashboard
- 4 stat cards: Total Patients, Total Doctors, Today's Appointments, Active Ambulances
- Live SOS alert stack — when any patient triggers SOS, a banner appears instantly via Socket.io showing patient name, GPS coordinates, vehicle number, driver name. Dismiss with X.

### Admin — Users
- Full list of all registered users with role-colored badges
- Delete any non-admin user

### Admin — Doctors
- All doctors with approval status badge (Approved / Pending)
- Approve button for pending doctors — only approved doctors appear in patient search
- Deactivate button to hide an active doctor

### Admin — Appointments
- View all appointments across all patients and doctors

### Admin — Ambulance Fleet
- All ambulance drivers with vehicle number, availability status, on-duty status
- Shows live GPS coordinates if driver is broadcasting

---

### Ambulance Driver — Dashboard
- Geo error banner if location permission denied
- Live GPS card showing current coordinates (updated every 5 seconds)
- If no active emergency: green "Available — Waiting for assignments" card
- When emergency assigned:
  - Socket notification fires instantly
  - Card shows patient name, phone number, GPS coordinates, ETA in minutes
  - "Accept & En Route" button — changes status, patient sees update
  - "Mark Complete" button — ends the emergency, frees the ambulance
  - Map button links to live map view

### Ambulance Driver — Live Map
- Shows driver's current position (teal 🚑 icon) and patient location (red pulsing dot)
- Destination card below map with patient name and coordinates

---

## How The Core Systems Work (Explained Simply)

### Authentication — How Login Works

Think of a JWT token like a signed wristband at an event. When you log in, the server checks your password, then hands you a wristband that says "this is Ali, he's a patient." You carry that wristband on every request. The server just reads it — it doesn't need to look you up in a database each time.

On the frontend, the token is saved in `localStorage`. A piece of code called `AuthContext` reads it when the app loads, fetches your profile, and makes your user info available everywhere. When you log out, the token is deleted.

Every protected API endpoint runs two checks:
1. `authMiddleware` — is this token real and not expired?
2. `roleMiddleware` — does this user's role match what this route allows?

### Slot Booking — How Available Times Are Generated

When a doctor sets their availability (e.g. "Monday 09:00–12:00"), that's saved as a rule, not as individual slots. When a patient picks a date (say May 5), the backend:

1. Figures out what day of the week May 5 is (Monday)
2. Finds the doctor's Monday window (09:00–12:00)
3. Splits it into 30-minute slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
4. Checks existing appointments for that doctor on May 5
5. Removes any already-booked slots
6. Returns the remaining open slots

The patient only ever sees genuinely available times.

### Emergency SOS — The Full Chain

When a patient presses SOS:

1. **Browser GPS** — `navigator.geolocation.getCurrentPosition()` gets lat/lng
2. **Backend receives coordinates** — finds all drivers where `isAvailable: true`
3. **Haversine formula** — calculates straight-line distance from each driver to the patient using the Earth's curvature. Picks the nearest one.
4. **Driver marked busy** — `isAvailable: false`, `isOnDuty: true` saved to DB
5. **EmergencyRequest created** — stores patient coords, driver ID, ETA, status "Assigned"
6. **Socket.io dispatch** — server emits `emergency:assigned` to the driver's personal socket room
7. **Admin alert** — server simultaneously emits `admin:emergency_alert` to the admin room
8. **Email sent** — Nodemailer fires an email to the patient's emergency contact (non-blocking — doesn't delay the SOS response)
9. **Patient tracking** — frontend joins a socket room for this request, listens for `driver:location` events
10. **Driver GPS loop** — ambulance dashboard runs `setInterval` every 5 seconds, calls `navigator.geolocation`, emits `driver:location` with lat/lng
11. **Ambulance marker moves** — Leaflet's `setLatLng()` smoothly repositions the 🚑 marker without re-rendering the map
12. **Completion** — driver taps "Mark Complete" → status updated → patient's polling detects "Completed" → "Help has arrived" screen shown

### Real-Time (Socket.io) — How Events Flow

Socket.io is like a live phone call between server and client. Instead of the client asking "anything new?" every second (polling), the server can push updates instantly.

The app uses named "rooms" so messages only go to the right people:

```
driver:join  <userId>           → driver joins room "driver:abc123"
patient:join <requestId>        → patient joins room "emergency:xyz789"
admin:join                      → admin joins room "admin-room"

driver:location { requestId, lat, lng }
  → received by server
  → re-emitted to room "emergency:xyz789" (only that patient)

emergency:assigned
  → emitted to "driver:abc123" (only that driver)

admin:emergency_alert
  → emitted to "admin-room" (all logged-in admins)
```

### PWA — How It Works As a Phone App

A PWA (Progressive Web App) uses two things:

1. **`manifest.json`** — tells the browser the app's name, icon, and theme color. On Android, "Add to Home Screen" uses this to create an app-like icon.
2. **Service Worker (`sw.js`)** — a background script that intercepts network requests and can cache them. This lets the app load faster and work partially offline.

The `theme-color` meta tag (`#FFB800`) turns the browser address bar yellow on mobile, making it feel like a real app rather than a website.

---

## Design System

| Token | Value | Used For |
|-------|-------|----------|
| Background | `#F8F9FA` | Page background |
| Card | `#FFFFFF` | Cards, modals |
| Input | `#F1F3F5` | All input fields |
| Yellow (primary) | `#FFB800` | Buttons, active nav, hero cards |
| Teal (secondary) | `#4ECDC4` | Doctor cards, schedule |
| Danger | `#FF4757` | SOS, cancel, emergency |
| Success | `#2ED573` | Completed states |
| Orange | `#FF8C42` | Gradient pairs with yellow |
| Text main | `#1A1A2E` | Headings, primary text |
| Text sub | `#6B7280` | Secondary text |
| Text muted | `#9CA3AF` | Labels, placeholders |
| Border | `#E5E7EB` | Dividers |

All cards use `border-radius: 20px` and `box-shadow: 0 2px 16px rgba(0,0,0,0.06)`.

---

## API Reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login, get JWT |
| GET | `/me` | Yes | Get current user |

### Patient — `/api/patient` (role: patient)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | View / update profile |
| GET | `/doctors` | List all approved doctors |
| GET | `/doctors/:id` | Doctor detail |
| GET | `/doctors/:id/slots?date=` | Available time slots |
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | My appointments |
| PUT | `/appointments/:id/cancel` | Cancel appointment |
| GET/POST | `/records` | View / upload medical records |

### Doctor — `/api/doctor` (role: doctor)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | View / update profile + slots |
| GET | `/appointments` | All appointments |
| PUT | `/appointments/:id` | Update status / prescription |

### Admin — `/api/admin` (role: admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Stat counts |
| GET | `/users` | All users |
| DELETE | `/users/:id` | Delete user |
| GET | `/doctors` | All doctor profiles |
| PUT | `/doctors/:id/approve` | Toggle approve / deactivate |
| GET | `/appointments` | All appointments |
| GET | `/ambulances` | All ambulance drivers |

### Emergency — `/api/emergency`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sos` | patient | Dispatch nearest ambulance |
| GET | `/active` | patient | Get current active request |
| GET | `/status/:requestId` | patient | Poll request status |
| PUT | `/cancel/:requestId` | patient | Cancel request |
| PUT | `/accept/:requestId` | ambulance | Accept, mark En Route |
| PUT | `/complete/:requestId` | ambulance | Mark completed |

### Ambulance — `/api/ambulance` (role: ambulance)
| Method | Path | Description |
|--------|------|-------------|
| PUT | `/location` | Update GPS coordinates |
| GET | `/active-request` | Get current active emergency |

---

## How To Run The Project

### Prerequisites
- Node.js installed via nvm (`nvm use --lts`)
- MongoDB running locally on port 27017

### Start Backend
```bash
source ~/.nvm/nvm.sh && nvm use --lts
cd careconnect/backend
node server.js
# → MongoDB connected
# → Server running on port 5001
```

### Start Frontend
```bash
cd careconnect/frontend
npm run dev
# → http://localhost:5173
```

### Environment Variables (`backend/.env`)
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/careconnect
JWT_SECRET=careconnect_secret_key_2025
GMAIL_USER=ali.memon1507@gmail.com
GMAIL_APP_PASSWORD=bhcgvclsrhlclcce
```

### Seed Data (Sample Users)
```bash
cd careconnect/backend
node seed.js
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@careconnect.com | admin123 |
| Doctor | priya@careconnect.com | doctor123 |
| Doctor | rahul@careconnect.com | doctor123 |
| Doctor | anjali@careconnect.com | doctor123 |
| Patient | amit@patient.com | patient123 |
| Patient | sneha@patient.com | patient123 |

---

## Key Flows To Test

| Flow | Steps |
|------|-------|
| Book appointment | Patient login → Doctors → pick doctor → pick date → pick slot → Confirm |
| Write prescription | Doctor login → Appointments → expand card → type prescription → Complete |
| Emergency SOS | Patient login (allow location) + Ambulance driver login in another tab → SOS button → driver accepts → live tracking |
| Approve doctor | Admin login → Doctors → Approve a pending doctor |
| Real-time admin alert | Admin login + trigger SOS as patient → alert banner appears instantly on admin dashboard |
| SOS persistence | Trigger SOS → navigate to Dashboard → come back to SOS page → tracking still showing |
| SOS completion | Driver marks Complete → patient sees "Help has arrived" green screen |
