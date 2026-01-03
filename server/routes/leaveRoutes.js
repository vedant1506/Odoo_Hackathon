const express = require('express');
const { applyLeave, getLeaves, approveRejectLeave, getAllLeaves } = require('../controllers/leaveController');
const { auth, hrOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', auth, applyLeave);
router.get('/', auth, getLeaves);
router.post('/approve-reject', auth, hrOrAdmin, approveRejectLeave);
router.get('/all', auth, hrOrAdmin, getAllLeaves);

module.exports = router;