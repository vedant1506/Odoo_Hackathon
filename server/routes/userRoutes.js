const express = require('express');
const { getEmployees } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/employees', auth, getEmployees);

module.exports = router;
