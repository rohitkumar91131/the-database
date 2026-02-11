const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String },
    image: { type: String },
    imageBlur: { type: String }, 
    rating: {
        rate: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);