// test-simple.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "34pro100",
    database: "travel"
});

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
    } else {
        console.log('✅ Connected!');
        
        // Перевіримо таблиці
        connection.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error('❌ Tables query failed:', err.message);
            } else {
                console.log('📊 Tables in database:');
                results.forEach(row => {
                    console.log('  -', row[Object.keys(row)[0]]);
                });
            }
            connection.end();
        });
    }
});