const movieService = require('../services/movieService');

exports.renderHome = (req, res) => {
    res.render('index', { 
        title: 'GigaDB - Home',
        path: '/'
    });
};


exports.renderMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20; 
        const search = req.query.search || '';

        const data = await movieService.getAllMovies(page, limit, search);

        res.render('movies', { 
            title: 'NEXUS - Browse Movies', 
            path: '/movies',                
            movies: data.movies,            
            currentPage: data.page,         
            totalPages: data.pages,         
            search: search                  
        });

    } catch (error) {
        console.error("Render Error:", error);
        res.status(500).render('404', { title: 'Error', path: '' });
    }
};

exports.renderMovieDetail = async (req, res) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);
        
        if (!movie) {
            return res.status(404).render('404', { title: '404 Not Found', path: '' });
        }

        res.render('movieDetail', { 
            title: `${movie.title} - GigaDB`,
            path: '/movies',
            movie: movie
        });
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
};