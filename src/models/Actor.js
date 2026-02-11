const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    biography: String,
    birthday: String,
    placeOfBirth: String,
    knownForDepartment: String,
    popularity: Number,
    profileImageUrl: String,
    profileDataUrl: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Actor', actorSchema);