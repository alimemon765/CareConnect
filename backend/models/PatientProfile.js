const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: Number,
  gender: String,
  bloodGroup: String,
  allergies: [String],
  chronicConditions: [String],
  emergencyContact: { name: String, phone: String, email: String }
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
