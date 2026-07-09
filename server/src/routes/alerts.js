const express = require('express');
const router = express.Router();
const { getAlerts, getUnreadCount, markAsRead, markAllRead, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAlerts);
router.get('/unread-count', getUnreadCount);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteAlert);

module.exports = router;
