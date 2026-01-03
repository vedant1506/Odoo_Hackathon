const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.patch('/:id/read', auth, markAsRead);
router.patch('/read-all', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;
