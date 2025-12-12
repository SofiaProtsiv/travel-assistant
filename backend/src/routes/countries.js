// backend/src/routes/countries.js
const express = require('express');
const router = express.Router();
const { getCountriesWithCities } = require('../controllers/countriesController');

router.get('/', getCountriesWithCities);

module.exports = router;
