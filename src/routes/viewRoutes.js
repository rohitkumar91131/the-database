const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const docsController = require('../controllers/docsController');

router.get('/', viewController.renderHome);
router.get('/movies', viewController.renderMovies);
router.get('/movies/:id', viewController.renderMovieDetail);
router.get('/docs', docsController.renderDocs);

module.exports = router;