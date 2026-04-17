const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  /**
   * 根据用户名查找用户
   */
  async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  /**
   * 根据ID查找用户
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, create_time FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * 创建用户
   */
  async create(username, password, nickname = null) {
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname || username]
    );
    
    return result.insertId;
  }

  /**
   * 验证密码
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * 更新用户信息
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.nickname !== undefined) {
      fields.push('nickname = ?');
      values.push(data.nickname);
    }
    
    if (data.password) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(data.password, 10));
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new UserModel();
