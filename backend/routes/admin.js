const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/adminController');

router.use(auth, role('admin'));

router.get('/users', c.getUsers);
router.delete('/users/:id', c.deleteUser);
router.get('/doctors', c.getDoctors);
router.put('/doctors/:id/approve', c.approveDoctor);
router.get('/appointments', c.getAppointments);
router.get('/ambulances', c.getAmbulances);
router.get('/dashboard', c.getDashboard);

module.exports = router;
