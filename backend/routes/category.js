const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const validateMiddleware = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/list', CategoryController.getList);
router.post('/add', CategoryController.createValidation, validateMiddleware, CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;
