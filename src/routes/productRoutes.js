const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../config/cloudinary');

router.get('/', productController.renderProducts);
router.get('/add', productController.renderAddForm);

router.get('/:id', productController.getProductDetail);
router.post('/add', upload.single('image'), productController.addProduct);

module.exports = router;