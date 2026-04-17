const express = require('express');
const router = express.Router();
const BillController = require('../controllers/billController');
const validateMiddleware = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/list', BillController.getList);
router.get('/today', BillController.getTodayStats);
router.get('/month', BillController.getMonthStats);
router.get('/:id', BillController.getDetail);
router.post('/add', BillController.createValidation, validateMiddleware, BillController.create);
router.put('/:id', BillController.update);
router.delete('/:id', BillController.delete);

module.exports = router;
