# 🔧 Backend-Agent 任务执行单

## 📋 任务概述
**任务ID**: BE-001
**负责人**: Backend-Agent
**优先级**: 🔴 高
**开始时间**: UI-Agent完成后立即开始
**截止时间**: Day 3 结束
**状态**: ⏳ 等待开始

## 🎯 具体任务要求

### 1. 扩展现有Express.js架构

基于当前的`server/app.js`，扩展以下API接口：

#### 1.1 商品API增强
```javascript
// 现有基础上增强以下功能：

// GET /api/products - 增强版商品列表
// 新增功能：
// - 分页支持 (page, limit)
// - 高级筛选 (price_range, brand, specs)
// - 排序功能 (price, sales, newest)
// - 搜索优化 (模糊搜索、搜索建议)

// GET /api/product/:id - 增强版商品详情
// 新增功能：
// - 完整规格信息
// - 库存实时查询
// - 相关商品推荐
// - 商品评价统计
```

#### 1.2 用户认证系统
```javascript
// POST /api/user/register - 用户注册
// 功能要求：
// - 邮箱/用户名唯一性验证
// - 密码强度验证
// - 邮箱验证码发送
// - 用户信息加密存储

// POST /api/user/login - 用户登录
// 功能要求：
// - 支持邮箱/用户名登录
// - JWT Token生成
// - 登录失败次数限制
// - 记住登录状态

// GET /api/user/profile - 用户信息
// 功能要求：
// - Token验证中间件
// - 用户信息脱敏返回
// - 权限控制
```

#### 1.3 购物车系统优化
```javascript
// 基于现有购物车API，增强以下功能：

// POST /api/cart - 智能添加购物车
// 新增功能：
// - 规格冲突检测
// - 库存验证
// - 相同商品合并
// - 购物车数量限制

// PUT /api/cart/:id - 更新购物车
// 新增功能：
// - 批量更新支持
// - 规格变更处理
// - 价格实时计算

// GET /api/cart/summary - 购物车摘要
// 新增功能：
// - 总价计算
// - 优惠券适用
// - 运费计算
// - 库存状态检查
```

#### 1.4 订单系统开发
```javascript
// POST /api/order - 创建订单
// 功能要求：
// - 购物车商品验证
// - 库存扣减
// - 订单号生成
// - 地址信息验证
// - 支付信息准备

// GET /api/orders - 订单列表
// 功能要求：
// - 分页查询
// - 状态筛选
// - 时间范围筛选
// - 订单搜索

// GET /api/order/:id - 订单详情
// 功能要求：
// - 完整订单信息
// - 物流信息
// - 支付状态
// - 操作权限验证

// PUT /api/order/:id/status - 更新订单状态
// 功能要求：
// - 状态流转验证
// - 权限控制
// - 状态变更通知
```

### 2. 数据库设计实现

#### 2.1 数据表创建
```sql
-- 请实现以下数据表：

-- 用户表 (users)
-- 商品表 (products) 
-- 分类表 (categories)
-- 购物车表 (cart_items)
-- 订单表 (orders)
-- 订单商品表 (order_items)
-- 用户地址表 (user_addresses)
```

#### 2.2 数据关系设计
- 外键约束设置
- 索引优化
- 数据完整性保证

### 3. 中间件开发

#### 3.1 认证中间件
```javascript
// middleware/auth.js
// 功能要求：
// - JWT Token验证
// - 用户权限检查
// - Token刷新机制
// - 登录状态维护
```

#### 3.2 验证中间件
```javascript
// middleware/validation.js
// 功能要求：
// - 请求参数验证
// - 数据格式检查
// - 业务规则验证
// - 错误信息标准化
```

#### 3.3 错误处理中间件
```javascript
// middleware/errorHandler.js
// 功能要求：
// - 统一错误响应格式
// - 错误日志记录
// - 敏感信息过滤
// - HTTP状态码规范
```

### 4. API文档生成

#### 4.1 Swagger集成
```javascript
// 使用swagger-jsdoc和swagger-ui-express
// 为所有API生成完整文档
// 包含：请求参数、响应格式、错误码说明
```

## 📋 交付清单

### 必须交付 ✅
- [ ] `backend/server/app.js` - 扩展后的主服务器文件
- [ ] `backend/routes/` - 所有路由文件
- [ ] `backend/middleware/` - 中间件文件
- [ ] `backend/models/` - 数据模型文件
- [ ] `backend/database/` - 数据库脚本
- [ ] `backend/docs/api.md` - API文档
- [ ] `backend/.env.example` - 环境配置示例
- [ ] `backend/package.json` - 依赖配置

### 可选交付 🔄
- [ ] 单元测试文件
- [ ] 数据库种子文件
- [ ] Docker配置
- [ ] 部署脚本

## 🔧 技术要求

### 依赖包要求
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "mysql2": "^3.6.0",
    "joi": "^17.9.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1"
  }
}
```

### 代码规范
- 使用ES6+语法
- 遵循RESTful API设计原则
- 统一的错误处理
- 完整的注释文档
- 安全性最佳实践

## 🔄 进度报告要求

请每天更新进度：

**每日报告格式**:
```
📅 日期: [日期]
📈 总进度: [完成百分比]
✅ 今日完成:
  - [具体完成的API接口]
  - [完成的功能模块]
🎯 明日计划:
  - [计划开发的内容]
🚫 遇到问题:
  - [技术问题或阻塞]
💡 需要支持:
  - [需要其他Agent配合的地方]
```

## 🚨 重要提醒

1. **API兼容性**: 确保新API与现有前端代码兼容
2. **性能考虑**: 数据库查询优化，响应时间<500ms
3. **安全性**: 所有用户输入必须验证，防止SQL注入
4. **文档完整**: Frontend-Agent需要详细的API文档
5. **测试验证**: 提供Postman测试集合

---

**@Backend-Agent 请在UI-Agent完成后立即确认并开始执行！**

预计开始时间: ___________
预计完成时间: ___________
技术方案确认: ___________
