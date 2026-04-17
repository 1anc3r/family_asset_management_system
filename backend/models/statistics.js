const { pool } = require('../config/database');
const moment = require('moment');

class StatisticsModel {
  /**
   * 获取支出分类统计
   */
  async getExpenseByCategory(userId, startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        SUM(b.amount) as total_amount,
        COUNT(b.id) as bill_count
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? 
        AND b.type = 'expense'
        AND DATE(b.bill_time) >= ?
        AND DATE(b.bill_time) <= ?
      GROUP BY b.category_id
      ORDER BY total_amount DESC`,
      [userId, startDate, endDate]
    );
    
    return rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount || 0)
    }));
  }

  /**
   * 获取收入分类统计
   */
  async getIncomeByCategory(userId, startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        SUM(b.amount) as total_amount,
        COUNT(b.id) as bill_count
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? 
        AND b.type = 'income'
        AND DATE(b.bill_time) >= ?
        AND DATE(b.bill_time) <= ?
      GROUP BY b.category_id
      ORDER BY total_amount DESC`,
      [userId, startDate, endDate]
    );
    
    return rows.map(row => ({
      ...row,
      total_amount: parseFloat(row.total_amount || 0)
    }));
  }

  /**
   * 获取月度收支趋势
   */
  async getMonthlyTrend(userId, months = 12) {
    const endDate = moment().endOf('month');
    const startDate = moment().subtract(months - 1, 'months').startOf('month');
    
    const [rows] = await pool.query(
      `SELECT 
        DATE_FORMAT(bill_time, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM bills 
      WHERE user_id = ? 
        AND DATE(bill_time) >= ?
        AND DATE(bill_time) <= ?
      GROUP BY DATE_FORMAT(bill_time, '%Y-%m')
      ORDER BY month ASC`,
      [userId, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
    );
    
    // 填充没有数据的月份
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('YYYY-MM');
      const monthData = rows.find(r => r.month === month);
      result.push({
        month,
        income: parseFloat(monthData?.income || 0),
        expense: parseFloat(monthData?.expense || 0)
      });
    }
    
    return result;
  }

  /**
   * 获取账户收支统计
   */
  async getStatsByAccount(userId, startDate, endDate) {
    const [rows] = await pool.query(
      `SELECT 
        a.id as account_id,
        a.name as account_name,
        a.type as account_type,
        SUM(CASE WHEN b.type = 'income' THEN b.amount ELSE 0 END) as income,
        SUM(CASE WHEN b.type = 'expense' THEN b.amount ELSE 0 END) as expense
      FROM accounts a
      LEFT JOIN bills b ON a.id = b.account_id 
        AND DATE(b.bill_time) >= ?
        AND DATE(b.bill_time) <= ?
      WHERE a.user_id = ? AND a.status = 1
      GROUP BY a.id
      ORDER BY a.type, a.create_time DESC`,
      [startDate, endDate, userId]
    );
    
    return rows.map(row => ({
      ...row,
      income: parseFloat(row.income || 0),
      expense: parseFloat(row.expense || 0)
    }));
  }

  /**
   * 获取近期账单
   */
  async getRecentBills(userId, limit = 5) {
    const [rows] = await pool.query(
      `SELECT b.*, 
        a.name as account_name, 
        c.name as category_name,
        c.icon as category_icon
      FROM bills b
      LEFT JOIN accounts a ON b.account_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.bill_time DESC, b.id DESC
      LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }
}

module.exports = new StatisticsModel();
