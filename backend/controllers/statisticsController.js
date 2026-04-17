const StatisticsModel = require('../models/statistics');
const { success, error } = require('../utils/response');
const moment = require('moment');

class StatisticsController {
  /**
   * 获取分类统计
   */
  static async getCategoryStats(req, res) {
    try {
      const { type, start_date, end_date } = req.query;
      
      // 默认本月
      const start = start_date || moment().startOf('month').format('YYYY-MM-DD');
      const end = end_date || moment().endOf('month').format('YYYY-MM-DD');
      
      let data;
      if (type === 'income') {
        data = await StatisticsModel.getIncomeByCategory(req.userId, start, end);
      } else {
        data = await StatisticsModel.getExpenseByCategory(req.userId, start, end);
      }
      
      success(res, {
        list: data,
        total: data.reduce((sum, item) => sum + item.total_amount, 0),
        dateRange: { start, end }
      });
    } catch (err) {
      console.error('获取分类统计失败：', err);
      error(res, '获取分类统计失败');
    }
  }

  /**
   * 获取月度趋势
   */
  static async getMonthlyTrend(req, res) {
    try {
      const { months } = req.query;
      const data = await StatisticsModel.getMonthlyTrend(req.userId, parseInt(months) || 12);
      
      success(res, {
        list: data,
        totalIncome: data.reduce((sum, item) => sum + item.income, 0),
        totalExpense: data.reduce((sum, item) => sum + item.expense, 0)
      });
    } catch (err) {
      console.error('获取月度趋势失败：', err);
      error(res, '获取月度趋势失败');
    }
  }

  /**
   * 获取账户统计
   */
  static async getAccountStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      // 默认本月
      const start = start_date || moment().startOf('month').format('YYYY-MM-DD');
      const end = end_date || moment().endOf('month').format('YYYY-MM-DD');
      
      const data = await StatisticsModel.getStatsByAccount(req.userId, start, end);
      
      success(res, {
        list: data,
        dateRange: { start, end }
      });
    } catch (err) {
      console.error('获取账户统计失败：', err);
      error(res, '获取账户统计失败');
    }
  }
}

module.exports = StatisticsController;
