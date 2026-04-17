const { pool } = require('../config/database');
const moment = require('moment');

class BudgetModel {
  /**
   * 获取用户的预算列表
   */
  async getAllByUserId(userId, yearMonth = null) {
    const month = yearMonth || moment().format('YYYY-MM');
    
    const [rows] = await pool.query(
      `SELECT b.*, c.name as category_name, c.icon as category_icon
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.year_month = ?
       ORDER BY b.category_id IS NULL DESC, b.category_id ASC`,
      [userId, month]
    );
    return rows;
  }

  /**
   * 根据ID获取预算
   */
  async getById(id, userId) {
    const [rows] = await pool.query(
      `SELECT b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
      [id, userId]
    );
    return rows[0];
  }

  /**
   * 创建预算
   */
  async create(userId, data) {
    const [result] = await pool.query(
      `INSERT INTO budgets 
       (user_id, category_id, amount, period_type, year_month, alert_threshold, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.category_id || null,
        data.amount,
        data.period_type || 'month',
        data.year_month,
        data.alert_threshold || 80,
        data.status !== undefined ? data.status : 1
      ]
    );
    return result.insertId;
  }

  /**
   * 更新预算
   */
  async update(id, userId, data) {
    const fields = [];
    const values = [];

    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    if (data.alert_threshold !== undefined) {
      fields.push('alert_threshold = ?');
      values.push(data.alert_threshold);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) return false;

    values.push(id, userId);

    const [result] = await pool.query(
      `UPDATE budgets SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * 删除预算
   */
  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 获取预算执行情况
   */
  async getBudgetExecution(userId, yearMonth = null) {
    const month = yearMonth || moment().format('YYYY-MM');
    
    // 获取所有预算
    const budgets = await this.getAllByUserId(userId, month);
    
    // 获取当月支出统计
    const [expenseStats] = await pool.query(
      `SELECT 
        category_id,
        SUM(amount) as total_amount,
        COUNT(*) as bill_count
       FROM bills 
       WHERE user_id = ? 
         AND type = 'expense'
         AND DATE_FORMAT(bill_time, '%Y-%m') = ?
       GROUP BY category_id`,
      [userId, month]
    );
    
    // 计算总支出
    const totalExpense = expenseStats.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    
    // 合并预算和执行数据
    const result = budgets.map(budget => {
      const expense = budget.category_id 
        ? (expenseStats.find(e => e.category_id === budget.category_id)?.total_amount || 0)
        : totalExpense;
      
      const usedPercent = budget.amount > 0 ? Math.round((expense / budget.amount) * 100) : 0;
      const remaining = budget.amount - expense;
      
      return {
        ...budget,
        used_amount: parseFloat(expense),
        used_percent: usedPercent,
        remaining: remaining,
        is_alert: usedPercent >= budget.alert_threshold,
        is_over: usedPercent >= 100
      };
    });
    
    return result;
  }

  /**
   * 检查预算是否已存在
   */
  async exists(userId, categoryId, yearMonth) {
    const [rows] = await pool.query(
      'SELECT id FROM budgets WHERE user_id = ? AND category_id <=> ? AND year_month = ?',
      [userId, categoryId, yearMonth]
    );
    return rows.length > 0;
  }
}

module.exports = new BudgetModel();
