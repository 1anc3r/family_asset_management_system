# 家庭资产管理记账系统

一个面向个人/家庭的轻量级资产管理工具，支持日常记账、资产统计、收支分析、资产负债管理、预算管理、多币种支持，无需复杂配置，开箱即用。

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Element Plus** - 基于 Vue 3 的组件库
- **Pinia** - Vue 状态管理方案
- **ECharts** - 数据可视化图表库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MySQL 8.0+** - 关系型数据库
- **JWT** - JSON Web Token 身份验证
- **bcryptjs** - 密码加密
- **json2csv** - CSV 导出
- **multer** - 文件上传

## 功能特性

### 核心功能
1. **用户管理** - 注册、登录、个人信息管理
2. **记账功能** - 支持收入、支出、转账三种类型
3. **资产管理** - 现金、银行卡、理财、负债等账户管理
4. **分类管理** - 自定义收支分类，支持图标和排序
5. **账单管理** - 查看、筛选、编辑、删除账单记录
6. **统计分析** - 收支图表、分类占比、月度趋势
7. **仪表盘** - 资产概览、今日/本月收支、近期账单

### 新增高级功能
8. **预算管理** - 设置月度/年度预算，实时监控预算执行情况
9. **多币种支持** - 支持人民币、美元、欧元、日元等多种币种
10. **数据导入导出** - 导出CSV格式数据，支持账单、账户、分类导出
11. **数据备份恢复** - 一键备份和恢复所有数据

### 特色功能
- 响应式设计，支持 PC 和移动端
- 快捷金额选择，快速记账
- 账户余额自动同步
- 分类启用/禁用管理
- 多维度数据筛选
- 预算超支预警
- 汇率实时转换

## 项目结构

```
family-asset-app/
├── backend/                # 后端项目
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── middleware/        # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── utils/             # 工具函数
│   ├── backups/           # 备份文件目录
│   ├── uploads/           # 上传文件目录
│   ├── app.js             # 入口文件
│   ├── database.sql       # 数据库初始化脚本
│   └── package.json
│
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── api/          # API 接口
│   │   ├── components/   # 公共组件
│   │   ├── router/       # 路由配置
│   │   ├── store/        # Pinia 状态管理
│   │   ├── utils/        # 工具函数
│   │   ├── views/        # 页面组件
│   │   ├── App.vue       # 根组件
│   │   └── main.js       # 入口文件
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目

```bash
cd family-asset-app
```

### 2. 数据库配置

1. 创建数据库
```bash
mysql -u root -p
```

2. 导入 SQL 文件
```bash
mysql -u root -p family_asset < backend/database.sql
```

### 3. 后端配置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库连接
编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=family_asset
JWT_SECRET=your_jwt_secret_key（打开浏览器控制台（F12 → Console），粘贴运行：crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')）
PORT=3000
```

4. 启动后端服务
```bash
npm start
# 或开发模式
npm run dev
```

后端服务默认运行在 http://localhost:3000

### 4. 前端配置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动前端服务
```bash
npm run dev
```

前端服务默认运行在 http://localhost:5174

### 5. 访问应用

打开浏览器访问 http://localhost:5174

首次使用需要注册账号。

## 核心 API 接口

### 用户模块
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `PUT /api/user/password` - 修改密码

### 账户模块
- `GET /api/account/list` - 获取账户列表
- `GET /api/account/stats` - 获取资产统计
- `POST /api/account/add` - 创建账户
- `PUT /api/account/:id` - 更新账户
- `DELETE /api/account/:id` - 删除账户

### 分类模块
- `GET /api/category/list` - 获取分类列表
- `POST /api/category/add` - 创建分类
- `PUT /api/category/:id` - 更新分类
- `DELETE /api/category/:id` - 删除分类

### 账单模块
- `GET /api/bill/list` - 获取账单列表
- `GET /api/bill/:id` - 获取账单详情
- `POST /api/bill/add` - 创建账单
- `PUT /api/bill/:id` - 更新账单
- `DELETE /api/bill/:id` - 删除账单
- `GET /api/bill/today` - 获取今日收支
- `GET /api/bill/month` - 获取本月收支

### 预算模块
- `GET /api/budget/list` - 获取预算列表
- `GET /api/budget/execution` - 获取预算执行情况
- `POST /api/budget/add` - 创建预算
- `PUT /api/budget/:id` - 更新预算
- `DELETE /api/budget/:id` - 删除预算
- `POST /api/budget/copy-from-last-month` - 复制上月预算

### 币种模块
- `GET /api/currency/list` - 获取币种列表
- `GET /api/currency/rates` - 获取汇率列表
- `GET /api/currency/convert` - 汇率转换
- `GET /api/currency/rate` - 获取汇率

### 导出模块
- `GET /api/export/bills` - 导出账单
- `GET /api/export/accounts` - 导出账户
- `GET /api/export/categories` - 导出分类

### 备份模块
- `POST /api/backup/create` - 创建备份
- `GET /api/backup/logs` - 获取备份记录
- `POST /api/backup/restore` - 恢复数据
- `DELETE /api/backup/logs/:id` - 删除备份记录

### 统计模块
- `GET /api/dashboard` - 获取仪表盘数据
- `GET /api/statistics/category` - 获取分类统计
- `GET /api/statistics/monthly` - 获取月度趋势
- `GET /api/statistics/account` - 获取账户统计

## 数据库表结构

### 1. users - 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(100) | 密码（加密） |
| nickname | VARCHAR(50) | 昵称 |
| base_currency | VARCHAR(10) | 基础币种 |
| create_time | DATETIME | 创建时间 |

### 2. accounts - 资产账户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| name | VARCHAR(50) | 账户名称 |
| type | VARCHAR(20) | 类型：asset/liability |
| balance | DECIMAL(12,2) | 余额 |
| currency | VARCHAR(10) | 币种 |
| icon | VARCHAR(50) | 图标 |
| status | INT | 状态：1启用/0禁用 |

### 3. categories - 收支分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| name | VARCHAR(50) | 分类名称 |
| type | VARCHAR(20) | 类型：income/expense |
| icon | VARCHAR(50) | 图标 |
| sort | INT | 排序 |
| status | INT | 状态：1启用/0禁用 |

### 4. bills - 账单表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| type | VARCHAR(20) | 类型：income/expense/transfer |
| amount | DECIMAL(12,2) | 金额 |
| currency | VARCHAR(10) | 币种 |
| account_id | INT | 账户ID |
| to_account_id | INT | 目标账户ID（转账） |
| category_id | INT | 分类ID |
| remark | VARCHAR(200) | 备注 |
| bill_time | DATETIME | 账单时间 |

### 5. budgets - 预算表（新增）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| category_id | INT | 分类ID（NULL表示总预算） |
| amount | DECIMAL(12,2) | 预算金额 |
| period_type | VARCHAR(20) | 周期类型：month/year |
| year_month | VARCHAR(7) | 预算年月 |
| alert_threshold | INT | 预警阈值（百分比） |
| status | INT | 状态：1启用/0禁用 |

### 6. exchange_rates - 汇率表（新增）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| from_currency | VARCHAR(10) | 源币种 |
| to_currency | VARCHAR(10) | 目标币种 |
| rate | DECIMAL(15,6) | 汇率 |
| update_time | DATETIME | 更新时间 |

### 7. backup_logs - 备份记录表（新增）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| file_name | VARCHAR(200) | 备份文件名 |
| file_size | INT | 文件大小 |
| data_count | INT | 数据条数 |
| backup_type | VARCHAR(20) | 备份类型 |
| remark | VARCHAR(200) | 备注 |
| create_time | DATETIME | 创建时间 |

## 界面预览

### 登录页面
简洁的登录界面，支持用户注册。

### 首页仪表盘
- 净资产、总资产、总负债卡片
- 今日/本月收支概览
- 资产分布饼图
- 近期账单列表
- 账户列表

### 记账页面
- 类型选择（收入/支出/转账）
- 金额输入，支持快捷金额
- 账户选择（支持多币种）
- 分类选择
- 日期和备注

### 账单列表
- 多条件筛选
- 分页展示
- 编辑和删除操作

### 资产管理
- 资产和负债分开展示
- 多币种账户管理
- 账户启用/禁用
- 余额实时显示

### 分类管理
- 收入/支出分类
- 自定义图标和排序
- 启用/禁用管理

### 预算管理
- 设置总预算和分类预算
- 预算执行进度可视化
- 超支预警提示
- 复制上月预算功能

### 统计分析
- 支出分类占比饼图
- 月度收支趋势柱状图
- 分类排行表格

### 数据管理
- 数据导出（CSV格式）
- 数据导入（JSON备份）
- 一键备份和恢复
- 汇率查询和转换

## 开发计划

- [x] 基础架构搭建
- [x] 用户认证模块
- [x] 记账核心功能
- [x] 资产管理功能
- [x] 分类管理功能
- [x] 统计分析功能
- [x] 响应式界面
- [x] 预算管理
- [x] 多币种支持
- [x] 数据导入导出
- [x] 数据备份恢复
- [ ] 自动汇率更新
- [ ] 定期自动备份
- [ ] 数据同步（多端）

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。

---

**家庭资产管理记账系统** - 让家庭财务管理更简单！
