const jwt = require('jsonwebtoken');
const Business = require('../models/Business');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { businessName, email, password, phone, address } = req.body;

    if (!businessName || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const exists = await Business.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const business = await Business.create({ businessName, email, password, phone, address });

    res.status(201).json({
      _id: business._id,
      businessName: business.businessName,
      email: business.email,
      token: generateToken(business._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const business = await Business.findOne({ email });
    if (!business || !(await business.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: business._id,
      businessName: business.businessName,
      email: business.email,
      token: generateToken(business._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.business);
};

// @PUT /api/auth/settings
const updateSettings = async (req, res) => {
  try {
    const { businessName, phone, address, notifyByEmail, expiryWarningDays } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.business._id,
      { businessName, phone, address, notifyByEmail, expiryWarningDays },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateSettings };
