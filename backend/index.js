const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require('jsonwebtoken'); // Додати цей імпорт
const db = require("./src/config/db");

const app = express();

// JWT секретний ключ
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key-for-trunnn";

app.use(cors());
app.use(express.json());

// Глобальний middleware для логування запитів (опціонально)
app.use((req, res, next) => {
    next();
});

// Middleware для перевірки JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Токен доступу відсутній',
            error: 'Unauthorized'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ 
                success: false, 
                message: 'Токен недійсний або прострочений',
                error: 'Invalid token'
            });
        }
        req.user = user;
        next();
    });
};

const citiesRoutes = require("./src/routes/cities");
const countriesRoutes = require("./src/routes/countries");
const authRoutes = require("./src/routes/auth");
const budgetRoutes = require("./src/routes/budgetRoutes");

app.use("/api/cities", citiesRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", budgetRoutes);

// Створюємо маршрути для trips
const tripsRouter = express.Router();

// Middleware для trips - використовуємо глобальну функцію автентифікації
tripsRouter.use(authenticateToken);

// Маршрути для trips
tripsRouter.post("/", (req, res) => {
    const { city_id, country_id, start_date, end_date, status = 'planned', attractions = [] } = req.body;
    const user_id = req.user.id;
    
    if (!city_id || !country_id) {
        return res.status(400).json({ success: false, error: "city_id та country_id обов'язкові" });
    }
    
    const insertTripSql = `INSERT INTO trips (user_id, city_id, country_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(insertTripSql, [user_id, city_id, country_id, start_date, end_date, status], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних", details: err.message });
        }
        
        const tripId = result.insertId;
        
        if (attractions && attractions.length > 0) {
            const values = attractions.map(att => [tripId, att.id, att.day || 1, att.order || 0]);
            const attractionsSql = `INSERT INTO trip_attractions (trip_id, attraction_id, day_number, visit_order) VALUES ?`;
            
            db.query(attractionsSql, [values], (attErr) => {
                if (attErr) {
                    // Silently handle attraction addition errors
                }
                res.json({ success: true, message: "Поїздку створено з пам'ятками", tripId: tripId });
            });
        } else {
            res.json({ success: true, message: "Поїздку створено", tripId: tripId });
        }
    });
});

tripsRouter.get("/", (req, res) => {
    const user_id = req.user ? req.user.id : null;
    
    if (!user_id) {
        return res.status(401).json({ 
            success: false, 
            error: "Необхідна автентифікація" 
        });
    }
    
    const sql = `
        SELECT t.*, c.name as city_name, c.lat as city_lat, c.lng as city_lng, co.name as country_name,
               (SELECT COUNT(*) FROM trip_attractions ta WHERE ta.trip_id = t.id) as attractions_count,
               (SELECT COUNT(*) FROM trip_attractions ta WHERE ta.trip_id = t.id AND ta.is_visited = 1) as visited_count
        FROM trips t
        JOIN cities c ON t.city_id = c.id
        JOIN countries co ON t.country_id = co.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    `;
    
    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                error: "Помилка бази даних" 
            });
        }
        res.json({ success: true, trips: results || [] });
    });
});

tripsRouter.get("/:id", (req, res) => {
    const tripId = parseInt(req.params.id);
    const user_id = req.user.id;
    
    if (isNaN(tripId)) {
        return res.status(400).json({ success: false, error: "Невірний ID поїздки" });
    }
    
    const tripSql = `
        SELECT t.*, c.name as city_name, c.lat as city_lat, c.lng as city_lng, c.avg_hotel_price, co.name as country_name
        FROM trips t
        LEFT JOIN cities c ON t.city_id = c.id
        LEFT JOIN countries co ON t.country_id = co.id
        WHERE t.id = ? AND t.user_id = ?
    `;
    
    db.query(tripSql, [tripId, user_id], (err, tripResults) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних" });
        }
        
        if (tripResults.length === 0) {
            return res.status(404).json({ success: false, error: "Поїздку не знайдено" });
        }
        
        const trip = tripResults[0];
        
        const attractionsSql = `
            SELECT ta.id, ta.trip_id, ta.attraction_id, ta.is_visited, ta.day_number, ta.visit_order,
                   a.name, a.description, a.lat, a.lng, a.ticket_price, a.transport_cost, a.avg_visit_time
            FROM trip_attractions ta
            JOIN attractions a ON ta.attraction_id = a.id
            WHERE ta.trip_id = ?
            ORDER BY ta.day_number, ta.visit_order
        `;
        
        db.query(attractionsSql, [tripId], (err2, attractionsResults) => {
            if (err2) {
                return res.status(500).json({ success: false, error: "Помилка бази даних" });
            }
            
            const attractionsByDay = {};
            attractionsResults.forEach(attraction => {
                const day = attraction.day_number || 1;
                if (!attractionsByDay[day]) {
                    attractionsByDay[day] = [];
                }
                attractionsByDay[day].push(attraction);
            });
            
            res.json({
                success: true,
                trip: { ...trip, attractions: attractionsByDay }
            });
        });
    });
});

tripsRouter.post("/:tripId/attractions", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const { attraction_id, day_number = 1, visit_order } = req.body;
    const user_id = req.user.id;
    
    if (!attraction_id) {
        return res.status(400).json({ error: "attraction_id обов'язковий" });
    }
    
    const checkSql = "SELECT id FROM trips WHERE id = ? AND user_id = ?";
    db.query(checkSql, [tripId, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Помилка бази даних" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Поїздку не знайдено" });
        }
        
        const insertSql = `
            INSERT INTO trip_attractions (trip_id, attraction_id, day_number, visit_order) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE day_number = VALUES(day_number), visit_order = VALUES(visit_order)
        `;
        
        db.query(insertSql, [tripId, attraction_id, day_number, visit_order], (err2, result) => {
            if (err2) {
                return res.status(500).json({ error: "Помилка бази даних" });
            }
            res.json({ success: true, message: "Пам'ятку додано до поїздки" });
        });
    });
});

tripsRouter.delete("/:tripId/attractions/:attractionId", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const attractionId = parseInt(req.params.attractionId);
    const user_id = req.user.id;
    
    const checkSql = "SELECT id FROM trips WHERE id = ? AND user_id = ?";
    db.query(checkSql, [tripId, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Помилка бази даних" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Поїздку не знайдено" });
        }
        
        const deleteSql = "DELETE FROM trip_attractions WHERE trip_id = ? AND attraction_id = ?";
        
        db.query(deleteSql, [tripId, attractionId], (err2, result) => {
            if (err2) {
                return res.status(500).json({ error: "Помилка бази даних" });
            }
            res.json({ success: true, message: "Пам'ятку видалено з поїздки" });
        });
    });
});

tripsRouter.patch("/:tripId/attractions/:attractionId/visited", (req, res) => {
    const tripId = parseInt(req.params.tripId);
    const attractionId = parseInt(req.params.attractionId);
    const { is_visited } = req.body;
    const user_id = req.user.id;
    
    const checkSql = "SELECT id FROM trips WHERE id = ? AND user_id = ?";
    db.query(checkSql, [tripId, user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Помилка бази даних" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: "Поїздку не знайдено" });
        }
        
        const updateSql = `UPDATE trip_attractions SET is_visited = ? WHERE trip_id = ? AND attraction_id = ?`;
        
        db.query(updateSql, [is_visited ? 1 : 0, tripId, attractionId], (err2, result) => {
            if (err2) {
                return res.status(500).json({ error: "Помилка бази даних" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Пам'ятку не знайдено в поїздці" });
            }
            
            res.json({
                success: true,
                message: is_visited ? "Пам'ятку позначено як відвідану" : "Пам'ятку позначено як невідвідану"
            });
        });
    });
});

tripsRouter.patch("/:id/status", (req, res) => {
    const tripId = parseInt(req.params.id);
    const { status } = req.body;
    const user_id = req.user.id;
    
    if (!status || !['planned', 'active', 'finished'].includes(status)) {
        return res.status(400).json({ success: false, error: "Невірний статус" });
    }
    
    const sql = "UPDATE trips SET status = ? WHERE id = ? AND user_id = ?";
    
    db.query(sql, [status, tripId, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Поїздку не знайдено" });
        }
        
        if (status === 'finished') {
            const updateAttractionsSql = "UPDATE trip_attractions SET is_visited = 1 WHERE trip_id = ?";
            db.query(updateAttractionsSql, [tripId], (updateErr) => {
                if (updateErr) {
                    // Silently handle update errors
                }
                res.json({ success: true, message: "Статус оновлено" });
            });
        } else {
            res.json({ success: true, message: "Статус оновлено" });
        }
    });
});

tripsRouter.delete("/:id", (req, res) => {
    const tripId = parseInt(req.params.id);
    const user_id = req.user.id;
    
    const deleteSql = "DELETE FROM trips WHERE id = ? AND user_id = ?";
    
    db.query(deleteSql, [tripId, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Помилка бази даних" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Поїздку не знайдено" });
        }
        
        res.json({ success: true, message: "Поїздку видалено" });
    });
});

// Підключаємо маршрути для trips
app.use("/api/trips", tripsRouter);

// Інші маршрути залишаються без змін
app.get("/api/cities/:id/details", (req, res) => {
    const cityId = parseInt(req.params.id);
    
    if (isNaN(cityId)) {
        return res.status(400).json({ success: false, error: "Невірний ID міста" });
    }
    
    const sql = `
        SELECT c.*, co.name as country_name, co.id as country_id,
               COUNT(a.id) as attractions_count,
               AVG(a.ticket_price) as avg_ticket_price,
               AVG(a.transport_cost) as avg_transport_cost
        FROM cities c
        JOIN countries co ON c.country_id = co.id
        LEFT JOIN attractions a ON c.id = a.city_id
        WHERE c.id = ?
        GROUP BY c.id, co.name, co.id
    `;
    
    db.query(sql, [cityId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних", details: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ success: false, error: "Місто не знайдено" });
        }
        
        const city = results[0];
        const response = {
            success: true,
            city: {
                id: city.id,
                name: city.name,
                country_id: city.country_id,
                country_name: city.country_name,
                description: city.description,
                is_capital: city.is_capital,
                lat: city.lat,
                lng: city.lng,
                avg_hotel_price: parseFloat(city.avg_hotel_price) || 40.00,
                budget_tier: city.budget_tier || 'medium',
                daily_costs: {
                    accommodation: parseFloat(city.accommodation_cost) || 60.00,
                    food: parseFloat(city.food_cost) || 30.00,
                    transport: parseFloat(city.transport_cost) || 10.00,
                    attractions: parseFloat(city.attraction_cost) || 15.00,
                    shopping: parseFloat(city.shopping_cost) || 40.00
                },
                scores: {
                    safety: parseInt(city.safety_score) || 70,
                    food_quality: parseInt(city.food_quality_score) || 60,
                    public_transport: parseInt(city.public_transport_score) || 65,
                    popularity: parseInt(city.popularity_score) || 50,
                    nightlife: parseInt(city.nightlife_score) || 55,
                    family_friendly: parseInt(city.family_friendly_score) || 60
                },
                attractions_info: {
                    count: parseInt(city.attractions_count) || 0,
                    avg_ticket_price: parseFloat(city.avg_ticket_price) || 0,
                    avg_transport_cost: parseFloat(city.avg_transport_cost) || 0
                },
                calculated_scores: {
                    total_score: Math.round(
                        (parseInt(city.safety_score) || 70) * 0.3 +
                        (parseInt(city.food_quality_score) || 60) * 0.2 +
                        (parseInt(city.public_transport_score) || 65) * 0.2 +
                        (parseInt(city.popularity_score) || 50) * 0.3
                    ),
                    budget_level: city.budget_tier === 'luxury' ? 'Високий' : 
                                 city.budget_tier === 'budget' ? 'Бюджетний' : 'Середній'
                }
            }
        };
        
        res.json(response);
    });
});

app.patch('/api/trips/:id/visited-count', async (req, res) => {
    try {
        const { id } = req.params;
        const { visited_count } = req.body;
        
        // Оновлюємо visited_count в базі даних
        const query = 'UPDATE trips SET visited_count = ? WHERE id = ?';
        connection.query(query, [visited_count, id], (error) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Visited count updated',
                visited_count: visited_count
            });
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get("/api/cities/:id/full-details", (req, res) => {
    const cityId = parseInt(req.params.id);
    
    if (isNaN(cityId)) {
        return res.status(400).json({ success: false, error: "Невірний ID міста" });
    }
    
    const citySql = `
        SELECT c.*, co.name as country_name, co.id as country_id
        FROM cities c
        JOIN countries co ON c.country_id = co.id
        WHERE c.id = ?
    `;
    
    db.query(citySql, [cityId], (err, cityResults) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних" });
        }
        
        if (cityResults.length === 0) {
            return res.status(404).json({ success: false, error: "Місто не знайдено" });
        }
        
        const city = cityResults[0];
        
        const attractionsSql = `
            SELECT id, name, description, lat, lng, ticket_price, transport_cost, avg_visit_time
            FROM attractions WHERE city_id = ? ORDER BY name
        `;
        
        db.query(attractionsSql, [cityId], (err2, attractionsResults) => {
            if (err2) {
                return res.status(500).json({ success: false, error: "Помилка бази даних" });
            }
            
            const totalAttractionCost = attractionsResults.reduce((sum, att) => 
                sum + (parseFloat(att.ticket_price) || 0) + (parseFloat(att.transport_cost) || 0), 0);
            
            const avgAttractionCost = attractionsResults.length > 0 
                ? totalAttractionCost / attractionsResults.length 
                : parseFloat(city.attraction_cost) || 15.00;
            
            const response = {
                success: true,
                city: {
                    id: city.id,
                    name: city.name,
                    country_id: city.country_id,
                    country_name: city.country_name,
                    description: city.description,
                    is_capital: city.is_capital,
                    lat: city.lat,
                    lng: city.lng,
                    budget_data: {
                        tier: city.budget_tier || 'medium',
                        accommodation_per_day: parseFloat(city.accommodation_cost) || 60.00,
                        food_per_day: parseFloat(city.food_cost) || 30.00,
                        transport_per_day: parseFloat(city.transport_cost) || 10.00,
                        attraction_avg_cost: avgAttractionCost,
                        shopping_per_trip: parseFloat(city.shopping_cost) || 40.00,
                        avg_hotel_price: parseFloat(city.avg_hotel_price) || 40.00
                    },
                    ratings: {
                        safety: parseInt(city.safety_score) || 70,
                        food_quality: parseInt(city.food_quality_score) || 60,
                        transport: parseInt(city.public_transport_score) || 65,
                        popularity: parseInt(city.popularity_score) || 50,
                        nightlife: parseInt(city.nightlife_score) || 55,
                        family_friendly: parseInt(city.family_friendly_score) || 60
                    },
                    status: {
                        overall: calculateCityStatus(city),
                        description: getCityStatusDescription(city)
                    }
                },
                attractions: attractionsResults.map(attraction => ({
                    id: attraction.id,
                    name: attraction.name,
                    description: attraction.description,
                    lat: attraction.lat,
                    lng: attraction.lng,
                    costs: {
                        ticket: parseFloat(attraction.ticket_price) || 0,
                        transport: parseFloat(attraction.transport_cost) || 0,
                        total: (parseFloat(attraction.ticket_price) || 0) + (parseFloat(attraction.transport_cost) || 0)
                    },
                    visit_time: parseInt(attraction.avg_visit_time) || 60,
                    category: determineAttractionCategory(attraction.name, attraction.description)
                })),
                statistics: {
                    total_attractions: attractionsResults.length,
                    avg_attraction_cost: avgAttractionCost,
                    total_daily_cost: (parseFloat(city.accommodation_cost) || 60.00) + 
                                     (parseFloat(city.food_cost) || 30.00) + 
                                     (parseFloat(city.transport_cost) || 10.00)
                }
            };
            
            res.json(response);
        });
    });
});

app.post("/api/trips/with-budget", async (req, res) => {
    const { user_id, city_id, country_id, start_date, end_date, total_budget, budget_details, recommended_plan, attractions_count } = req.body;
    
    if (!city_id || !country_id || !user_id) {
        return res.status(400).json({ success: false, error: "Обов'язкові поля відсутні" });
    }
    
    try {
        const [result] = await db.promise().query(`
            INSERT INTO trips (user_id, city_id, country_id, start_date, end_date, total_budget, budget_details, recommended_plan, attractions_count, status, visited_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', 0)
        `, [user_id, city_id, country_id, start_date, end_date, total_budget, JSON.stringify(budget_details), JSON.stringify(recommended_plan), attractions_count || 0]);
        
        const tripId = result.insertId;
        
        const [attractions] = await db.promise().query(`SELECT id FROM attractions WHERE city_id = ?`, [city_id]);
        
        if (attractions.length > 0) {
            const attractionsToAdd = attractions.slice(0, Math.min(attractions_count || 5, attractions.length));
            
            const dayCount = Array.isArray(recommended_plan) && recommended_plan.length > 0
                ? recommended_plan.length
                : 1;
            const perDay = Math.max(1, Math.ceil(attractionsToAdd.length / dayCount));

            const attractionValues = attractionsToAdd.map((att, index) => {
                const dayNumber = Math.min(dayCount, Math.floor(index / perDay) + 1);
                return [tripId, att.id, dayNumber, index];
            });
            
            if (attractionValues.length > 0) {
                await db.promise().query(`
                    INSERT INTO trip_attractions (trip_id, attraction_id, day_number, visit_order) VALUES ?
                `, [attractionValues]);
            }
        }
        
        res.json({
            success: true,
            message: "Поїздку з бюджетом збережено",
            trip: { id: tripId, city_id, total_budget, attractions_count: attractions_count || 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Помилка бази даних", details: error.message });
    }
});

app.post("/api/plan-budget/calculate", (req, res) => {
    const { city_id, days = 1, attraction_ids = [], budget_tier = 'medium' } = req.body;
    
    if (!city_id) {
        return res.status(400).json({ success: false, error: "city_id обов'язковий" });
    }
    
    const parsedCityId = parseInt(city_id);
    const parsedDays = parseInt(days);
    
    if (isNaN(parsedCityId) || isNaN(parsedDays)) {
        return res.status(400).json({ success: false, error: "Невірні параметри" });
    }
    
    const citySql = `
        SELECT accommodation_cost, food_cost, transport_cost, attraction_cost, shopping_cost, budget_tier as city_budget_tier
        FROM cities WHERE id = ?
    `;
    
    db.query(citySql, [parsedCityId], (err, cityResults) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Помилка бази даних" });
        }
        
        if (cityResults.length === 0) {
            return res.status(404).json({ success: false, error: "Місто не знайдено" });
        }
        
        const cityData = cityResults[0];
        const budgetMultipliers = { 'budget': 0.7, 'medium': 1.0, 'luxury': 1.5 };
        const multiplier = budgetMultipliers[budget_tier] || 1.0;
        const cityMultiplier = budgetMultipliers[cityData.city_budget_tier] || 1.0;
        const finalMultiplier = multiplier * cityMultiplier;
        
        const baseCosts = {
            accommodation: parseFloat(cityData.accommodation_cost) * parsedDays,
            food: parseFloat(cityData.food_cost) * parsedDays,
            transport: parseFloat(cityData.transport_cost) * parsedDays,
            shopping: parseFloat(cityData.shopping_cost)
        };
        
        let attractionsCost = 0;
        
        if (attraction_ids && attraction_ids.length > 0) {
            const placeholders = attraction_ids.map(() => '?').join(',');
            const attractionsSql = `
                SELECT COALESCE(SUM(ticket_price + transport_cost), 0) AS total_cost
                FROM attractions WHERE city_id = ? AND id IN (${placeholders})
            `;
            
            db.query(attractionsSql, [parsedCityId, ...attraction_ids], (err2, attResults) => {
                if (err2) {
                    return res.status(500).json({ success: false, error: "Помилка бази даних" });
                }
                
                attractionsCost = parseFloat(attResults[0].total_cost) || 
                                 (parseFloat(cityData.attraction_cost) * Math.max(attraction_ids.length, 1));
                
                const finalBudget = calculateFinalBudget(baseCosts, attractionsCost, finalMultiplier);
                
                res.json({
                    success: true,
                    budget: finalBudget,
                    details: {
                        city_id: parsedCityId,
                        days: parsedDays,
                        attraction_count: attraction_ids.length,
                        budget_tier: budget_tier,
                        city_budget_tier: cityData.city_budget_tier,
                        multiplier: finalMultiplier
                    }
                });
            });
        } else {
            attractionsCost = parseFloat(cityData.attraction_cost) * 3;
            const finalBudget = calculateFinalBudget(baseCosts, attractionsCost, finalMultiplier);
            
            res.json({
                success: true,
                budget: finalBudget,
                details: {
                    city_id: parsedCityId,
                    days: parsedDays,
                    attraction_count: 0,
                    budget_tier: budget_tier,
                    city_budget_tier: cityData.city_budget_tier,
                    multiplier: finalMultiplier
                }
            });
        }
    });
});

app.get("/api/attractions", (req, res) => {
    const sql = `
        SELECT a.id, a.name, a.city_id, c.name as city_name, a.ticket_price, a.transport_cost
        FROM attractions a
        LEFT JOIN cities c ON a.city_id = c.id
        LIMIT 50
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Помилка бази даних" });
        }
        res.json(results || []);
    });
});


// В auth роутах (або в index.js)
app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Необхідна автентифікація' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Отримуємо дані користувача з БД
        db.query(
            "SELECT id, email, name, created_at FROM users WHERE id = ?",
            [decoded.id],
            (err, results) => {
                if (err || results.length === 0) {
                    return res.status(404).json({ success: false, error: 'Користувача не знайдено' });
                }
                
                res.json({
                    success: true,
                    user: results[0]
                });
            }
        );
    } catch (error) {
        res.status(401).json({ success: false, error: 'Недійсний токен' });
    }
});

// Допоміжні функції
function calculateCityStatus(cityData) {
    if (!cityData) return "Середній";
    
    const scores = {
        safety: parseInt(cityData.safety_score) || 70,
        food: parseInt(cityData.food_quality_score) || 60,
        transport: parseInt(cityData.public_transport_score) || 65,
        popularity: parseInt(cityData.popularity_score) || 50
    };
    
    const avgScore = (scores.safety + scores.food + scores.transport + scores.popularity) / 4;
    
    if (avgScore >= 80) return "Високий";
    if (avgScore >= 60) return "Середній";
    return "Бюджетний";
}

function getCityStatusDescription(cityData) {
    const status = calculateCityStatus(cityData);
    const tier = cityData.budget_tier || 'medium';
    
    const descriptions = {
        'Високий': 'Популярне туристичне місто з розвиненою інфраструктурою',
        'Середній': 'Збалансоване місто для подорожей з гарним співвідношенням ціна/якість',
        'Бюджетний': 'Економічний варіант для подорожей'
    };
    
    const budgetText = tier === 'luxury' ? 'високий бюджет' : 
                      tier === 'budget' ? 'низький бюджет' : 'середній бюджет';
    
    return `${descriptions[status]}. Рекомендовано для подорожей з ${budgetText}.`;
}

function determineAttractionCategory(name, description) {
    const nameLower = name.toLowerCase();
    const descLower = description ? description.toLowerCase() : '';
    
    if (nameLower.includes('музей') || nameLower.includes('museum') || 
        descLower.includes('музей') || descLower.includes('museum') ||
        nameLower.includes('галерея') || nameLower.includes('gallery')) {
        return 'museum';
    }
    
    if (nameLower.includes('собор') || nameLower.includes('церква') || nameLower.includes('храм') || 
        nameLower.includes('cathedral') || nameLower.includes('church') || nameLower.includes('temple') ||
        descLower.includes('релігійний') || descLower.includes('religious')) {
        return 'religious';
    }
    
    if (nameLower.includes('парк') || nameLower.includes('сад') || 
        nameLower.includes('park') || nameLower.includes('garden')) {
        return 'park';
    }
    
    if (nameLower.includes('палац') || nameLower.includes('замок') || 
        nameLower.includes('palace') || nameLower.includes('castle')) {
        return 'castle';
    }
    
    if (nameLower.includes('площа') || nameLower.includes('вулиця') || nameLower.includes('проспект') ||
        nameLower.includes('square') || nameLower.includes('street') || nameLower.includes('avenue')) {
        return 'square';
    }
    
    if (nameLower.includes('вежа') || nameLower.includes('tower') || 
        nameLower.includes('монумент') || nameLower.includes('monument')) {
        return 'monument';
    }
    
    return 'landmark';
}

function calculateFinalBudget(baseCosts, attractionsCost, multiplier) {
    const baseTotal = baseCosts.accommodation + baseCosts.food + 
                     baseCosts.transport + baseCosts.shopping + attractionsCost;
    
    const total = baseTotal * multiplier;
    
    return {
        total: Math.round(total * 100) / 100,
        breakdown: {
            accommodation: Math.round(baseCosts.accommodation * multiplier * 100) / 100,
            food: Math.round(baseCosts.food * multiplier * 100) / 100,
            transport: Math.round(baseCosts.transport * multiplier * 100) / 100,
            attractions: Math.round(attractionsCost * multiplier * 100) / 100,
            shopping: Math.round(baseCosts.shopping * multiplier * 100) / 100
        },
        base_costs: baseCosts,
        multiplier: multiplier
    };
}

// Обробка помилок
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не знайдено" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
});

// У вашому server.js або app.js
app.get('/api/validate-token', authenticateToken, (req, res) => {
    res.json({ 
        success: true, 
        message: 'Token is valid',
        user: req.user 
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
});