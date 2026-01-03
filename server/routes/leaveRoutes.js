const express = require('express');
const { applyLeave, getLeaves, approveRejectLeave, getAllLeaves } = require('../controllers/leaveController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', auth, applyLeave);
router.get('/', auth, getLeaves);
router.post('/approve-reject', auth, adminOnly, approveRejectLeave);
router.get('/all', auth, adminOnly, getAllLeaves);

module.exports = router;