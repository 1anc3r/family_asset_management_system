const { pool } = require('../config/database');
const moment = require('moment');

class BackupModel {
  /**
   * 获取用户的所有数据（用于备份）
   */
  async getAllUserData(userId) {
    // 获取用户信息
    const [users] = await pool.query(
      'SELECT id, username, nickname, base_currency, create_time FROM users WHERE id = ?',
      [userId]
    );

    // 获取账户
    const [accounts] = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ?',
      [userId]
    );

    // 获取分类
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ?',
      [userId]
    );

    // 获取账单
    const [bills] = await pool.query(
      'SELECT * FROM bills WHERE user_id = ? ORDER BY bill_time DESC',
      [userId]
    );

    // 获取预算
    const [budgets] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ?',
      [userId]
    );

    return {
      version: '1.0.0',
      backup_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      user: users[0] || null,
      accounts,
      categories,
      bills,
      budgets,
      statistics: {
        account_count: accounts.length,
        category_count: categories.length,
        bill_count: bills.length,
        budget_count: budgets.length
      }
    };
  }

  /**
   * 记录备份日志
   */
  async logBackup(userId, fileName, fileSize, dataCount, backupType = 'manual', remark = '') {
    const [result] = await pool.query(
      'INSERT INTO backup_logs (user_id, file_name, file_size, data_count, backup_type, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, fileName, fileSize, dataCount, backupType, remark]
    );
    return result.insertId;
  }

  /**
   * 获取备份记录
   */
  async getBackupLogs(userId, limit = 20) {
    const [rows] = await pool.query(
      'SELECT * FROM backup_logs WHERE user_id = ? ORDER BY create_time DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }

  /**
   * 删除备份记录
   */
  async deleteBackupLog(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM backup_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 恢复数据 - 账户
   */
  async restoreAccounts(userId, accounts) {
    const results = [];
    for (const account of accounts) {
      try {
        const [result] = await pool.query(
          `INSERT INTO accounts (user_id, name, type, balance, currency, icon, status, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name), 
           type = VALUES(type), 
           balance = VALUES(balance),
           currency = VALUES(currency),
           icon = VALUES(icon),
           status = VALUES(status)`,
          [
            userId,
            account.name,
            account.type,
            account.balance,
            account.currency || 'CNY',
            account.icon,
            account.status,
            account.create_time
          ]
        );
        results.push({ success: true, id: result.insertId || account.id });
      } catch (error) {
        results.push({ success: false, error: error.message, account });
      }
    }
    return results;
  }

  /**
   * 恢复数据 - 分类
   */
  async restoreCategories(userId, categories) {
    const results = [];
    for (const category of categories) {
      try {
        const [result] = await pool.query(
          `INSERT INTO categories (user_id, name, type, icon, sort, status, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name), 
           type = VALUES(type), 
           icon = VALUES(icon),
           sort = VALUES(sort),
           status = VALUES(status)`,
          [
            userId,
            category.name,
            category.type,
            category.icon,
            category.sort || 0,
            category.status,
            category.create_time
          ]
        );
        results.push({ success: true, id: result.insertId || category.id });
      } catch (error) {
        results.push({ success: false, error: error.message, category });
      }
    }
    return results;
  }

  /**
   * 恢复数据 - 账单
   */
  async restoreBills(userId, bills) {
    const results = [];
    for (const bill of bills) {
      try {
        const [result] = await pool.query(
          `INSERT INTO bills (user_id, type, amount, currency, account_id, to_account_id, category_id, remark, bill_time, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            bill.type,
            bill.amount,
            bill.currency || 'CNY',
            bill.account_id,
            bill.to_account_id,
            bill.category_id,
            bill.remark,
            bill.bill_time,
            bill.create_time
          ]
        );
        results.push({ success: true, id: result.insertId });
      } catch (error) {
        results.push({ success: false, error: error.message, bill });
      }
    }
    return results;
  }

  /**
   * 恢复数据 - 预算
   */
  async restoreBudgets(userId, budgets) {
    const results = [];
    for (const budget of budgets) {
      try {
        const [result] = await pool.query(
          `INSERT INTO budgets (user_id, category_id, amount, period_type, year_month, alert_threshold, status, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           amount = VALUES(amount), 
           alert_threshold = VALUES(alert_threshold),
           status = VALUES(status)`,
          [
            userId,
            budget.category_id,
            budget.amount,
            budget.period_type || 'month',
            budget.year_month,
            budget.alert_threshold || 80,
            budget.status,
            budget.create_time
          ]
        );
        results.push({ success: true, id: result.insertId || budget.id });
      } catch (error) {
        results.push({ success: false, error: error.message, budget });
      }
    }
    return results;
  }
}

module.exports = new BackupModel();
