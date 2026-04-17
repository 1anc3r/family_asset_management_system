const { body } = require('express-validator');
const CategoryModel = require('../models/category');
const { success, error } = require('../utils/response');

class CategoryController {
  /**
   * 创建分类校验规则
   */
  static createValidation = [
    body('name')
      .notEmpty()
      .withMessage('分类名称不能为空'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('分类类型必须是 income 或 expense')
  ];

  /**
   * 获取分类列表
   */
  static async getList(req, res) {
    try {
      const { type } = req.query;
      const categories = await CategoryModel.getAllByUserId(req.userId, type);
      
      // 按类型分组
      const income = categories.filter(c => c.type === 'income');
      const expense = categories.filter(c => c.type === 'expense');
      
      success(res, {
        list: categories,
        income,
        expense
      });
    } catch (err) {
      console.error('获取分类列表失败：', err);
      error(res, '获取分类列表失败');
    }
  }

  /**
   * 创建分类
   */
  static async create(req, res) {
    try {
      const data = req.body;
      const categoryId = await CategoryModel.create(req.userId, data);
      success(res, { categoryId }, '创建成功');
    } catch (err) {
      console.error('创建分类失败：', err);
      error(res, '创建分类失败');
    }
  }

  /**
   * 更新分类
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const success_result = await CategoryModel.update(id, req.userId, data);
      if (!success_result) {
        return error(res, '分类不存在或更新失败', 404);
      }
      
      success(res, null, '更新成功');
    } catch (err) {
      console.error('更新分类失败：', err);
      error(res, '更新分类失败');
    }
  }

  /**
   * 删除分类
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success_result = await CategoryModel.delete(id, req.userId);
      if (!success_result) {
        return error(res, '分类不存在或删除失败', 404);
      }
      
      success(res, null, '删除成功');
    } catch (err) {
      console.error('删除分类失败：', err);
      error(res, '删除分类失败');
    }
  }
}

module.exports = CategoryController;
