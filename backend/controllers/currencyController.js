const CurrencyModel = require('../models/currency');
const { success, error } = require('../utils/response');

class CurrencyController {
  /**
   * 获取所有支持的币种
   */
  static async getCurrencies(req, res) {
    try {
      const currencies = await CurrencyModel.getAllCurrencies();
      success(res, { list: currencies });
    } catch (err) {
      console.error('获取币种列表失败：', err);
      error(res, '获取币种列表失败');
    }
  }

  /**
   * 获取所有汇率
   */
  static async getRates(req, res) {
    try {
      const rates = await CurrencyModel.getAllRates();
      success(res, { list: rates });
    } catch (err) {
      console.error('获取汇率失败：', err);
      error(res, '获取汇率失败');
    }
  }

  /**
   * 汇率转换
   */
  static async convert(req, res) {
    try {
      const { amount, from, to } = req.query;
      
      if (!amount || !from || !to) {
        return error(res, '缺少必要参数', 400);
      }
      
      const result = await CurrencyModel.convert(
        parseFloat(amount),
        from,
        to
      );
      
      success(res, {
        original_amount: parseFloat(amount),
        original_currency: from,
        converted_amount: result,
        target_currency: to,
        rate: result / parseFloat(amount)
      });
    } catch (err) {
      console.error('汇率转换失败：', err);
      error(res, err.message || '汇率转换失败');
    }
  }

  /**
   * 获取汇率
   */
  static async getRate(req, res) {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return error(res, '缺少必要参数', 400);
      }
      
      const rate = await CurrencyModel.getRate(from, to);
      
      if (rate === null) {
        return error(res, '未找到该货币对的汇率', 404);
      }
      
      success(res, { from, to, rate });
    } catch (err) {
      console.error('获取汇率失败：', err);
      error(res, '获取汇率失败');
    }
  }

  /**
   * 更新汇率（管理员功能）
   */
  static async updateRate(req, res) {
    try {
      const { from_currency, to_currency, rate } = req.body;
      
      if (!from_currency || !to_currency || !rate) {
        return error(res, '缺少必要参数', 400);
      }
      
      const success_result = await CurrencyModel.updateRate(
        from_currency,
        to_currency,
        parseFloat(rate)
      );
      
      if (success_result) {
        success(res, null, '汇率更新成功');
      } else {
        error(res, '汇率更新失败');
      }
    } catch (err) {
      console.error('更新汇率失败：', err);
      error(res, '更新汇率失败');
    }
  }
}

module.exports = CurrencyController;
