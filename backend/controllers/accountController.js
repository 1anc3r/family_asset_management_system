const { body } = require('express-validator');
const AccountModel = require('../models/account');
const { success, error } = require('../utils/response');

class AccountController {
  /**
   * 创建账户校验规则
   */
  static createValidation = [
    body('name')
      .notEmpty()
      .withMessage('账户名称不能为空'),
    body('type')
      .isIn(['asset', 'liability'])
      .withMessage('账户类型必须是 asset 或 liability'),
    body('balance')
      .optional()
      .isNumeric()
      .withMessage('余额必须是数字')
  ];

  /**
   * 获取账户列表
   */
  static async getList(req, res) {
    try {
      const accounts = await AccountModel.getAllByUserId(req.userId);
      
      // 按类型分组
      const assets = accounts.filter(a => a.type === 'asset');
      const liabilities = accounts.filter(a => a.type === 'liability');
      
      success(res, {
        list: accounts,
        assets,
        liabilities
      });
    } catch (err) {
      console.error('获取账户列表失败：', err);
      error(res, '获取账户列表失败');
    }
  }

  /**
   * 创建账户
   */
  static async create(req, res) {
    try {
      const data = req.body;
      const accountId = await AccountModel.create(req.userId, data);
      success(res, { accountId }, '创建成功');
    } catch (err) {
      console.error('创建账户失败：', err);
      error(res, '创建账户失败');
    }
  }

  /**
   * 更新账户
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const success_result = await AccountModel.update(id, req.userId, data);
      if (!success_result) {
        return error(res, '账户不存在或更新失败', 404);
      }
      
      success(res, null, '更新成功');
    } catch (err) {
      console.error('更新账户失败：', err);
      error(res, '更新账户失败');
    }
  }

  /**
   * 删除账户
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success_result = await AccountModel.delete(id, req.userId);
      if (!success_result) {
        return error(res, '账户不存在或删除失败', 404);
      }
      
      success(res, null, '删除成功');
    } catch (err) {
      console.error('删除账户失败：', err);
      error(res, '删除账户失败');
    }
  }

  /**
   * 获取资产统计
   */
  static async getStats(req, res) {
    try {
      const stats = await AccountModel.getAssetStats(req.userId);
      success(res, stats);
    } catch (err) {
      console.error('获取资产统计失败：', err);
      error(res, '获取资产统计失败');
    }
  }
}

module.exports = AccountController;
