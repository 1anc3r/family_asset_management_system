const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const validateMiddleware = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

// 公开接口
router.post('/register', UserController.registerValidation, validateMiddleware, UserController.register);
router.post('/login', UserController.loginValidation, validateMiddleware, UserController.login);

// 需要认证的接口
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);
router.put('/password', authMiddleware, UserController.changePassword);

module.exports = router;
