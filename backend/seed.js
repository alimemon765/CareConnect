require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');
const PatientProfile = require('./models/PatientProfile');
const AmbulanceDriver = require('./models/AmbulanceDriver');
const Appointment = require('./models/Appointment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    DoctorProfile.deleteMany({}),
    PatientProfile.deleteMany({}),
    AmbulanceDriver.deleteMany({}),
    Appointment.deleteMany({})
  ]);

  const hash = (pw) => bcrypt.hash(pw, 10);

  // Admin
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@careconnect.com',
    password: await hash('admin123'),
    role: 'admin'
  });

  // Doctors
  const docUsers = await User.insertMany([
    { name: 'Dr. Priya Sharma', email: 'priya@careconnect.com', password: await hash('doctor123'), role: 'doctor', phone: '9876543210' },
    { name: 'Dr. Rahul Mehta', email: 'rahul@careconnect.com', password: await hash('doctor123'), role: 'doctor', phone: '9876543211' },
    { name: 'Dr. Anjali Verma', email: 'anjali@careconnect.com', password: await hash('doctor123'), role: 'doctor', phone: '9876543212' }
  ]);

  const slots = [
    { day: 'Monday', startTime: '10:00', endTime: '13:00' },
    { day: 'Wednesday', startTime: '10:00', endTime: '13:00' },
    { day: 'Friday', startTime: '14:00', endTime: '17:00' }
  ];

  await DoctorProfile.insertMany([
    {
      userId: docUsers[0]._id,
      specialization: 'Cardiologist',
      experience: 12,
      consultationFee: 800,
      availableSlots: slots,
      bio: 'Expert in heart diseases with 12 years of experience at top Mumbai hospitals.',
      rating: 4.8,
      reviewCount: 124,
      isApproved: true
    },
    {
      userId: docUsers[1]._id,
      specialization: 'Dermatologist',
      experience: 8,
      consultationFee: 600,
      availableSlots: slots,
      bio: 'Skin specialist focused on acne, eczema, and cosmetic dermatology.',
      rating: 4.5,
      reviewCount: 89,
      isApproved: true
    },
    {
      userId: docUsers[2]._id,
      specialization: 'General Physician',
      experience: 15,
      consultationFee: 400,
      availableSlots: slots,
      bio: 'General practitioner handling routine checkups, fevers, and chronic disease management.',
      rating: 4.7,
      reviewCount: 210,
      isApproved: true
    }
  ]);

  // Patients
  const patUsers = await User.insertMany([
    { name: 'Amit Kumar', email: 'amit@patient.com', password: await hash('patient123'), role: 'patient', phone: '9800000001' },
    { name: 'Sneha Patel', email: 'sneha@patient.com', password: await hash('patient123'), role: 'patient', phone: '9800000002' },
    { name: 'Ravi Singh', email: 'ravi@patient.com', password: await hash('patient123'), role: 'patient', phone: '9800000003' }
  ]);

  await PatientProfile.insertMany([
    {
      userId: patUsers[0]._id,
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension'],
      emergencyContact: { name: 'Sita Kumar', phone: '9800000010' }
    },
    {
      userId: patUsers[1]._id,
      age: 28,
      gender: 'Female',
      bloodGroup: 'B+',
      allergies: [],
      chronicConditions: [],
      emergencyContact: { name: 'Rohit Patel', phone: '9800000011' }
    },
    {
      userId: patUsers[2]._id,
      age: 45,
      gender: 'Male',
      bloodGroup: 'A-',
      allergies: ['Sulfa'],
      chronicConditions: ['Diabetes Type 2'],
      emergencyContact: { name: 'Meena Singh', phone: '9800000012' }
    }
  ]);

  // Ambulance drivers
  const ambUsers = await User.insertMany([
    { name: 'Suresh Driver', email: 'suresh@ambulance.com', password: await hash('ambulance123'), role: 'ambulance', phone: '9700000001' },
    { name: 'Mukesh Driver', email: 'mukesh@ambulance.com', password: await hash('ambulance123'), role: 'ambulance', phone: '9700000002' }
  ]);

  await AmbulanceDriver.insertMany([
    { userId: ambUsers[0]._id, vehicleNumber: 'MH01-AB-1234', currentLat: 19.0760, currentLng: 72.8777, isAvailable: true, isOnDuty: false },
    { userId: ambUsers[1]._id, vehicleNumber: 'MH01-CD-5678', currentLat: 19.0820, currentLng: 72.8850, isAvailable: true, isOnDuty: false }
  ]);

  // Appointments
  const now = new Date();
  const d = (offset) => new Date(now.getTime() + offset * 86400000);

  await Appointment.insertMany([
    { patientId: patUsers[0]._id, doctorId: docUsers[0]._id, date: d(1), timeSlot: '10:00', status: 'Pending' },
    { patientId: patUsers[1]._id, doctorId: docUsers[1]._id, date: d(2), timeSlot: '10:30', status: 'Confirmed' },
    { patientId: patUsers[2]._id, doctorId: docUsers[2]._id, date: d(-1), timeSlot: '14:00', status: 'Completed', prescription: 'Metformin 500mg twice daily' },
    { patientId: patUsers[0]._id, doctorId: docUsers[2]._id, date: d(-3), timeSlot: '10:00', status: 'Completed', prescription: 'Paracetamol 500mg as needed' },
    { patientId: patUsers[1]._id, doctorId: docUsers[0]._id, date: d(0), timeSlot: '11:00', status: 'Cancelled' }
  ]);

  console.log('Seed complete!');
  console.log('Admin login: admin@careconnect.com / admin123');
  console.log('Doctor login: priya@careconnect.com / doctor123');
  console.log('Patient login: amit@patient.com / patient123');
  console.log('Ambulance login: suresh@ambulance.com / ambulance123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
