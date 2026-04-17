const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { unauthorized } = require('../utils/response');

/**
 * JWT 认证中间件
 */
const authMiddleware = (req, res, next) => {
  // 从请求头中获取 token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res);
  }

  const token = authHeader.substring(7);

  try {
    // 验证 token
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    return unauthorized(res, 'Token 无效或已过期');
  }
};

module.exports = authMiddleware;
