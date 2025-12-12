// backend/src/controllers/attractionsController.js
const db = require('../config/db');

const getAttractionsByCity = (req, res) => {
    const cityId = req.params.cityId;

    const query = `
        SELECT 
            id,
            name,
            description,
            lat,
            lng,
            ticket_price,
            transport_cost,
            avg_visit_time
        FROM attractions
        WHERE city_id = ?
        ORDER BY id
    `;

    db.query(query, [cityId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

module.exports = { getAttractionsByCity };
