// backend/index.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Детальне логування
app.use((req, res, next) => {
    console.log('='.repeat(60));
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    console.log('📋 Query:', req.query);
    console.log('='.repeat(60));
    next();
});

// Підключення до бази даних
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "34pro100",
    database: "travel",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Тестування підключення до БД
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ ПОМИЛКА підключення до MySQL:");
        console.error("Повідомлення:", err.message);
        console.error("Код помилки:", err.code);
        console.error("\n📌 Що перевірити:");
        console.error("1. Чи запущений XAMPP (MySQL має бути зелений)");
        console.error("2. Пароль: 34pro100");
        console.error("3. База даних 'travel' існує");
        console.error("4. Користувач 'root' має доступ");
        
        // Пропонуємо перевірити через phpMyAdmin
        console.error("\n🔧 Перевірка:");
        console.error("- Відкрий http://localhost/phpmyadmin");
        console.error("- Увійди з root/34pro100");
        console.error("- Переконайся, що база 'travel' існує");
    } else {
        console.log("✅ Успішно підключено до MySQL бази 'travel'");
        
        // Перевіримо таблиці
        connection.query("SHOW TABLES", (err, tables) => {
            if (err) {
                console.error("❌ Не вдалося отримати список таблиць:", err.message);
            } else {
                console.log("📊 Таблиці в базі 'travel':");
                tables.forEach((table, i) => {
                    console.log(`  ${i + 1}. ${table[Object.keys(table)[0]]}`);
                });
            }
            connection.release();
        });
    }
});

// Простий тестовий маршрут (без БД)
app.get("/api/test", (req, res) => {
    console.log("✅ Тестовий маршрут викликано");
    res.json({ 
        message: "Сервер працює! ✅", 
        timestamp: new Date().toISOString(),
        database: "travel"
    });
});

// Спрощений budget endpoint БЕЗ бази даних
app.get("/api/plan-budget", (req, res) => {
    console.log("💰 Budget API called with:", req.query);
    
    const { cityId, places, days = 1 } = req.query;
    
    // Спрощена логіка БЕЗ запитів до БД
    const attractions = places ? 125.50 : 0;
    const housing = 75.25 * parseInt(days);
    const total = attractions + housing;
    
    res.json({
        success: true,
        attractions: attractions.toFixed(2),
        housing: housing.toFixed(2),
        total: total.toFixed(2),
        debug: {
            server: "Main Server (port 3000)",
            cityId: cityId,
            places: places,
            days: days,
            note: "Це тестові дані без запитів до БД"
        }
    });
});

// Спробуємо завантажити роутери з папки src/
try {
    console.log("\n🔍 Завантаження маршрутів з src/...");
    
    // Завантажуємо по одному з обробкою помилок
    try {
        const authRoutes = require("./src/routes/auth");
        app.use("/api/auth", authRoutes);
        console.log("✅ Завантажено auth routes");
    } catch (e) {
        console.log("⚠️ Auth routes не завантажено:", e.message);
    }
    
    try {
        const countriesRouter = require("./src/routes/countries");
        app.use("/api/countries", countriesRouter);
        console.log("✅ Завантажено countries routes");
    } catch (e) {
        console.log("⚠️ Countries routes не завантажено:", e.message);
    }
    
    try {
        const citiesRouter = require("./src/routes/cities");
        app.use("/api/cities", citiesRouter);
        console.log("✅ Завантажено cities routes");
    } catch (e) {
        console.log("⚠️ Cities routes не завантажено:", e.message);
    }
    
    try {
        const attractionsRouter = require("./src/routes/attractions");
        app.use("/api/attractions", attractionsRouter);
        console.log("✅ Завантажено attractions routes");
    } catch (e) {
        console.log("⚠️ Attractions routes не завантажено:", e.message);
    }
    
    try {
        const budgetRoutes = require("./src/routes/budgetRoutes");
        app.use("/api", budgetRoutes);
        console.log("✅ Завантажено budget routes");
    } catch (e) {
        console.log("⚠️ Budget routes не завантажено:", e.message);
    }
    
} catch (err) {
    console.log("❌ Помилка завантаження маршрутів:", err.message);
}

// Обробка 404
app.use((req, res) => {
    console.log(`❌ 404: Маршрут не знайдено: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: "Маршрут не знайдено",
        path: req.url,
        method: req.method
    });
});

// Обробка помилок
app.use((err, req, res, next) => {
    console.error("🔥 СЕРВЕРНА ПОМИЛКА:");
    console.error("Повідомлення:", err.message);
    console.error("Стек:", err.stack);
    console.error("URL:", req.originalUrl);
    
    res.status(500).json({ 
        error: "Внутрішня помилка сервера",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 СЕРВЕР ЗАПУЩЕНО!`);
    console.log(`📍 Порт: ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('\n📌 ТЕСТОВІ МАРШРУТИ:');
    console.log(`1. http://localhost:${PORT}/api/test`);
    console.log(`2. http://localhost:${PORT}/api/plan-budget?cityId=1&days=1`);
    console.log(`3. http://localhost:${PORT}/api/cities`);
    console.log('\n⚠️  Переконайся, що XAMPP MySQL запущений!');
    console.log('='.repeat(60));
});