const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/bills', ExportController.exportBills);
router.get('/accounts', ExportController.exportAccounts);
router.get('/categories', ExportController.exportCategories);

module.exports = router;
