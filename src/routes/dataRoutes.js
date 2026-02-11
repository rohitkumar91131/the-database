const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.post('/seed/movies', dataController.seedMovies);
router.post('/seed/actors', dataController.seedActors);

module.exports = router;