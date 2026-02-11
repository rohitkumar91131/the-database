const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

router.get('/', actorController.getActors);
router.get('/:id', actorController.getActorById);

module.exports = router;