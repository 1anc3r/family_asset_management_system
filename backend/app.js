const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const { testConnection } = require('./config/database');

// 导入路由
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');
const categoryRoutes = require('./routes/category');
const billRoutes = require('./routes/bill');
const dashboardRoutes = require('./routes/dashboard');
const statisticsRoutes = require('./routes/statistics');
const budgetRoutes = require('./routes/budget');
const currencyRoutes = require('./routes/currency');
const exportRoutes = require('./routes/export');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/user', userRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/backup', backupRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误：', err);
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: null });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`=================================`);
  console.log(`家庭资产管理记账系统后端服务`);
  console.log(`=================================`);
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================`);
  
  // 测试数据库连接
  await testConnection();
});

module.exports = app;
