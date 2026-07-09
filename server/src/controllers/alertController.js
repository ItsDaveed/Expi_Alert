const Alert = require('../models/Alert');

// @GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ business: req.business._id })
      .populate('product', 'name category expiryDate')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/alerts/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({ business: req.business._id, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/alerts/:id/read
const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, business: req.business._id },
      { isRead: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/alerts/mark-all-read
const markAllRead = async (req, res) => {
  try {
    await Alert.updateMany({ business: req.business._id, isRead: false }, { isRead: true });
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/alerts/:id
const deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, business: req.business._id });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAlerts, getUnreadCount, markAsRead, markAllRead, deleteAlert };
