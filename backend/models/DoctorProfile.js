const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: String,
  experience: Number,
  consultationFee: Number,
  availableSlots: [{ day: String, startTime: String, endTime: String }],
  bio: String,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false }
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
