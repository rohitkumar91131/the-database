const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    overview: String,
    posterImageUrl: String, 
    posterDataUrl: String, 
    backdropImageUrl: String, 
    backdropDataUrl: String, 
    releaseDate: String,
    voteAverage: Number,
    voteCount: Number,
    director: String,
    cast: [{
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Actor'
        },
        name: String,
        character: String,
        profileImageUrl: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);