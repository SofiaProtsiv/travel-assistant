const Trip = require('../models/Trip');

class TripsController {
  // Створити нову поїздку
  static async createTrip(req, res) {
    try {
      const userId = req.user.id; // з middleware автентифікації
      const { city_id, country_id, start_date, end_date, status } = req.body;
      
      // Валідація
      if (!city_id || !country_id) {
        return res.status(400).json({ error: 'city_id and country_id are required' });
      }
      
      const tripId = await Trip.create(userId, city_id, country_id, start_date, end_date, status);
      
      res.status(201).json({ 
        success: true, 
        message: 'Trip created successfully',
        tripId 
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Отримати всі поїздки користувача
  static async getUserTrips(req, res) {
    try {
      const userId = req.user.id;
      const trips = await Trip.findByUserId(userId);
      
      res.json({
        success: true,
        trips
      });
      
    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Отримати конкретну поїздку
  static async getTrip(req, res) {
    try {
      const userId = req.user.id;
      const tripId = req.params.id;
      
      const trip = await Trip.findById(tripId, userId);
      
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      // Отримуємо пам'ятки цієї поїздки
      const attractions = await Trip.getAttractions(tripId);
      
      res.json({
        success: true,
        trip: {
          ...trip,
          attractions
        }
      });
      
    } catch (error) {
      console.error('Get trip error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Оновити поїздку
  static async updateTrip(req, res) {
    try {
      const userId = req.user.id;
      const tripId = req.params.id;
      const updateData = req.body;
      
      const updated = await Trip.update(tripId, userId, updateData);
      
      if (!updated) {
        return res.status(404).json({ error: 'Trip not found or access denied' });
      }
      
      res.json({
        success: true,
        message: 'Trip updated successfully'
      });
      
    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Видалити поїздку
  static async deleteTrip(req, res) {
    try {
      const userId = req.user.id;
      const tripId = req.params.id;
      
      const deleted = await Trip.delete(tripId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Trip not found or access denied' });
      }
      
      res.json({
        success: true,
        message: 'Trip deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete trip error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Додати пам'ятку до поїздки
  static async addAttractionToTrip(req, res) {
    try {
      const userId = req.user.id;
      const tripId = req.params.tripId;
      const { attraction_id } = req.body;
      
      // Перевіряємо, чи поїздка належить користувачеві
      const trip = await Trip.findById(tripId, userId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or access denied' });
      }
      
      const added = await Trip.addAttraction(tripId, attraction_id);
      
      res.json({
        success: true,
        message: 'Attraction added to trip'
      });
      
    } catch (error) {
      console.error('Add attraction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Видалити пам'ятку з поїздки
  static async removeAttractionFromTrip(req, res) {
    try {
      const userId = req.user.id;
      const { tripId, attractionId } = req.params;
      
      const trip = await Trip.findById(tripId, userId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or access denied' });
      }
      
      const removed = await Trip.removeAttraction(tripId, attractionId);
      
      res.json({
        success: true,
        message: 'Attraction removed from trip'
      });
      
    } catch (error) {
      console.error('Remove attraction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Позначити пам'ятку як відвідану
  static async markAttractionVisited(req, res) {
    try {
      const userId = req.user.id;
      const { tripId, attractionId } = req.params;
      const { is_visited } = req.body;
      
      const trip = await Trip.findById(tripId, userId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found or access denied' });
      }
      
      const marked = await Trip.markAsVisited(tripId, attractionId, is_visited ? 1 : 0);
      
      res.json({
        success: true,
        message: is_visited ? 'Attraction marked as visited' : 'Attraction marked as not visited'
      });
      
    } catch (error) {
      console.error('Mark visited error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = TripsController;