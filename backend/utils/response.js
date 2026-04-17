/**
 * 统一响应格式封装
 */

// 成功响应
const success = (res, data = null, msg = '操作成功') => {
  res.json({
    code: 200,
    msg,
    data
  });
};

// 错误响应
const error = (res, msg = '操作失败', code = 500) => {
  res.status(code).json({
    code,
    msg,
    data: null
  });
};

// 参数错误
const badRequest = (res, msg = '参数错误') => {
  error(res, msg, 400);
};

// 未授权
const unauthorized = (res, msg = '未授权，请先登录') => {
  error(res, msg, 401);
};

// 禁止访问
const forbidden = (res, msg = '禁止访问') => {
  error(res, msg, 403);
};

module.exports = {
  success,
  error,
  badRequest,
  unauthorized,
  forbidden
};
