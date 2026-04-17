const { Parser } = require('json2csv');
const moment = require('moment');
const BillModel = require('../models/bill');
const AccountModel = require('../models/account');
const CategoryModel = require('../models/category');
const { success, error } = require('../utils/response');

class ExportController {
  /**
   * 导出账单为CSV
   */
  static async exportBills(req, res) {
    try {
      const { start_date, end_date, type } = req.query;
      
      // 获取账单数据
      const bills = await BillModel.getList(req.userId, {
        start_date,
        end_date,
        type,
        page: 1,
        pageSize: 10000 // 最多导出10000条
      });
      
      if (bills.length === 0) {
        return error(res, '没有可导出的数据', 400);
      }
      
      // 定义CSV字段
      const fields = [
        { label: 'ID', value: 'id' },
        { label: '类型', value: row => row.type === 'income' ? '收入' : row.type === 'expense' ? '支出' : '转账' },
        { label: '金额', value: 'amount' },
        { label: '币种', value: 'currency' },
        { label: '分类', value: 'category_name' },
        { label: '账户', value: 'account_name' },
        { label: '目标账户', value: 'to_account_name' },
        { label: '备注', value: 'remark' },
        { label: '账单时间', value: 'bill_time' },
        { label: '创建时间', value: 'create_time' }
      ];
      
      const parser = new Parser({ fields, withBOM: true });
      const csv = parser.parse(bills);
      
      // 设置响应头
      const filename = `bills_${moment().format('YYYYMMDD_HHmmss')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.send(csv);
    } catch (err) {
      console.error('导出账单失败：', err);
      error(res, '导出账单失败');
    }
  }

  /**
   * 导出账户为CSV
   */
  static async exportAccounts(req, res) {
    try {
      const accounts = await AccountModel.getAllByUserId(req.userId);
      
      if (accounts.length === 0) {
        return error(res, '没有可导出的数据', 400);
      }
      
      const fields = [
        { label: 'ID', value: 'id' },
        { label: '名称', value: 'name' },
        { label: '类型', value: row => row.type === 'asset' ? '资产' : '负债' },
        { label: '余额', value: 'balance' },
        { label: '币种', value: 'currency' },
        { label: '图标', value: 'icon' },
        { label: '状态', value: row => row.status === 1 ? '启用' : '禁用' },
        { label: '创建时间', value: 'create_time' }
      ];
      
      const parser = new Parser({ fields, withBOM: true });
      const csv = parser.parse(accounts);
      
      const filename = `accounts_${moment().format('YYYYMMDD_HHmmss')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.send(csv);
    } catch (err) {
      console.error('导出账户失败：', err);
      error(res, '导出账户失败');
    }
  }

  /**
   * 导出分类为CSV
   */
  static async exportCategories(req, res) {
    try {
      const categories = await CategoryModel.getAllByUserId(req.userId);
      
      if (categories.length === 0) {
        return error(res, '没有可导出的数据', 400);
      }
      
      const fields = [
        { label: 'ID', value: 'id' },
        { label: '名称', value: 'name' },
        { label: '类型', value: row => row.type === 'income' ? '收入' : '支出' },
        { label: '图标', value: 'icon' },
        { label: '排序', value: 'sort' },
        { label: '状态', value: row => row.status === 1 ? '启用' : '禁用' },
        { label: '创建时间', value: 'create_time' }
      ];
      
      const parser = new Parser({ fields, withBOM: true });
      const csv = parser.parse(categories);
      
      const filename = `categories_${moment().format('YYYYMMDD_HHmmss')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.send(csv);
    } catch (err) {
      console.error('导出分类失败：', err);
      error(res, '导出分类失败');
    }
  }
}

module.exports = ExportController;
