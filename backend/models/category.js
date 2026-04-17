const { pool } = require('../config/database');

class CategoryModel {
  /**
   * 获取用户的所有分类
   */
  async getAllByUserId(userId, type = null) {
    let sql = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [userId];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY sort, create_time DESC';
    
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * 根据ID获取分类
   */
  async getById(id, userId) {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  /**
   * 创建分类
   */
  async create(userId, data) {
    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type, icon, sort, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, data.name, data.type, data.icon || '', data.sort || 0, data.status !== undefined ? data.status : 1]
    );
    return result.insertId;
  }

  /**
   * 更新分类
   */
  async update(id, userId, data) {
    const fields = [];
    const values = [];
    
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    
    if (data.sort !== undefined) {
      fields.push('sort = ?');
      values.push(data.sort);
    }
    
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id, userId);
    
    const [result] = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }

  /**
   * 删除分类
   */
  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 初始化默认分类
   */
  async initDefaultCategories(userId) {
    // 获取默认分类
    const [defaults] = await pool.query('SELECT * FROM default_categories');
    
    for (const item of defaults) {
      await this.create(userId, {
        name: item.name,
        type: item.type,
        icon: item.icon,
        sort: 0,
        status: 1
      });
    }
  }
}

module.exports = new CategoryModel();
