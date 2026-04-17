-- ============================================
-- 家庭资产管理记账系统 - 数据库初始化脚本
-- 数据库: family_asset
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS family_asset DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_asset_management;

-- ============================================
-- 1. 用户表
-- ============================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(100) NOT NULL COMMENT '密码（加密存储）',
  nickname VARCHAR(50) COMMENT '昵称',
  base_currency VARCHAR(10) DEFAULT 'CNY' COMMENT '基础币种',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 资产账户表（现金、银行卡、理财等）
-- ============================================
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '账户ID',
  user_id INT NOT NULL COMMENT '用户ID',
  name VARCHAR(50) NOT NULL COMMENT '账户名称：招商银行、微信零钱',
  type VARCHAR(20) NOT NULL COMMENT '账户类型：asset=资产, liability=负债',
  balance DECIMAL(12,2) DEFAULT 0.00 COMMENT '当前余额',
  currency VARCHAR(10) DEFAULT 'CNY' COMMENT '币种',
  icon VARCHAR(50) COMMENT '图标',
  status INT DEFAULT 1 COMMENT '状态：1=启用 0=禁用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产账户表';

-- ============================================
-- 3. 收支分类表
-- ============================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  user_id INT NOT NULL COMMENT '用户ID',
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  type VARCHAR(20) NOT NULL COMMENT '类型：income=收入, expense=支出',
  icon VARCHAR(50) COMMENT '图标',
  sort INT DEFAULT 0 COMMENT '排序',
  status INT DEFAULT 1 COMMENT '状态：1=启用 0=禁用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_type (user_id, type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收支分类表';

-- ============================================
-- 4. 账单表（核心）
-- ============================================
DROP TABLE IF EXISTS bills;
CREATE TABLE bills (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '账单ID',
  user_id INT NOT NULL COMMENT '用户ID',
  type VARCHAR(20) NOT NULL COMMENT '类型：income=收入, expense=支出, transfer=转账',
  amount DECIMAL(12,2) NOT NULL COMMENT '金额',
  currency VARCHAR(10) DEFAULT 'CNY' COMMENT '币种',
  account_id INT NOT NULL COMMENT '关联账户ID',
  to_account_id INT DEFAULT NULL COMMENT '转账目标账户ID',
  category_id INT DEFAULT NULL COMMENT '分类ID',
  remark VARCHAR(200) COMMENT '备注',
  bill_time DATETIME NOT NULL COMMENT '账单时间',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_user_time (user_id, bill_time),
  INDEX idx_type (type),
  INDEX idx_account (account_id),
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='账单表';

-- ============================================
-- 5. 系统默认分类（初始化数据）
-- ============================================
DROP TABLE IF EXISTS default_categories;
CREATE TABLE default_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  type VARCHAR(20) NOT NULL COMMENT '类型：income=收入, expense=支出',
  icon VARCHAR(50) COMMENT '图标'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统默认分类表';

-- 插入默认支出分类
INSERT INTO default_categories (name, type, icon) VALUES
('餐饮', 'expense', 'Food'),
('交通', 'expense', 'Bicycle'),
('购物', 'expense', 'ShoppingBag'),
('娱乐', 'expense', 'Film'),
('医疗', 'expense', 'FirstAidKit'),
('教育', 'expense', 'Reading'),
('居住', 'expense', 'House'),
('通讯', 'expense', 'Phone'),
('美容', 'expense', 'MagicStick'),
('旅游', 'expense', 'MapLocation'),
('人情', 'expense', 'UserFilled'),
('其他', 'expense', 'MoreFilled');

-- 插入默认收入分类
INSERT INTO default_categories (name, type, icon) VALUES
('工资', 'income', 'Money'),
('奖金', 'income', 'Ticket'),
('兼职', 'income', 'Briefcase'),
('理财收益', 'income', 'TrendCharts'),
('红包', 'income', 'Present'),
('其他', 'income', 'MoreFilled');

-- ============================================
-- 6. 资产统计日志表
-- ============================================
DROP TABLE IF EXISTS asset_logs;
CREATE TABLE asset_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  user_id INT NOT NULL COMMENT '用户ID',
  total_asset DECIMAL(12,2) DEFAULT 0.00 COMMENT '总资产',
  total_liability DECIMAL(12,2) DEFAULT 0.00 COMMENT '总负债',
  net_worth DECIMAL(12,2) DEFAULT 0.00 COMMENT '净资产',
  record_time DATE NOT NULL COMMENT '记录日期',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, record_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产统计日志表';

-- ============================================
-- 7. 预算表（新增）
-- ============================================
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '预算ID',
  user_id INT NOT NULL COMMENT '用户ID',
  category_id INT DEFAULT NULL COMMENT '分类ID（NULL表示总预算）',
  amount DECIMAL(12,2) NOT NULL COMMENT '预算金额',
  period_type VARCHAR(20) DEFAULT 'month' COMMENT '周期类型：month=月度, year=年度',
  `year_month` VARCHAR(7) NOT NULL COMMENT '预算年月：2024-01',
  alert_threshold INT DEFAULT 80 COMMENT '预警阈值（百分比）',
  `status` INT DEFAULT 1 COMMENT '状态：1=启用 0=禁用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_category_month (user_id, category_id, `year_month`),
  INDEX idx_year_month (`year_month`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COMMENT='预算表';

-- ============================================
-- 8. 币种汇率表（新增）
-- ============================================
DROP TABLE IF EXISTS exchange_rates;
CREATE TABLE exchange_rates (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '汇率ID',
  from_currency VARCHAR(10) NOT NULL COMMENT '源币种',
  to_currency VARCHAR(10) NOT NULL COMMENT '目标币种',
  rate DECIMAL(15,6) NOT NULL COMMENT '汇率',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_currency_pair (from_currency, to_currency),
  INDEX idx_update_time (update_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='汇率表';

-- 插入常用汇率（以CNY为基准）
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('CNY', 'CNY', 1.000000),
('CNY', 'USD', 0.138500),
('CNY', 'EUR', 0.128000),
('CNY', 'JPY', 20.850000),
('CNY', 'HKD', 1.082000),
('CNY', 'GBP', 0.109000),
('USD', 'CNY', 7.220000),
('EUR', 'CNY', 7.810000),
('JPY', 'CNY', 0.048000),
('HKD', 'CNY', 0.924000),
('GBP', 'CNY', 9.170000);

-- ============================================
-- 9. 数据备份记录表（新增）
-- ============================================
DROP TABLE IF EXISTS backup_logs;
CREATE TABLE backup_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '备份ID',
  user_id INT NOT NULL COMMENT '用户ID',
  file_name VARCHAR(200) NOT NULL COMMENT '备份文件名',
  file_size INT DEFAULT 0 COMMENT '文件大小（字节）',
  data_count INT DEFAULT 0 COMMENT '数据条数',
  backup_type VARCHAR(20) DEFAULT 'manual' COMMENT '备份类型：manual=手动, auto=自动',
  remark VARCHAR(200) COMMENT '备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_time (user_id, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据备份记录表';

-- ============================================
-- 完成
-- ============================================
SELECT '数据库初始化完成！' AS message;
