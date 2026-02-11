const movieService = require('../services/movieService');

exports.getMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';

        const data = await movieService.getAllMovies(page, limit, search);

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }
        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTrailer = async (req, res) => {
    try {
        const key = await movieService.getTrailerKey(req.params.id);
        if (!key) return res.status(404).json({ success: false, message: "No trailer found" });
        
        res.status(200).json({ success: true, key });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};