const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const Movie = require('../models/Movie');
const Actor = require('../models/Actor');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780'; 
const FALLBACK_IMAGE = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const safeAxiosGet = async (url, params, retries = 10) => { 
    try {
        return await axios.get(url, { 
            params, 
            timeout: 60000, 
            headers: { 'Connection': 'keep-alive' } 
        }); 
    } catch (error) {
        if (retries > 0) {
            const waitTime = (11 - retries) * 2000; 
            console.log(`   ⚠️ Network busy. Cooling down for ${waitTime/1000}s...`);
            await sleep(waitTime);
            return safeAxiosGet(url, params, retries - 1);
        }
        throw error;
    }
};

const toDataUrl = async (url) => {
    try {
        const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const base64 = Buffer.from(res.data).toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    } catch (err) {
        return '';
    }
};

// NOTE: Maine is function ko call karna band kar diya hai main logic mein
// taaki purana data delete na ho jaye.
const cleanCloudinaryAccount = async () => {
    try {
        console.log('🔥 Wiping Cloudinary account resources...');
        await cloudinary.api.delete_all_resources();
        console.log('✅ Cloudinary Resources Wiped');
    } catch (error) {
        console.log('⚠️ Cloudinary Clean Warning:', error.message);
    }
};

const processImage = async (tmdbPath, folderName, fileId) => {
    if (!tmdbPath) return { url: FALLBACK_IMAGE, dataUrl: '' };
    const fullUrl = `${TMDB_IMAGE_BASE}${tmdbPath}`;
    
    try {
        // overwrite: false = Agar image hai to dobara upload mat karo
        const upload = await cloudinary.uploader.upload(fullUrl, {
            folder: folderName,
            public_id: fileId,
            resource_type: 'image',
            overwrite: false, 
            timeout: 60000 
        });

        // Tiny Placeholder Generate Karo
        const tinyUrl = cloudinary.url(upload.public_id, {
            secure: true,
            transformation: [{ width: 20, crop: "scale" }, { quality: 60 }, { format: "jpg" }]
        });

        const dataUrl = await toDataUrl(tinyUrl);
        return { url: upload.secure_url, dataUrl };
    } catch (error) {
        return { url: FALLBACK_IMAGE, dataUrl: '' };
    }
};

const ensureActorExists = async (tmdbActor, apiKey) => {
    try {
        // Fast Check: .lean() use kiya taaki query fast ho
        let actor = await Actor.findOne({ tmdbId: tmdbActor.id }).lean();
        if (actor) return actor;

        let details = {};
        try {
            const detailRes = await safeAxiosGet(`${TMDB_BASE_URL}/person/${tmdbActor.id}`, { api_key: apiKey });
            details = detailRes.data;
        } catch (err) {
            details = tmdbActor;
        }

        const imageData = await processImage(tmdbActor.profile_path, 'movies/actors', `actor_${tmdbActor.id}`);

        // New Actor Create Karo
        actor = await Actor.findOneAndUpdate(
            { tmdbId: tmdbActor.id },
            {
                tmdbId: tmdbActor.id,
                name: tmdbActor.name || 'Unknown',
                biography: details.biography || '',
                birthday: details.birthday,
                placeOfBirth: details.place_of_birth,
                knownForDepartment: tmdbActor.known_for_department,
                popularity: tmdbActor.popularity,
                profileImageUrl: imageData.url,
                profileDataUrl: imageData.dataUrl
            },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        return actor;
    } catch (error) {
        return null;
    }
};

exports.seedDatabase = async () => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) throw new Error('TMDB_API_KEY is missing');

    // WARNING: Cloudinary Wipe ko comment kar diya hai. 
    // Agar sab delete karna ho tabhi uncomment karein.
    // await cleanCloudinaryAccount();

    console.log('--- Starting Smart Seed (Target: 50 Pages / 1000 Movies) ---');

    let currentPage = 1;
    let totalPages = 5000; // TARGET 1000 MOVIES
    let totalMoviesSeeded = 0;

    while (currentPage <= totalPages) {
        try {
            console.log(`\n=== Processing Page ${currentPage} ===`);
            
            const response = await safeAxiosGet(`${TMDB_BASE_URL}/movie/popular`, { api_key: apiKey, page: currentPage });
            const movies = response.data.results;

            for (const movieData of movies) {
                
                // === SMART SYNC CHECK START ===
                const existingMovie = await Movie.findOne({ tmdbId: movieData.id }).lean();
                if (existingMovie) {
                    // Agar movie hai, to skip karo aur next iteration pe jao
                    console.log(`⏭️  Skipping: ${movieData.title.substring(0, 15)} (Exists)`);
                    continue; 
                }
                // === SMART SYNC CHECK END ===

                process.stdout.write(`Processing: ${movieData.title.substring(0, 15)}... `);

                try {
                    let credits;
                    try {
                        credits = await safeAxiosGet(`${TMDB_BASE_URL}/movie/${movieData.id}/credits`, { api_key: apiKey });
                    } catch (e) {
                        console.log('❌ (Skip: Credits API Failed)');
                        continue;
                    }

                    const crew = credits.data.crew;
                    const castRaw = credits.data.cast.slice(0, 6);
                    const director = crew.find(member => member.job === 'Director')?.name || 'Unknown';

                    const processedCast = [];
                    for (const castMember of castRaw) {
                        const actorDoc = await ensureActorExists(castMember, apiKey);
                        if (actorDoc) {
                            processedCast.push({
                                actorId: actorDoc._id,
                                name: castMember.original_name,
                                character: castMember.character,
                                profileImageUrl: actorDoc.profileImageUrl
                            });
                        }
                    }

                    const posterData = await processImage(movieData.poster_path, 'movies/posters', `poster_${movieData.id}`);
                    const backdropData = await processImage(movieData.backdrop_path, 'movies/backdrops', `backdrop_${movieData.id}`);

                    await Movie.create({ // create use kar rahe hain kyunki smart sync ne duplicate check kar liya hai
                        tmdbId: movieData.id,
                        title: movieData.title,
                        overview: movieData.overview,
                        releaseDate: movieData.release_date,
                        voteAverage: movieData.vote_average,
                        voteCount: movieData.vote_count,
                        director: director,
                        cast: processedCast,
                        posterImageUrl: posterData.url,
                        posterDataUrl: posterData.dataUrl,
                        backdropImageUrl: backdropData.url,
                        backdropDataUrl: backdropData.dataUrl
                    });

                    console.log(`✅`);
                    totalMoviesSeeded++;
                    
                    // Thoda rest taaki rate limit na ho
                    await sleep(2000);

                } catch (movieError) {
                    console.log(`❌ Failed!`);
                    console.error(movieError.message); 
                }
            }
            
            currentPage++;

        } catch (error) {
            console.log(`\n❌ CRITICAL PAGE ERROR:`);
            console.error(error.message);
            currentPage++;
        }
    }

    return totalMoviesSeeded;
};


exports.getTrailerKey = async (movieId) => {
    try {
        const movie = await Movie.findById(movieId);
        if (!movie) throw new Error("Movie not found");

        const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.tmdbId}/videos`, 
            { params: { api_key: process.env.TMDB_API_KEY } }
        );

        const trailer = response.data.results.find(
            vid => vid.site === 'YouTube' && vid.type === 'Trailer'
        );

        return trailer ? trailer.key : null;
    } catch (error) {
        console.error("Trailer Fetch Error:", error.message);
        return null;
    }
};
