const Product = require('../models/Product');
const Alert = require('../models/Alert');

// Compute status based on expiry date and warning threshold
const computeStatus = (expiryDate, warningDays) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= warningDays) return 'expiring_soon';
  return 'fresh';
};

// @GET /api/products
const getProducts = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = { business: req.business._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ expiryDate: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/products
const addProduct = async (req, res) => {
  try {
    const { name, barcode, category, quantity, unit, expiryDate, manufactureDate, supplier, location, notes } = req.body;

    const status = computeStatus(expiryDate, req.business.expiryWarningDays);

    const product = await Product.create({
      business: req.business._id,
      name, barcode, category, quantity, unit,
      expiryDate, manufactureDate, supplier, location, notes, status,
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.business._id.toString()).emit('product_added', product);

    // Auto-create alert if already expiring/expired
    if (status !== 'fresh') {
      const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      const alert = await Alert.create({
        business: req.business._id,
        product: product._id,
        type: status,
        message: status === 'expired'
          ? `${name} has already expired.`
          : `${name} expires in ${daysLeft} day(s).`,
        daysLeft,
      });
      io.to(req.business._id.toString()).emit('new_alert', alert);
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, business: req.business._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updates = req.body;
    if (updates.expiryDate) {
      updates.status = computeStatus(updates.expiryDate, req.business.expiryWarningDays);
    }

    Object.assign(product, updates);
    await product.save();

    const io = req.app.get('io');
    io.to(req.business._id.toString()).emit('product_updated', product);

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, business: req.business._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Remove related alerts
    await Alert.deleteMany({ product: req.params.id });

    const io = req.app.get('io');
    io.to(req.business._id.toString()).emit('product_deleted', { _id: req.params.id });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, business: req.business._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct, getProduct };
