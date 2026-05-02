const AmbulanceDriver = require('../models/AmbulanceDriver');
const EmergencyRequest = require('../models/EmergencyRequest');

exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driver = await AmbulanceDriver.findOneAndUpdate(
      { userId: req.user.userId },
      { currentLat: lat, currentLng: lng },
      { new: true }
    );
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActiveRequest = async (req, res) => {
  try {
    const driver = await AmbulanceDriver.findOne({ userId: req.user.userId });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const request = await EmergencyRequest.findOne({
      assignedAmbulanceId: driver._id,
      status: { $in: ['Assigned', 'En Route', 'Arrived'] }
    }).populate('patientId', 'name phone');

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
