const fs = require('fs');
const path = require('path');
const moment = require('moment');
const BackupModel = require('../models/backup');
const AccountModel = require('../models/account');
const CategoryModel = require('../models/category');
const { success, error } = require('../utils/response');

// 确保备份目录存在
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

class BackupController {
  /**
   * 创建数据备份
   */
  static async createBackup(req, res) {
    try {
      const { remark } = req.body;
      
      // 获取所有用户数据
      const userData = await BackupModel.getAllUserData(req.userId);
      
      // 生成备份文件名
      const timestamp = moment().format('YYYYMMDD_HHmmss');
      const filename = `backup_${req.userId}_${timestamp}.json`;
      const filepath = path.join(backupDir, filename);
      
      // 写入文件
      const jsonData = JSON.stringify(userData, null, 2);
      fs.writeFileSync(filepath, jsonData, 'utf8');
      
      // 记录备份日志
      const dataCount = userData.statistics.bill_count + 
                        userData.statistics.account_count + 
                        userData.statistics.category_count;
      
      await BackupModel.logBackup(
        req.userId,
        filename,
        Buffer.byteLength(jsonData, 'utf8'),
        dataCount,
        'manual',
        remark || ''
      );
      
      // 返回备份文件下载
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(jsonData);
    } catch (err) {
      console.error('创建备份失败：', err);
      error(res, '创建备份失败');
    }
  }

  /**
   * 获取备份记录
   */
  static async getBackupLogs(req, res) {
    try {
      const logs = await BackupModel.getBackupLogs(req.userId);
      success(res, { list: logs });
    } catch (err) {
      console.error('获取备份记录失败：', err);
      error(res, '获取备份记录失败');
    }
  }

  /**
   * 恢复数据
   */
  static async restoreData(req, res) {
    try {
      if (!req.file) {
        return error(res, '请选择备份文件', 400);
      }
      
      // 读取备份文件
      const backupData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
      
      // 验证备份文件格式
      if (!backupData.version || !backupData.user) {
        // 删除临时文件
        fs.unlinkSync(req.file.path);
        return error(res, '无效的备份文件格式', 400);
      }
      
      const results = {
        accounts: { success: 0, failed: 0 },
        categories: { success: 0, failed: 0 },
        bills: { success: 0, failed: 0 },
        budgets: { success: 0, failed: 0 }
      };
      
      // 恢复账户
      if (backupData.accounts && backupData.accounts.length > 0) {
        const accountResults = await BackupModel.restoreAccounts(req.userId, backupData.accounts);
        results.accounts.success = accountResults.filter(r => r.success).length;
        results.accounts.failed = accountResults.filter(r => !r.success).length;
      }
      
      // 恢复分类
      if (backupData.categories && backupData.categories.length > 0) {
        const categoryResults = await BackupModel.restoreCategories(req.userId, backupData.categories);
        results.categories.success = categoryResults.filter(r => r.success).length;
        results.categories.failed = categoryResults.filter(r => !r.success).length;
      }
      
      // 恢复账单
      if (backupData.bills && backupData.bills.length > 0) {
        const billResults = await BackupModel.restoreBills(req.userId, backupData.bills);
        results.bills.success = billResults.filter(r => r.success).length;
        results.bills.failed = billResults.filter(r => !r.success).length;
      }
      
      // 恢复预算
      if (backupData.budgets && backupData.budgets.length > 0) {
        const budgetResults = await BackupModel.restoreBudgets(req.userId, backupData.budgets);
        results.budgets.success = budgetResults.filter(r => r.success).length;
        results.budgets.failed = budgetResults.filter(r => !r.success).length;
      }
      
      // 删除临时文件
      fs.unlinkSync(req.file.path);
      
      success(res, results, '数据恢复完成');
    } catch (err) {
      console.error('恢复数据失败：', err);
      // 删除临时文件
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      error(res, '恢复数据失败：' + err.message);
    }
  }

  /**
   * 下载备份文件
   */
  static async downloadBackup(req, res) {
    try {
      const { filename } = req.params;
      const filepath = path.join(backupDir, filename);
      
      // 安全检查：确保文件在备份目录内
      if (!filepath.startsWith(backupDir)) {
        return error(res, '非法的文件路径', 403);
      }
      
      if (!fs.existsSync(filepath)) {
        return error(res, '备份文件不存在', 404);
      }
      
      res.download(filepath);
    } catch (err) {
      console.error('下载备份失败：', err);
      error(res, '下载备份失败');
    }
  }

  /**
   * 删除备份记录
   */
  static async deleteBackup(req, res) {
    try {
      const { id } = req.params;
      
      const success_result = await BackupModel.deleteBackupLog(id, req.userId);
      if (!success_result) {
        return error(res, '备份记录不存在或删除失败', 404);
      }
      
      success(res, null, '删除成功');
    } catch (err) {
      console.error('删除备份记录失败：', err);
      error(res, '删除备份记录失败');
    }
  }
}

module.exports = BackupController;
