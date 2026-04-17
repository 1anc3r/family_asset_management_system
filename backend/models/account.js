const { pool } = require('../config/database');

class AccountModel {
  /**
   * 获取用户的所有账户
   */
  async getAllByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY type, create_time DESC',
      [userId]
    );
    return rows;
  }

  /**
   * 根据ID获取账户
   */
  async getById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  /**
   * 创建账户
   */
  async create(userId, data) {
    const [result] = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance, currency, icon, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        data.name,
        data.type,
        data.balance || 0,
        data.currency || 'CNY',
        data.icon || '',
        data.status || 1
      ]
    );
    return result.insertId;
  }

  /**
   * 更新账户
   */
  async update(id, userId, data) {
    const fields = [];
    const values = [];
    
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    
    if (data.type !== undefined) {
      fields.push('type = ?');
      values.push(data.type);
    }
    
    if (data.balance !== undefined) {
      fields.push('balance = ?');
      values.push(data.balance);
    }
    
    if (data.currency !== undefined) {
      fields.push('currency = ?');
      values.push(data.currency);
    }
    
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id, userId);
    
    const [result] = await pool.query(
      `UPDATE accounts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 更新账户余额
   */
  async updateBalance(id, amount) {
    const [result] = await pool.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * 删除账户
   */
  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM accounts WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 获取资产统计
   */
  async getAssetStats(userId) {
    const [rows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'asset' THEN balance ELSE 0 END) as total_asset,
        SUM(CASE WHEN type = 'liability' THEN balance ELSE 0 END) as total_liability
      FROM accounts 
      WHERE user_id = ? AND status = 1`,
      [userId]
    );
    
    const stats = rows[0];
    return {
      totalAsset: parseFloat(stats.total_asset || 0),
      totalLiability: parseFloat(stats.total_liability || 0),
      netWorth: parseFloat(stats.total_asset || 0) - parseFloat(stats.total_liability || 0)
    };
  }

  /**
   * 按币种获取资产统计
   */
  async getAssetStatsByCurrency(userId) {
    const [rows] = await pool.query(
      `SELECT 
        currency,
        SUM(CASE WHEN type = 'asset' THEN balance ELSE 0 END) as asset_amount,
        SUM(CASE WHEN type = 'liability' THEN balance ELSE 0 END) as liability_amount
      FROM accounts 
      WHERE user_id = ? AND status = 1
      GROUP BY currency`,
      [userId]
    );
    
    return rows.map(row => ({
      currency: row.currency,
      assetAmount: parseFloat(row.asset_amount || 0),
      liabilityAmount: parseFloat(row.liability_amount || 0),
      netAmount: parseFloat(row.asset_amount || 0) - parseFloat(row.liability_amount || 0)
    }));
  }
}

module.exports = new AccountModel();
