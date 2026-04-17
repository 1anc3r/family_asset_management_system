const { body } = require('express-validator');
const BudgetModel = require('../models/budget');
const { success, error } = require('../utils/response');
const moment = require('moment');

class BudgetController {
  /**
   * 创建预算校验规则
   */
  static createValidation = [
    body('amount')
      .isNumeric()
      .custom(value => value > 0)
      .withMessage('预算金额必须大于0'),
    body('year_month')
      .matches(/^\d{4}-\d{2}$/)
      .withMessage('年月格式不正确（如：2024-01）')
  ];

  /**
   * 获取预算列表
   */
  static async getList(req, res) {
    try {
      const { year_month } = req.query;
      const budgets = await BudgetModel.getAllByUserId(req.userId, year_month);
      success(res, { list: budgets });
    } catch (err) {
      console.error('获取预算列表失败：', err);
      error(res, '获取预算列表失败');
    }
  }

  /**
   * 获取预算执行情况
   */
  static async getExecution(req, res) {
    try {
      const { year_month } = req.query;
      const execution = await BudgetModel.getBudgetExecution(req.userId, year_month);
      
      // 计算总体情况
      const totalBudget = execution
        .filter(b => b.category_id === null)
        .reduce((sum, b) => sum + parseFloat(b.amount), 0);
      
      const totalUsed = execution
        .filter(b => b.category_id === null)
        .reduce((sum, b) => sum + b.used_amount, 0);
      
      success(res, {
        list: execution,
        summary: {
          total_budget: totalBudget,
          total_used: totalUsed,
          total_remaining: totalBudget - totalUsed,
          used_percent: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0
        }
      });
    } catch (err) {
      console.error('获取预算执行失败：', err);
      error(res, '获取预算执行失败');
    }
  }

  /**
   * 创建预算
   */
  static async create(req, res) {
    try {
      const data = req.body;
      
      // 检查是否已存在
      const exists = await BudgetModel.exists(req.userId, data.category_id || null, data.year_month);
      if (exists) {
        return error(res, '该分类在指定月份已存在预算', 400);
      }
      
      const budgetId = await BudgetModel.create(req.userId, data);
      success(res, { budgetId }, '创建成功');
    } catch (err) {
      console.error('创建预算失败：', err);
      error(res, '创建预算失败');
    }
  }

  /**
   * 更新预算
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const success_result = await BudgetModel.update(id, req.userId, data);
      if (!success_result) {
        return error(res, '预算不存在或更新失败', 404);
      }
      
      success(res, null, '更新成功');
    } catch (err) {
      console.error('更新预算失败：', err);
      error(res, '更新预算失败');
    }
  }

  /**
   * 删除预算
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success_result = await BudgetModel.delete(id, req.userId);
      if (!success_result) {
        return error(res, '预算不存在或删除失败', 404);
      }
      
      success(res, null, '删除成功');
    } catch (err) {
      console.error('删除预算失败：', err);
      error(res, '删除预算失败');
    }
  }

  /**
   * 复制上月预算
   */
  static async copyFromLastMonth(req, res) {
    try {
      const currentMonth = moment().format('YYYY-MM');
      const lastMonth = moment().subtract(1, 'month').format('YYYY-MM');
      
      // 获取上月预算
      const lastMonthBudgets = await BudgetModel.getAllByUserId(req.userId, lastMonth);
      
      if (lastMonthBudgets.length === 0) {
        return error(res, '上月没有预算记录', 400);
      }
      
      // 复制到本月
      let createdCount = 0;
      for (const budget of lastMonthBudgets) {
        const exists = await BudgetModel.exists(req.userId, budget.category_id, currentMonth);
        if (!exists) {
          await BudgetModel.create(req.userId, {
            category_id: budget.category_id,
            amount: budget.amount,
            period_type: budget.period_type,
            year_month: currentMonth,
            alert_threshold: budget.alert_threshold,
            status: budget.status
          });
          createdCount++;
        }
      }
      
      success(res, { created_count: createdCount }, `成功复制 ${createdCount} 个预算`);
    } catch (err) {
      console.error('复制预算失败：', err);
      error(res, '复制预算失败');
    }
  }
}

module.exports = BudgetController;
