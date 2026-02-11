const Movie = require('../models/Movie');

exports.getAllMovies = async (page = 1, limit = 12, search = '') => {
    const skip = (page - 1) * limit;
    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const movies = await Movie.find(query)
        .select('title posterImageUrl posterDataUrl voteAverage releaseDate')
        .sort({ releaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Movie.countDocuments(query);

    return {
        movies,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

exports.getMovieById = async (id) => {
    return await Movie.findById(id).lean();
};