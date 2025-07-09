# 🔧 数码商城API文档

## 📋 API概览

数码商城后端API基于RESTful设计原则，提供完整的电商功能支持。

### 🌐 基础信息
- **基础URL**: `http://localhost:3000/api`
- **API版本**: v1.0.0
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 📊 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": "2024-07-08T10:30:00.000Z"
}
```

#### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": [
    // 数据数组
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2024-07-08T10:30:00.000Z"
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "请求参数验证失败",
  "data": null,
  "error_code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "请输入有效的邮箱地址",
      "value": "invalid-email"
    }
  ]
}
```

## 🔐 认证授权

### JWT Token获取
通过用户登录接口获取Token：

```bash
POST /api/user/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "123456"
}
```

### Token使用
在需要认证的接口请求头中添加：

```bash
Authorization: Bearer <your-jwt-token>
```

### Token刷新
Token有效期为24小时，过期后需要重新登录获取新Token。

## 📚 API接口列表

### 👤 用户管理

#### 用户注册
```bash
POST /api/user/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123",
  "phone": "13800138000"
}
```

#### 用户登录
```bash
POST /api/user/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "123456"
}
```

#### 获取用户信息
```bash
GET /api/user/profile
Authorization: Bearer <token>
```

#### 更新用户信息
```bash
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "phone": "13900139000",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### 🛍️ 商品管理

#### 获取商品列表
```bash
GET /api/products?page=1&limit=20&category=phone&keyword=iPhone&sort=newest
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `category`: 分类名称 (可选)
- `keyword`: 搜索关键词 (可选)
- `sort`: 排序方式 (price_asc, price_desc, sales, newest)
- `min_price`: 最低价格 (可选)
- `max_price`: 最高价格 (可选)
- `brand`: 品牌筛选 (可选)

#### 获取商品详情
```bash
GET /api/products/1
```

#### 获取商品分类
```bash
GET /api/categories
```

### 🛒 购物车管理

#### 获取购物车
```bash
GET /api/cart
Authorization: Bearer <token>
```

#### 添加商品到购物车
```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2,
  "selected_specs": {
    "color": "深空黑",
    "storage": "256GB"
  }
}
```

#### 更新购物车商品数量
```bash
PUT /api/cart/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### 删除购物车商品
```bash
DELETE /api/cart/123
Authorization: Bearer <token>
```

## 🔢 状态码说明

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 请求成功处理 |
| 201 | 创建成功 | 用户注册成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未授权 | Token缺失或无效 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 资源不存在 | 商品不存在 |
| 409 | 资源冲突 | 用户名已存在 |
| 422 | 无法处理 | 业务逻辑错误 |
| 429 | 请求过频 | 超出限流阈值 |
| 500 | 服务器错误 | 内部错误 |

## 🚦 错误代码

| 错误代码 | 说明 |
|----------|------|
| VALIDATION_ERROR | 参数验证失败 |
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 禁止访问 |
| NOT_FOUND | 资源不存在 |
| CONFLICT | 资源冲突 |
| DUPLICATE_ENTRY | 数据重复 |
| INVALID_TOKEN | 无效Token |
| TOKEN_EXPIRED | Token已过期 |
| INSUFFICIENT_STOCK | 库存不足 |
| PAYMENT_FAILED | 支付失败 |

## 📝 请求示例

### 完整的商品搜索请求
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&category=phone&keyword=iPhone&sort=price_asc&min_price=5000&max_price=10000" \
  -H "Content-Type: application/json"
```

### 完整的购物车操作流程
```bash
# 1. 用户登录
curl -X POST "http://localhost:3000/api/user/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "123456"
  }'

# 2. 添加商品到购物车
curl -X POST "http://localhost:3000/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "product_id": 1,
    "quantity": 2,
    "selected_specs": {
      "color": "深空黑",
      "storage": "256GB"
    }
  }'

# 3. 查看购物车
curl -X GET "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer <token>"
```

## 🔧 开发工具

### Postman集合
项目提供了完整的Postman集合文件，包含所有API接口的示例请求。

### Swagger文档
访问 `http://localhost:3000/api-docs` 查看交互式API文档。

### 健康检查
```bash
GET /health
```

返回服务器状态信息：
```json
{
  "status": "OK",
  "timestamp": "2024-07-08T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🚀 快速开始

### 1. 启动服务器
```bash
cd server
npm install
npm run dev
```

### 2. 测试API
```bash
# 健康检查
curl http://localhost:3000/health

# 获取商品列表
curl http://localhost:3000/api/products

# 用户登录
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"123456"}'
```

### 3. 查看API文档
打开浏览器访问: http://localhost:3000/api-docs

## 📋 注意事项

### 安全性
- 生产环境必须使用HTTPS
- JWT密钥必须足够复杂且定期更换
- 敏感信息不要记录在日志中
- 实施适当的请求限流

### 性能
- 合理使用分页，避免一次性返回大量数据
- 对频繁查询的接口实施缓存
- 数据库查询优化，添加必要索引

### 兼容性
- API版本控制，向后兼容
- 响应格式保持一致
- 新增字段使用可选参数

### 监控
- 记录关键操作日志
- 监控API响应时间
- 设置异常告警机制

这个API文档为Frontend-Agent提供了完整的接口调用指南！
