require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const tmdbService = require('./src/services/tmdbService');

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('DB Connection Failed', error);
        process.exit(1);
    }
};

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    
    await connectDB();

    console.log('--- Starting Complete Data Hub Seeding ---');
    try {
        const count = await tmdbService.seedDatabase();
        console.log(`\n🎉 SUCCESS! Database hydrated with ${count} movies and their related actors.`);
    } catch (error) {
        console.error('Seeding Failed:', error);
    }
});