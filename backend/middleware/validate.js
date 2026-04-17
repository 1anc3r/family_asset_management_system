const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/response');

/**
 * 参数校验中间件
 */
const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg;
    return badRequest(res, errorMsg);
  }
  
  next();
};

module.exports = validateMiddleware;
