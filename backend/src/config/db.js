const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "sofiaaprotsiv",
    password: "T2yoV[ck0KzVtuRC",
    database: "travel",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.promise = () => ({
    query: (sql, params) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([results]);
                }
            });
        });
    }
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        connection.release();
    }
});

module.exports = db;
