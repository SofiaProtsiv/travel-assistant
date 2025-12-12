const db = require('../config/db');

const getCountriesWithCities = (req, res) => {
    const query = `
        SELECT c.id AS country_id, c.name AS country_name, c.capital_city_id, 
               ci.id AS city_id, ci.name AS city_name, ci.is_capital
        FROM countries c
        JOIN cities ci ON ci.country_id = c.id
        ORDER BY c.id, ci.id
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err });

        const countries = {};
        results.forEach(row => {
            if (!countries[row.country_id]) {
                countries[row.country_id] = {
                    id: row.country_id,
                    name: row.country_name,
                    cities: []
                };
            }
            countries[row.country_id].cities.push({
                id: row.city_id,
                name: row.city_name,
                is_capital: row.is_capital
            });
        });

        res.json(Object.values(countries));
    });
};

module.exports = { getCountriesWithCities };
