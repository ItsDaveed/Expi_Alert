const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const businessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    notifyByEmail: { type: Boolean, default: true },
    expiryWarningDays: { type: Number, default: 7 }, // days before expiry to alert
  },
  { timestamps: true }
);

// Hash password before saving
businessSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
businessSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Business', businessSchema);
