const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const c = require('../controllers/ambulanceController');

router.use(auth, role('ambulance'));

router.put('/location', c.updateLocation);
router.get('/active-request', c.getActiveRequest);

module.exports = router;
