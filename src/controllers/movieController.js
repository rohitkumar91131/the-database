const tmdbService = require('../services/tmdbService');

exports.seedMovies = async (req, res) => {
    try {
        const apiKey = req.body.tmdbApiKey || process.env.TMDB_API_KEY;

        if (!apiKey) {
            return res.status(400).json({ error: 'TMDB API Key is required' });
        }

        const count = await tmdbService.seedMovies(apiKey);

        res.status(200).json({ 
            success: true, 
            message: `Successfully seeded/updated ${count} movies from TMDB` 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};