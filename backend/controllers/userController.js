const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const UserModel = require('../models/user');
const CategoryModel = require('../models/category');
const { success, error } = require('../utils/response');
const { secret, expiresIn } = require('../config/jwt');

class UserController {
  /**
   * 用户注册校验规则
   */
  static registerValidation = [
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('用户名长度应为3-20个字符'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为6个字符'),
    body('nickname')
      .optional()
      .isLength({ max: 50 })
      .withMessage('昵称长度不能超过50个字符')
  ];

  /**
   * 用户登录校验规则
   */
  static loginValidation = [
    body('username')
      .notEmpty()
      .withMessage('用户名不能为空'),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
  ];

  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      const { username, password, nickname } = req.body;

      // 检查用户名是否已存在
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return error(res, '用户名已存在', 400);
      }

      // 创建用户
      const userId = await UserModel.create(username, password, nickname);

      // 初始化默认分类
      await CategoryModel.initDefaultCategories(userId);

      success(res, { userId }, '注册成功');
    } catch (err) {
      console.error('注册失败：', err);
      error(res, '注册失败，请稍后重试');
    }
  }

  /**
   * 用户登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return error(res, '用户名或密码错误', 401);
      }

      // 验证密码
      const isValid = await UserModel.verifyPassword(password, user.password);
      if (!isValid) {
        return error(res, '用户名或密码错误', 401);
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        secret,
        { expiresIn }
      );

      success(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname
        }
      }, '登录成功');
    } catch (err) {
      console.error('登录失败：', err);
      error(res, '登录失败，请稍后重试');
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return error(res, '用户不存在', 404);
      }
      success(res, user);
    } catch (err) {
      console.error('获取用户信息失败：', err);
      error(res, '获取用户信息失败');
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      // 获取用户信息
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return error(res, '用户不存在', 404);
      }

      // 验证旧密码
      const isValid = await UserModel.verifyPassword(oldPassword, user.password);
      if (!isValid) {
        return error(res, '原密码错误', 400);
      }

      // 更新密码
      await UserModel.update(req.userId, { password: newPassword });

      success(res, null, '密码修改成功');
    } catch (err) {
      console.error('修改密码失败：', err);
      error(res, '修改密码失败');
    }
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(req, res) {
    try {
      const { nickname } = req.body;
      await UserModel.update(req.userId, { nickname });
      success(res, null, '更新成功');
    } catch (err) {
      console.error('更新用户信息失败：', err);
      error(res, '更新失败');
    }
  }
}

module.exports = UserController;
