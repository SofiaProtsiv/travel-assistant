// backend/src/routes/attractions.js
const express = require('express');
const router = express.Router();
const { getAttractionsByCity } = require('../controllers/attractionsController');

router.get('/:cityId', getAttractionsByCity);

module.exports = router;
