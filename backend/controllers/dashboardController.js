const AccountModel = require('../models/account');
const BillModel = require('../models/bill');
const StatisticsModel = require('../models/statistics');
const { success, error } = require('../utils/response');
const moment = require('moment');

class DashboardController {
  /**
   * 获取仪表盘数据
   */
  static async getDashboard(req, res) {
    try {
      const userId = req.userId;
      
      // 资产统计
      const assetStats = await AccountModel.getAssetStats(userId);
      
      // 今日收支
      const todayStats = await BillModel.getTodayStats(userId);
      
      // 本月收支
      const monthStats = await BillModel.getMonthStats(userId);
      
      // 近期账单
      const recentBills = await StatisticsModel.getRecentBills(userId, 5);
      
      // 账户列表
      const accounts = await AccountModel.getAllByUserId(userId);
      
      success(res, {
        assets: assetStats,
        today: todayStats,
        month: monthStats,
        recentBills,
        accounts
      });
    } catch (err) {
      console.error('获取仪表盘数据失败：', err);
      error(res, '获取仪表盘数据失败');
    }
  }

  /**
   * 获取资产分布
   */
  static async getAssetDistribution(req, res) {
    try {
      const accounts = await AccountModel.getAllByUserId(req.userId);
      
      // 按类型分组统计
      const assetAccounts = accounts.filter(a => a.type === 'asset' && a.status === 1);
      const liabilityAccounts = accounts.filter(a => a.type === 'liability' && a.status === 1);
      
      const assetDistribution = assetAccounts.map(a => ({
        name: a.name,
        balance: parseFloat(a.balance),
        icon: a.icon
      }));
      
      const liabilityDistribution = liabilityAccounts.map(a => ({
        name: a.name,
        balance: parseFloat(a.balance),
        icon: a.icon
      }));
      
      success(res, {
        assets: assetDistribution,
        liabilities: liabilityDistribution
      });
    } catch (err) {
      console.error('获取资产分布失败：', err);
      error(res, '获取资产分布失败');
    }
  }
}

module.exports = DashboardController;
