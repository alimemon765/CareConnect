const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/emergencyController');

router.post('/sos', auth, role('patient'), c.sos);
router.get('/active', auth, role('patient'), c.getActiveRequest);
router.get('/status/:requestId', auth, role('patient'), c.getStatus);
router.put('/cancel/:requestId', auth, role('patient'), c.cancelRequest);
router.put('/accept/:requestId', auth, role('ambulance'), c.acceptRequest);
router.put('/complete/:requestId', auth, role('ambulance'), c.completeRequest);

module.exports = router;
