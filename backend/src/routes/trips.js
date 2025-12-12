const express = require('express');
const router = express.Router();
const TripsController = require('../controllers/tripsController');
const authMiddleware = require('../middleware/auth'); // Потрібен middleware автентифікації

// Застосувати middleware автентифікації до всіх маршрутів
router.use(authMiddleware);

// Основні маршрути для поїздок
router.post('/', TripsController.createTrip);
router.get('/', TripsController.getUserTrips);
router.get('/:id', TripsController.getTrip);
router.put('/:id', TripsController.updateTrip);
router.delete('/:id', TripsController.deleteTrip);

// Маршрути для роботи з пам'ятками в поїздках
router.post('/:tripId/attractions', TripsController.addAttractionToTrip);
router.delete('/:tripId/attractions/:attractionId', TripsController.removeAttractionFromTrip);
router.patch('/:tripId/attractions/:attractionId/visited', TripsController.markAttractionVisited);

module.exports = router;