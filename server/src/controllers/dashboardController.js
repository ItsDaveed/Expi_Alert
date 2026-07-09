const Product = require('../models/Product');
const Alert = require('../models/Alert');

// @GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const businessId = req.business._id;

    const [total, fresh, expiringSoon, expired, recentAlerts, categories] = await Promise.all([
      Product.countDocuments({ business: businessId }),
      Product.countDocuments({ business: businessId, status: 'fresh' }),
      Product.countDocuments({ business: businessId, status: 'expiring_soon' }),
      Product.countDocuments({ business: businessId, status: 'expired' }),
      Alert.find({ business: businessId, isRead: false })
        .populate('product', 'name expiryDate')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.distinct('category', { business: businessId }),
    ]);

    // Products expiring in the next 7 days
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const expiringThisWeek = await Product.find({
      business: businessId,
      expiryDate: { $gte: today, $lte: next7Days },
    }).sort({ expiryDate: 1 }).limit(10);

    res.json({
      stats: { total, fresh, expiringSoon, expired },
      recentAlerts,
      expiringThisWeek,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };
