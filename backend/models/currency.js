const { pool } = require('../config/database');

class CurrencyModel {
  /**
   * 获取所有支持的币种
   */
  async getAllCurrencies() {
    const [rows] = await pool.execute(
      `SELECT DISTINCT from_currency as code FROM exchange_rates ORDER BY from_currency`
    );
    
    const currencyNames = {
      'CNY': '人民币',
      'USD': '美元',
      'EUR': '欧元',
      'JPY': '日元',
      'HKD': '港币',
      'GBP': '英镑'
    };
    
    return rows.map(row => ({
      code: row.code,
      name: currencyNames[row.code] || row.code
    }));
  }

  /**
   * 获取汇率
   */
  async getRate(fromCurrency, toCurrency) {
    // 如果币种相同，汇率为1
    if (fromCurrency === toCurrency) {
      return 1;
    }
    
    const [rows] = await pool.execute(
      'SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?',
      [fromCurrency, toCurrency]
    );
    
    if (rows.length > 0) {
      return parseFloat(rows[0].rate);
    }
    
    // 尝试反向查找并计算
    const [reverseRows] = await pool.execute(
      'SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?',
      [toCurrency, fromCurrency]
    );
    
    if (reverseRows.length > 0) {
      return 1 / parseFloat(reverseRows[0].rate);
    }
    
    return null;
  }

  /**
   * 金额转换
   */
  async convert(amount, fromCurrency, toCurrency) {
    const rate = await this.getRate(fromCurrency, toCurrency);
    if (rate === null) {
      throw new Error(`无法获取 ${fromCurrency} 到 ${toCurrency} 的汇率`);
    }
    return amount * rate;
  }

  /**
   * 更新汇率
   */
  async updateRate(fromCurrency, toCurrency, rate) {
    const [result] = await pool.execute(
      `INSERT INTO exchange_rates (from_currency, to_currency, rate) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rate = ?, update_time = NOW()`,
      [fromCurrency, toCurrency, rate, rate]
    );
    return result.affectedRows > 0;
  }

  /**
   * 获取所有汇率
   */
  async getAllRates() {
    const [rows] = await pool.execute(
      'SELECT * FROM exchange_rates ORDER BY from_currency, to_currency'
    );
    return rows;
  }
}

module.exports = new CurrencyModel();
