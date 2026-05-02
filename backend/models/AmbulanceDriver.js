const mongoose = require('mongoose');

const ambulanceDriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleNumber: String,
  currentLat: Number,
  currentLng: Number,
  isAvailable: { type: Boolean, default: true },
  isOnDuty: { type: Boolean, default: false }
});

module.exports = mongoose.model('AmbulanceDriver', ambulanceDriverSchema);
