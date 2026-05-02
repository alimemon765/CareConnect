const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const getAvailableSlots = require('../utils/slotMatcher');

exports.getProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user.userId });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
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

exports.getDoctorById = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.params.id }).populate('userId', 'name email phone');
    if (!profile) return res.status(404).json({ message: 'Doctor not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const profile = await DoctorProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Doctor not found' });

    const booked = await Appointment.find({
      doctorId: req.params.id,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 86400000)
      },
      status: { $ne: 'Cancelled' }
    });

    const slots = await getAvailableSlots(profile, booked, date);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const appointment = await Appointment.create({
      patientId: req.user.userId,
      doctorId,
      date: new Date(date),
      timeSlot
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.userId })
      .populate('doctorId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.userId
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending appointments can be cancelled' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user.userId }).sort({ uploadedAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadRecord = async (req, res) => {
  try {
    const { fileName, fileType, base64Data, description } = req.body;
    const record = await MedicalRecord.create({
      patientId: req.user.userId,
      uploadedBy: req.user.userId,
      fileName,
      fileType,
      base64Data,
      description
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
