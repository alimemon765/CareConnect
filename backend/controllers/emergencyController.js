const AmbulanceDriver = require('../models/AmbulanceDriver');
const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');
const haversineDistance = require('../utils/haversine');
const sendEmergencyEmail = require('../utils/mailer');

let io;
const setIO = (socketIO) => { io = socketIO; };

const sos = async (req, res) => {
  try {
    const { patientLat, patientLng } = req.body;
    const drivers = await AmbulanceDriver.find({ isAvailable: true });
    if (!drivers.length) {
      return res.status(503).json({ message: 'No ambulances available' });
    }

    let nearest = null;
    let minDist = Infinity;
    for (const driver of drivers) {
      const dist = haversineDistance(patientLat, patientLng, driver.currentLat, driver.currentLng);
      if (dist < minDist) {
        minDist = dist;
        nearest = driver;
      }
    }

    nearest.isAvailable = false;
    nearest.isOnDuty = true;
    await nearest.save();

    const eta = Math.round((minDist / 40) * 60);
    const request = await EmergencyRequest.create({
      patientId: req.user.userId,
      patientLat,
      patientLng,
      assignedAmbulanceId: nearest._id,
      status: 'Assigned',
      eta
    });

    io.to(`driver:${nearest.userId}`).emit('emergency:assigned', {
      requestId: request._id,
      patientLat,
      patientLng
    });

    const [patient, driverUser] = await Promise.all([
      User.findById(req.user.userId).select('name'),
      User.findById(nearest.userId).select('name')
    ]);

    io.to('admin-room').emit('admin:emergency_alert', {
      patientName: patient.name,
      patientLat,
      patientLng,
      driverName: driverUser.name,
      vehicleNumber: nearest.vehicleNumber,
      timestamp: new Date()
    });

    const populated = await EmergencyRequest.findById(request._id)
      .populate('assignedAmbulanceId');

    // Send response immediately — notifications are fire-and-forget
    res.status(201).json(populated);

    // Non-blocking: email + in-app notification (failures never reach the client)
    (async () => {
      try {
        const patientProfile = await PatientProfile.findOne({ userId: req.user.userId });
        const emergencyContactEmail = patientProfile?.emergencyContact?.email;

        if (!emergencyContactEmail) return;

        // Send email
        await sendEmergencyEmail(
          emergencyContactEmail,
          patient.name,
          driverUser.name,
          nearest.vehicleNumber,
          patientLat,
          patientLng,
          new Date()
        );

        // In-app notification if contact has a CareConnect account
        const contactUser = await User.findOne({ email: emergencyContactEmail });
        if (contactUser) {
          await Notification.create({
            userId: contactUser._id,
            type: 'emergency',
            title: '🚨 Emergency Alert',
            message: `${patient.name} has triggered an SOS. Ambulance ${nearest.vehicleNumber} (${driverUser.name}) has been dispatched to their location.`
          });
          io.to(`user:${contactUser._id}`).emit('notification:new', {
            type: 'emergency',
            title: '🚨 Emergency Alert',
            message: `${patient.name} has triggered an SOS. Ambulance dispatched.`
          });
        }
      } catch (err) {
        console.error('Post-SOS notification error:', err.message);
      }
    })();

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActiveRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findOne({
      patientId: req.user.userId,
      status: { $in: ['Assigned', 'En Route', 'Arrived'] },
    }).populate('assignedAmbulanceId').sort({ createdAt: -1 });
    res.json(request || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.requestId)
      .populate('assignedAmbulanceId');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.status !== 'Assigned') {
      return res.status(400).json({ message: 'Cannot cancel — ambulance already en route' });
    }
    request.status = 'Cancelled';
    await request.save();
    const driver = await AmbulanceDriver.findById(request.assignedAmbulanceId);
    if (driver) { driver.isAvailable = true; driver.isOnDuty = false; await driver.save(); }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });
    request.status = 'En Route';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const completeRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });
    request.status = 'Completed';
    await request.save();

    const driver = await AmbulanceDriver.findById(request.assignedAmbulanceId);
    if (driver) {
      driver.isAvailable = true;
      driver.isOnDuty = false;
      await driver.save();
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { setIO, sos, getActiveRequest, getStatus, cancelRequest, acceptRequest, completeRequest };
