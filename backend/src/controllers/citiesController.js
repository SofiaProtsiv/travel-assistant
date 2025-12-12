const db = require('../config/db');

exports.getAllCities = (req, res) => {
    const { countryId } = req.query;
    let sql = "SELECT id, country_id, name, is_capital, lat, lng, avg_hotel_price FROM cities";
    let params = [];
    
    if (countryId && countryId !== 'undefined' && countryId !== 'null') {
        const parsedId = parseInt(countryId);
        if (!isNaN(parsedId)) {
            sql += " WHERE country_id = ?";
            params.push(parsedId);
        }
    }
    
    db.query(sql, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results || []);
    });
};

exports.getCity = (req, res) => {
    const cityId = parseInt(req.params.id);
    
    if (isNaN(cityId)) {
        return res.status(400).json({ error: "Invalid city ID" });
    }
    
    const sql = "SELECT id, country_id, name, is_capital, lat, lng, avg_hotel_price FROM cities WHERE id = ?";
    
    db.query(sql, [cityId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "City not found" });
        }
        
        res.json(results[0]);
    });
};

exports.getAttractionsByCity = (req, res) => {
    const cityId = parseInt(req.params.id);
    
    if (isNaN(cityId)) {
        return res.status(400).json({ error: "Invalid city ID" });
    }
    
    const sql = `
        SELECT id, name, description, lat, lng, ticket_price, transport_cost, avg_visit_time 
        FROM attractions WHERE city_id = ?
    `;
    
    db.query(sql, [cityId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json(results || []);
    });
};
