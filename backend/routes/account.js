const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');
const validateMiddleware = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// 所有接口都需要认证
router.use(authMiddleware);

router.get('/list', AccountController.getList);
router.get('/stats', AccountController.getStats);
router.post('/add', AccountController.createValidation, validateMiddleware, AccountController.create);
router.put('/:id', AccountController.update);
router.delete('/:id', AccountController.delete);

module.exports = router;
