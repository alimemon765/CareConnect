const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const PatientProfile = require('../models/PatientProfile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user.userId });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.userId })
      .populate('patientId', 'name email phone')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: req.user.userId
    });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const { prescription, status, notes } = req.body;
    if (prescription) appointment.prescription = prescription;
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadRecordForPatient = async (req, res) => {
  try {
    const { fileName, fileType, base64Data, description } = req.body;
    const record = await MedicalRecord.create({
      patientId: req.params.patientId,
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
