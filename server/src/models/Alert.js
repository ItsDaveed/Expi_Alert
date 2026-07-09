const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['expiring_soon', 'expired'],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    daysLeft: { type: Number }, // negative means already expired
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
