const express = require('express');
const router = express.Router();
const cityController = require('../controllers/citiesController');


router.get('/', cityController.getAllCities);               // GET /api/cities
router.get('/:id', cityController.getCity);                // GET /api/cities/:id
router.get('/:id/attractions', cityController.getAttractionsByCity); // GET /api/cities/:id/attractions

module.exports = router;
