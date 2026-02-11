const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

exports.renderAddForm = (req, res) => {
    res.render('addProduct', { title: 'NEXUS - Register Asset', path: '/products/add' });
};

exports.addProduct = async (req, res) => {
    try {
        const { title, price, description, category } = req.body;
        
        const imageUrl = req.file.path;

        const blurredUrl = cloudinary.url(req.file.filename, {
            width: 50,
            quality: 'auto:low',
            effect: "blur:1000"
        });

        const newProduct = new Product({
            title,
            price,
            description,
            category,
            image: imageUrl,
            imageBlur: blurredUrl,
            rating: { rate: 0, count: 0 }
        });

        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send("Upload failed!");
    }
};
exports.renderProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search ? { title: { $regex: search, $options: 'i' } } : {};
        const products = await Product.find(query).skip(skip).limit(limit).lean();
        const total = await Product.countDocuments(query);

        if (req.headers.accept.includes('json') || req.xhr) {
            return res.status(200).json({ success: true, count: products.length, data: products });
        }

        res.render('products', {
            title: 'NEXUS - Global Gear',
            path: '/products',
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            search
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


exports.getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        
        if (!product) return res.status(404).send("Product not found");

        res.render('productDetail', {
            title: `NEXUS - ${product.title}`,
            path: '/products',
            product
        });
    } catch (error) {
        res.status(500).send("Error fetching product details");
    }
};