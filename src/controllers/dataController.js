const tmdbService = require('../services/tmdbService');

exports.seedMovies = async (req, res) => {
    res.json({ message: 'Movie seeding started in background...' });
    
    try {
        const count = await tmdbService.seedMovies();
        console.log(`Movie Seeding Completed: ${count} movies processed.`);
    } catch (error) {
        console.error('Movie Seeding Failed:', error);
    }
};

exports.seedActors = async (req, res) => {
    res.json({ message: 'Actor seeding started in background...' });

    try {
        const count = await tmdbService.seedActors();
        console.log(`Actor Seeding Completed: ${count} actors processed.`);
    } catch (error) {
        console.error('Actor Seeding Failed:', error);
    }
};