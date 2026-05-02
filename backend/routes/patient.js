const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/patientController');

router.use(auth, role('patient'));

router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.get('/doctors', c.getDoctors);
router.get('/doctors/:id/slots', c.getDoctorSlots);
router.get('/doctors/:id', c.getDoctorById);
router.post('/appointments', c.bookAppointment);
router.get('/appointments', c.getAppointments);
router.put('/appointments/:id/cancel', c.cancelAppointment);
router.get('/records', c.getRecords);
router.post('/records', c.uploadRecord);

module.exports = router;
