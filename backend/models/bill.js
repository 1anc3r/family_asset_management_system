const { pool } = require('../config/database');
const moment = require('moment');

class BillModel {
  /**
   * 创建账单
   */
  async create(userId, data) {
    const [result] = await pool.query(
      'INSERT INTO bills (user_id, type, amount, account_id, to_account_id, category_id, remark, bill_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        data.type,
        data.amount,
        data.account_id,
        data.to_account_id || null,
        data.category_id || null,
        data.remark || '',
        data.bill_time || moment().format('YYYY-MM-DD HH:mm:ss')
      ]
    );
    return result.insertId;
  }

  /**
   * 获取账单列表
   */
  async getList(userId, params = {}) {
    let sql = `
      SELECT b.*, 
        a.name as account_name, 
        a2.name as to_account_name,
        c.name as category_name,
        c.icon as category_icon
      FROM bills b
      LEFT JOIN accounts a ON b.account_id = a.id
      LEFT JOIN accounts a2 ON b.to_account_id = a2.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
    `;
    const queryParams = [userId];

    // 类型筛选
    if (params.type) {
      sql += ' AND b.type = ?';
      queryParams.push(params.type);
    }

    // 账户筛选
    if (params.account_id) {
      sql += ' AND b.account_id = ?';
      queryParams.push(params.account_id);
    }

    // 分类筛选
    if (params.category_id) {
      sql += ' AND b.category_id = ?';
      queryParams.push(params.category_id);
    }

    // 日期范围筛选
    if (params.start_date) {
      sql += ' AND DATE(b.bill_time) >= ?';
      queryParams.push(params.start_date);
    }
    if (params.end_date) {
      sql += ' AND DATE(b.bill_time) <= ?';
      queryParams.push(params.end_date);
    }

    // 关键词搜索
    if (params.keyword) {
      sql += ' AND (b.remark LIKE ? OR c.name LIKE ?)';
      queryParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
    }

    // 排序
    sql += ' ORDER BY b.bill_time DESC, b.id DESC';

    // 分页
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    sql += ' LIMIT ? OFFSET ?';
    queryParams.push(pageSize, offset);

    const [rows] = await pool.query(sql, queryParams);
    return rows;
  }

  /**
   * 获取账单总数
   */
  async getCount(userId, params = {}) {
    let sql = 'SELECT COUNT(*) as total FROM bills WHERE user_id = ?';
    const queryParams = [userId];

    if (params.type) {
      sql += ' AND type = ?';
      queryParams.push(params.type);
    }
    if (params.account_id) {
      sql += ' AND account_id = ?';
      queryParams.push(params.account_id);
    }
    if (params.category_id) {
      sql += ' AND category_id = ?';
      queryParams.push(params.category_id);
    }
    if (params.start_date) {
      sql += ' AND DATE(bill_time) >= ?';
      queryParams.push(params.start_date);
    }
    if (params.end_date) {
      sql += ' AND DATE(bill_time) <= ?';
      queryParams.push(params.end_date);
    }
    if (params.keyword) {
      sql += ' AND remark LIKE ?';
      queryParams.push(`%${params.keyword}%`);
    }

    const [rows] = await pool.query(sql, queryParams);
    return rows[0].total;
  }

  /**
   * 根据ID获取账单
   */
  async getById(id, userId) {
    const [rows] = await pool.query(
      `SELECT b.*, 
        a.name as account_name, 
        a2.name as to_account_name,
        c.name as category_name
      FROM bills b
      LEFT JOIN accounts a ON b.account_id = a.id
      LEFT JOIN accounts a2 ON b.to_account_id = a2.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.user_id = ?`,
      [id, userId]
    );
    return rows[0];
  }

  /**
   * 更新账单
   */
  async update(id, userId, data) {
    const fields = [];
    const values = [];

    if (data.type !== undefined) {
      fields.push('type = ?');
      values.push(data.type);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    if (data.account_id !== undefined) {
      fields.push('account_id = ?');
      values.push(data.account_id);
    }
    if (data.to_account_id !== undefined) {
      fields.push('to_account_id = ?');
      values.push(data.to_account_id);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.remark !== undefined) {
      fields.push('remark = ?');
      values.push(data.remark);
    }
    if (data.bill_time !== undefined) {
      fields.push('bill_time = ?');
      values.push(data.bill_time);
    }

    if (fields.length === 0) return false;

    values.push(id, userId);

    const [result] = await pool.query(
      `UPDATE bills SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * 删除账单
   */
  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM bills WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 获取今日收支
   */
  async getTodayStats(userId) {
    const today = moment().format('YYYY-MM-DD');
    const [rows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM bills 
      WHERE user_id = ? AND DATE(bill_time) = ?`,
      [userId, today]
    );
    
    return {
      income: parseFloat(rows[0].income || 0),
      expense: parseFloat(rows[0].expense || 0)
    };
  }

  /**
   * 获取本月收支
   */
  async getMonthStats(userId, yearMonth = null) {
    const month = yearMonth || moment().format('YYYY-MM');
    const [rows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM bills 
      WHERE user_id = ? AND DATE_FORMAT(bill_time, '%Y-%m') = ?`,
      [userId, month]
    );
    
    return {
      income: parseFloat(rows[0].income || 0),
      expense: parseFloat(rows[0].expense || 0)
    };
  }
}

module.exports = new BillModel();
