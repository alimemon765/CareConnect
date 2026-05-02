const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const AmbulanceDriver = require('../models/AmbulanceDriver');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate('userId', 'name email phone');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveDoctor = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Doctor not found' });
    profile.isApproved = !profile.isApproved;
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAmbulances = async (req, res) => {
  try {
    const ambulances = await AmbulanceDriver.find().populate('userId', 'name email phone');
    res.json(ambulances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalDoctors, todayAppointments, activeAmbulances] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      AmbulanceDriver.countDocuments({ isOnDuty: true })
    ]);

    res.json({ totalPatients, totalDoctors, todayAppointments, activeAmbulances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
