const db = require('../config/db');

const calculatePlanBudget = (req, res) => {
    try {
        let { cityId, places, days } = req.query;

        if (!cityId) {
            return res.json({ attractions: 0, housing: 0, total: 0 });
        }

        cityId = parseInt(cityId, 10);
        days = parseInt(days || 1, 10);

        let ids = [];
        if (places) {
            try {
                if (places.startsWith('[')) {
                    ids = JSON.parse(places);
                } else {
                    ids = places.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
                }
            } catch (e) {
                ids = [];
            }
        }

        db.query('SELECT avg_hotel_price FROM cities WHERE id = ?', [cityId], (err, cityResult) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!cityResult.length) {
                return res.status(404).json({ error: 'City not found' });
            }

            const hotelPrice = parseFloat(cityResult[0].avg_hotel_price || 40);
            const housing = hotelPrice * days;

            if (ids.length === 0) {
                return res.json({ 
                    attractions: 0, 
                    housing: parseFloat(housing.toFixed(2)),
                    total: parseFloat(housing.toFixed(2))
                });
            }

            const placeholders = ids.map(() => '?').join(',');
            const sql = `
                SELECT COALESCE(SUM(ticket_price + transport_cost), 0) AS attractions_total
                FROM attractions
                WHERE city_id = ? AND id IN (${placeholders})
            `;

            db.query(sql, [cityId, ...ids], (err2, result) => {
                if (err2) {
                    return res.status(500).json({ error: 'Database error' });
                }

                const attractions = parseFloat(result[0].attractions_total) || 0;
                const total = attractions + housing;

                res.json({ 
                    attractions: parseFloat(attractions.toFixed(2)),
                    housing: parseFloat(housing.toFixed(2)),
                    total: parseFloat(total.toFixed(2))
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { calculatePlanBudget };
