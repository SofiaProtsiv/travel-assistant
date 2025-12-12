const db = require("../config/db");

class User {
    static create(email, password, callback) {
        const sql = "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, NOW())";
        db.query(sql, [email, password], callback);
    }

    static findByEmail(email, callback) {
        const sql = "SELECT * FROM users WHERE email = ?";
        console.log('Executing SQL:', sql, 'with email:', email);
        db.query(sql, [email], (err, results) => {
            if (err) {
                console.error('Database query error in User.findByEmail:', err);
            }
            callback(err, results);
        });
    }

    static findById(id, callback) {
        const sql = "SELECT id, email, created_at FROM users WHERE id = ?";
        db.query(sql, [id], callback);
    }
}

module.exports = User;