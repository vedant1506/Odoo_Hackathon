const express = require('express');
const { checkIn, checkOut, getAttendance } = require('../controllers/attendanceController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/', auth, getAttendance);

module.exports = router;