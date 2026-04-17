const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/category', StatisticsController.getCategoryStats);
router.get('/monthly', StatisticsController.getMonthlyTrend);
router.get('/account', StatisticsController.getAccountStats);

module.exports = router;
