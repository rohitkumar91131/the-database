const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("📡 Connected to Nexus Database"))
    .catch(err => console.log("❌ Connection Error:", err));

const CLOUD_NAME = process.env.CLOUDINARY_NAME;

const importData = async () => {
    try {
        console.log("📥 Fetching data from FakeStoreAPI...");
        const response = await axios.get('https://fakestoreapi.com/products');
        const externalProducts = response.data;

        // Purana data saaf karo
        await Product.deleteMany();

        const formattedProducts = externalProducts.map(p => {
            // ✅ Cloudinary 'Fetch' transformation for External URLs
            // Ye URL external image ko Cloudinary se blur karke laayega
            const blurUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/w_50,e_blur:1000,f_auto,q_auto/${p.image}`;

            return {
                title: p.title,
                price: p.price,
                description: p.description,
                category: p.category,
                image: p.image,         // Original High-Res URL
                imageBlur: blurUrl,      // Dynamic Blurred Placeholder
                rating: {
                    rate: p.rating ? p.rating.rate : 0,
                    count: p.rating ? p.rating.count : 0
                }
            };
        });

        await Product.insertMany(formattedProducts);
        
        console.log("-----------------------------------------");
        console.log("✅ SUCCESS: " + formattedProducts.length + " items indexed.");
        console.log("✨ Blur placeholders generated via Cloudinary.");
        console.log("-----------------------------------------");
        
        process.exit();
    } catch (error) {
        console.error("❌ IMPORT FAILED:", error.message);
        process.exit(1);
    }
};

importData();