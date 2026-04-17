const { body } = require('express-validator');
const BillModel = require('../models/bill');
const AccountModel = require('../models/account');
const { success, error } = require('../utils/response');
const moment = require('moment');

class BillController {
  /**
   * 创建账单校验规则
   */
  static createValidation = [
    body('type')
      .isIn(['income', 'expense', 'transfer'])
      .withMessage('账单类型必须是 income、expense 或 transfer'),
    body('amount')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('金额必须是大于0的数字'),
    body('account_id')
      .notEmpty()
      .withMessage('账户不能为空')
  ];

  /**
   * 获取账单列表
   */
  static async getList(req, res) {
    try {
      const params = req.query;
      const list = await BillModel.getList(req.userId, params);
      const total = await BillModel.getCount(req.userId, params);
      
      success(res, {
        list,
        pagination: {
          page: parseInt(params.page) || 1,
          pageSize: parseInt(params.pageSize) || 20,
          total
        }
      });
    } catch (err) {
      console.error('获取账单列表失败：', err);
      error(res, '获取账单列表失败');
    }
  }

  /**
   * 创建账单
   */
  static async create(req, res) {
    try {
      const data = req.body;
      
      // 验证账户是否存在
      const account = await AccountModel.getById(data.account_id, req.userId);
      if (!account) {
        return error(res, '账户不存在', 400);
      }
      
      // 转账需要验证目标账户
      if (data.type === 'transfer') {
        if (!data.to_account_id) {
          return error(res, '转账需要选择目标账户', 400);
        }
        if (data.account_id === data.to_account_id) {
          return error(res, '不能转账到同一账户', 400);
        }
        const toAccount = await AccountModel.getById(data.to_account_id, req.userId);
        if (!toAccount) {
          return error(res, '目标账户不存在', 400);
        }
      }
      
      // 创建账单
      const billId = await BillModel.create(req.userId, data);
      
      // 更新账户余额
      if (data.type === 'income') {
        await AccountModel.updateBalance(data.account_id, data.amount);
      } else if (data.type === 'expense') {
        await AccountModel.updateBalance(data.account_id, -data.amount);
      } else if (data.type === 'transfer') {
        await AccountModel.updateBalance(data.account_id, -data.amount);
        await AccountModel.updateBalance(data.to_account_id, data.amount);
      }
      
      success(res, { billId }, '记账成功');
    } catch (err) {
      console.error('创建账单失败：', err);
      error(res, '记账失败');
    }
  }

  /**
   * 更新账单
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // 获取原账单
      const oldBill = await BillModel.getById(id, req.userId);
      if (!oldBill) {
        return error(res, '账单不存在', 404);
      }
      
      // 更新账单
      const success_result = await BillModel.update(id, req.userId, data);
      if (!success_result) {
        return error(res, '更新失败', 400);
      }
      
      // 如果金额或类型变化，需要调整账户余额
      if (data.amount !== undefined || data.type !== undefined) {
        // 先回滚原账单的影响
        if (oldBill.type === 'income') {
          await AccountModel.updateBalance(oldBill.account_id, -oldBill.amount);
        } else if (oldBill.type === 'expense') {
          await AccountModel.updateBalance(oldBill.account_id, oldBill.amount);
        } else if (oldBill.type === 'transfer') {
          await AccountModel.updateBalance(oldBill.account_id, oldBill.amount);
          await AccountModel.updateBalance(oldBill.to_account_id, -oldBill.amount);
        }
        
        // 应用新账单的影响
        const newType = data.type || oldBill.type;
        const newAmount = data.amount || oldBill.amount;
        const newAccountId = data.account_id || oldBill.account_id;
        const newToAccountId = data.to_account_id || oldBill.to_account_id;
        
        if (newType === 'income') {
          await AccountModel.updateBalance(newAccountId, newAmount);
        } else if (newType === 'expense') {
          await AccountModel.updateBalance(newAccountId, -newAmount);
        } else if (newType === 'transfer') {
          await AccountModel.updateBalance(newAccountId, -newAmount);
          await AccountModel.updateBalance(newToAccountId, newAmount);
        }
      }
      
      success(res, null, '更新成功');
    } catch (err) {
      console.error('更新账单失败：', err);
      error(res, '更新账单失败');
    }
  }

  /**
   * 删除账单
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // 获取原账单
      const oldBill = await BillModel.getById(id, req.userId);
      if (!oldBill) {
        return error(res, '账单不存在', 404);
      }
      
      // 删除账单
      const success_result = await BillModel.delete(id, req.userId);
      if (!success_result) {
        return error(res, '删除失败', 400);
      }
      
      // 回滚账户余额
      if (oldBill.type === 'income') {
        await AccountModel.updateBalance(oldBill.account_id, -oldBill.amount);
      } else if (oldBill.type === 'expense') {
        await AccountModel.updateBalance(oldBill.account_id, oldBill.amount);
      } else if (oldBill.type === 'transfer') {
        await AccountModel.updateBalance(oldBill.account_id, oldBill.amount);
        await AccountModel.updateBalance(oldBill.to_account_id, -oldBill.amount);
      }
      
      success(res, null, '删除成功');
    } catch (err) {
      console.error('删除账单失败：', err);
      error(res, '删除账单失败');
    }
  }

  /**
   * 获取账单详情
   */
  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      const bill = await BillModel.getById(id, req.userId);
      
      if (!bill) {
        return error(res, '账单不存在', 404);
      }
      
      success(res, bill);
    } catch (err) {
      console.error('获取账单详情失败：', err);
      error(res, '获取账单详情失败');
    }
  }

  /**
   * 获取今日收支
   */
  static async getTodayStats(req, res) {
    try {
      const stats = await BillModel.getTodayStats(req.userId);
      success(res, stats);
    } catch (err) {
      console.error('获取今日收支失败：', err);
      error(res, '获取今日收支失败');
    }
  }

  /**
   * 获取本月收支
   */
  static async getMonthStats(req, res) {
    try {
      const { month } = req.query;
      const stats = await BillModel.getMonthStats(req.userId, month);
      success(res, stats);
    } catch (err) {
      console.error('获取本月收支失败：', err);
      error(res, '获取本月收支失败');
    }
  }
}

module.exports = BillController;
