const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const validateMiddleware = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/list', BudgetController.getList);
router.get('/execution', BudgetController.getExecution);
router.post('/add', BudgetController.createValidation, validateMiddleware, BudgetController.create);
router.put('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);
router.post('/copy-from-last-month', BudgetController.copyFromLastMonth);

module.exports = router;
