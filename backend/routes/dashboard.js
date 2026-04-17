const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/', DashboardController.getDashboard);
router.get('/asset-distribution', DashboardController.getAssetDistribution);

module.exports = router;
