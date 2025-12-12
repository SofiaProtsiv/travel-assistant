/**
 * Trip Model
 * Handles database operations for trips and trip_attractions tables
 */
const db = require('../config/db');

class Trip {
  /**
   * Creates a new trip
   */
  static async create(userId, cityId, countryId, startDate, endDate, status = 'planned') {
    const sql = `
      INSERT INTO trips (user_id, city_id, country_id, start_date, end_date, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.promise().query(sql, [userId, cityId, countryId, startDate, endDate, status]);
    return result.insertId;
  }

  /**
   * Retrieves all trips for a user
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT t.*, c.name as city_name, co.name as country_name 
      FROM trips t
      LEFT JOIN cities c ON t.city_id = c.id
      LEFT JOIN countries co ON t.country_id = co.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    const [rows] = await db.promise().query(sql, [userId]);
    return rows;
  }

  /**
   * Retrieves a specific trip by ID
   */
  static async findById(tripId, userId) {
    const sql = `
      SELECT t.*, c.name as city_name, co.name as country_name 
      FROM trips t
      LEFT JOIN cities c ON t.city_id = c.id
      LEFT JOIN countries co ON t.country_id = co.id
      WHERE t.id = ? AND t.user_id = ?
    `;
    const [rows] = await db.promise().query(sql, [tripId, userId]);
    return rows[0];
  }

  /**
   * Updates trip data
   */
  static async update(tripId, userId, data) {
    const fields = [];
    const values = [];
    
    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });
    
    values.push(tripId, userId);
    const sql = `UPDATE trips SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    const [result] = await db.promise().query(sql, values);
    return result.affectedRows > 0;
  }

  /**
   * Deletes a trip
   */
  static async delete(tripId, userId) {
    const sql = 'DELETE FROM trips WHERE id = ? AND user_id = ?';
    const [result] = await db.promise().query(sql, [tripId, userId]);
    return result.affectedRows > 0;
  }

  /**
   * Adds an attraction to a trip
   */
  static async addAttraction(tripId, attractionId) {
    const sql = `
      INSERT INTO trip_attractions (trip_id, attraction_id, is_visited) 
      VALUES (?, ?, 0)
      ON DUPLICATE KEY UPDATE is_visited = VALUES(is_visited)
    `;
    const [result] = await db.promise().query(sql, [tripId, attractionId]);
    return result.affectedRows > 0;
  }

  /**
   * Retrieves all attractions for a trip
   */
  static async getAttractions(tripId) {
    const sql = `
      SELECT ta.*, a.name, a.description, a.ticket_price, a.transport_cost, a.lat, a.lng
      FROM trip_attractions ta
      JOIN attractions a ON ta.attraction_id = a.id
      WHERE ta.trip_id = ?
    `;
    const [rows] = await db.promise().query(sql, [tripId]);
    return rows;
  }

  /**
   * Removes an attraction from a trip
   */
  static async removeAttraction(tripId, attractionId) {
    const sql = 'DELETE FROM trip_attractions WHERE trip_id = ? AND attraction_id = ?';
    const [result] = await db.promise().query(sql, [tripId, attractionId]);
    return result.affectedRows > 0;
  }

  /**
   * Marks an attraction as visited or not visited
   */
  static async markAsVisited(tripId, attractionId, isVisited = 1) {
    const sql = 'UPDATE trip_attractions SET is_visited = ? WHERE trip_id = ? AND attraction_id = ?';
    const [result] = await db.promise().query(sql, [isVisited, tripId, attractionId]);
    return result.affectedRows > 0;
  }
}

module.exports = Trip;