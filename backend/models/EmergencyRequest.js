const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientLat: Number,
  patientLng: Number,
  assignedAmbulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'AmbulanceDriver' },
  status: {
    type: String,
    enum: ['Requested', 'Assigned', 'En Route', 'Arrived', 'Completed'],
    default: 'Requested'
  },
  requestedAt: { type: Date, default: Date.now },
  eta: Number
});

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
