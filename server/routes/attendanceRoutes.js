const express = require('express');
const { checkIn, checkOut, getAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/checkin', auth, checkIn);
router.post('/checkout', auth, checkOut);
router.get('/', auth, getAttendance);
router.get('/all', auth, adminOnly, getAllAttendance);

module.exports = router;