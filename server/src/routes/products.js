const express = require('express');
const router = express.Router();
const { getProducts, addProduct, updateProduct, deleteProduct, getProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProducts);
router.post('/', addProduct);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
