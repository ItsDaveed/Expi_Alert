const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true, trim: true },
    barcode: { type: String, default: '' },
    category: { type: String, default: 'General' },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'pcs' }, // pcs, kg, litres, etc.
    expiryDate: { type: Date, required: true },
    manufactureDate: { type: Date },
    supplier: { type: String, default: '' },
    location: { type: String, default: '' }, // shelf/aisle location in store
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['fresh', 'expiring_soon', 'expired'],
      default: 'fresh',
    },
  },
  { timestamps: true }
);

// Virtual: days until expiry
productSchema.virtual('daysUntilExpiry').get(function () {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
