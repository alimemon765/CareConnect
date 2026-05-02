const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/doctorController');

router.use(auth, role('doctor'));

router.get('/profile', c.getProfile);
router.put('/profile', c.updateProfile);
router.get('/appointments', c.getAppointments);
router.put('/appointments/:id', c.updateAppointment);
router.post('/records/:patientId', c.uploadRecordForPatient);

module.exports = router;
