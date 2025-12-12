// backend/src/routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { calculatePlanBudget } = require('../controllers/budgetController');

router.get('/plan-budget', calculatePlanBudget);

module.exports = router;
