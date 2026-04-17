const express = require('express');
const router = express.Router();
const CurrencyController = require('../controllers/currencyController');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/list', CurrencyController.getCurrencies);
router.get('/rates', CurrencyController.getRates);
router.get('/convert', CurrencyController.convert);
router.get('/rate', CurrencyController.getRate);
router.put('/rate', CurrencyController.updateRate);

module.exports = router;
