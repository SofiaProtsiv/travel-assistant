const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key-for-trunnn";

// REGISTER
exports.register = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Заповни всі поля"
            });
        }

        User.create(email, password, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Користувач з таким email вже існує"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Помилка сервера",
                    details: err.message
                });
            }

            const userId = result.insertId;

            const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
                expiresIn: "30d"
            });

            res.json({
                success: true,
                message: "Успішна реєстрація",
                token,
                user: {
                    id: userId,
                    email
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Помилка сервера",
            error: error.message
        });
    }
};

// LOGIN
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Заповни всі поля"
            });
        }

        User.findByEmail(email, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Помилка сервера",
                    details: err.message
                });
            }

            if (!results || results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Користувача не знайдено"
                });
            }

            const user = results[0];

            if (password !== user.password_hash) {
                return res.status(400).json({
                    success: false,
                    message: "Невірний пароль"
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: "30d" }
            );

            res.json({
                success: true,
                message: "Успішний вхід",
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Помилка сервера",
            error: error.message
        });
    }
};
