# 🔧 Backend API开发规范

## 📋 任务分配 - Backend-Agent

### 🎯 开发目标
基于现有的Express.js架构，扩展和完善以下API接口，实现完整的商城后端服务。

## 🗄️ 数据库结构设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active'
);
```

### 商品表 (products)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id INT,
  brand VARCHAR(100),
  stock INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  images JSON, -- 存储图片URL数组
  specs JSON,  -- 存储规格信息
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 分类表 (categories)
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id INT DEFAULT NULL,
  icon_url VARCHAR(255),
  sort_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active'
);
```

### 购物车表 (cart_items)
```sql
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  selected_specs JSON, -- 选中的规格
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 订单表 (orders)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSON,
  status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 订单商品表 (order_items)
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  selected_specs JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 🔌 API接口规范

### 1. 商品相关API

#### 1.1 获取商品列表
```javascript
// GET /api/products
// 查询参数:
{
  page: 1,           // 页码，默认1
  limit: 20,         // 每页数量，默认20，最大100
  category: 'phone', // 分类筛选，可选
  keyword: 'iPhone', // 搜索关键词，可选
  sort: 'sales',     // 排序方式: price_asc, price_desc, sales, newest
  min_price: 100,    // 最低价格，可选
  max_price: 5000    // 最高价格，可选
}

// 返回结构:
{
  code: 200,
  message: "success",
  data: {
    products: [
      {
        id: 1,
        name: "iPhone 15 Pro",
        description: "最新款iPhone",
        price: 7999.00,
        original_price: 8999.00,
        category: "phone",
        brand: "Apple",
        stock: 50,
        sales_count: 1200,
        images: ["url1.jpg", "url2.jpg"],
        specs: {
          colors: ["深空灰", "银色"],
          storage: ["128GB", "256GB", "512GB"]
        },
        status: "active"
      }
    ],
    pagination: {
      current_page: 1,
      per_page: 20,
      total: 100,
      total_pages: 5
    }
  }
}
```

#### 1.2 获取商品详情
```javascript
// GET /api/product/:id
// 路径参数: id (商品ID)

// 返回结构:
{
  code: 200,
  message: "success",
  data: {
    id: 1,
    name: "iPhone 15 Pro",
    description: "详细的商品描述...",
    price: 7999.00,
    original_price: 8999.00,
    category: {
      id: 1,
      name: "手机"
    },
    brand: "Apple",
    stock: 50,
    sales_count: 1200,
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    specs: {
      colors: [
        { name: "深空灰", code: "#2C2C2C" },
        { name: "银色", code: "#C0C0C0" }
      ],
      storage: [
        { name: "128GB", price_diff: 0 },
        { name: "256GB", price_diff: 800 },
        { name: "512GB", price_diff: 1600 }
      ]
    },
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  }
}
```

### 2. 购物车相关API

#### 2.1 获取购物车
```javascript
// GET /api/cart
// Headers: Authorization: Bearer <token>

// 返回结构:
{
  code: 200,
  message: "success",
  data: {
    items: [
      {
        id: 1,
        product: {
          id: 1,
          name: "iPhone 15 Pro",
          price: 7999.00,
          images: ["url1.jpg"]
        },
        quantity: 2,
        selected_specs: {
          color: "深空灰",
          storage: "256GB"
        },
        subtotal: 15998.00
      }
    ],
    total_quantity: 2,
    total_amount: 15998.00
  }
}
```

#### 2.2 添加商品到购物车
```javascript
// POST /api/cart
// Headers: Authorization: Bearer <token>
// 请求体:
{
  product_id: 1,
  quantity: 2,
  selected_specs: {
    color: "深空灰",
    storage: "256GB"
  }
}

// 返回结构:
{
  code: 200,
  message: "添加成功",
  data: {
    cart_item_id: 123
  }
}
```

#### 2.3 更新购物车商品
```javascript
// PUT /api/cart/:id
// Headers: Authorization: Bearer <token>
// 请求体:
{
  quantity: 3
}

// 返回结构:
{
  code: 200,
  message: "更新成功",
  data: null
}
```

#### 2.4 删除购物车商品
```javascript
// DELETE /api/cart/:id
// Headers: Authorization: Bearer <token>

// 返回结构:
{
  code: 200,
  message: "删除成功",
  data: null
}
```

### 3. 订单相关API

#### 3.1 创建订单
```javascript
// POST /api/order
// Headers: Authorization: Bearer <token>
// 请求体:
{
  cart_item_ids: [1, 2, 3], // 购物车商品ID数组
  shipping_address: {
    name: "张三",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    detail: "科技园南区"
  },
  payment_method: "wechat_pay"
}

// 返回结构:
{
  code: 200,
  message: "订单创建成功",
  data: {
    order_id: 12345,
    order_no: "ORD20240101123456",
    total_amount: 15998.00,
    payment_info: {
      // 支付相关信息
    }
  }
}
```

#### 3.2 获取订单列表
```javascript
// GET /api/orders
// Headers: Authorization: Bearer <token>
// 查询参数:
{
  page: 1,
  limit: 10,
  status: "pending" // 可选: pending, paid, shipped, delivered, cancelled
}

// 返回结构:
{
  code: 200,
  message: "success",
  data: {
    orders: [
      {
        id: 12345,
        order_no: "ORD20240101123456",
        total_amount: 15998.00,
        status: "pending",
        payment_status: "pending",
        created_at: "2024-01-01T00:00:00Z",
        items: [
          {
            product_name: "iPhone 15 Pro",
            quantity: 2,
            price: 7999.00
          }
        ]
      }
    ],
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 5,
      total_pages: 1
    }
  }
}
```

### 4. 用户相关API

#### 4.1 用户注册
```javascript
// POST /api/user/register
// 请求体:
{
  username: "testuser",
  email: "test@example.com",
  password: "password123",
  phone: "13800138000"
}

// 返回结构:
{
  code: 200,
  message: "注册成功",
  data: {
    user_id: 123,
    username: "testuser",
    email: "test@example.com"
  }
}
```

#### 4.2 用户登录
```javascript
// POST /api/user/login
// 请求体:
{
  email: "test@example.com", // 或 username
  password: "password123"
}

// 返回结构:
{
  code: 200,
  message: "登录成功",
  data: {
    user: {
      id: 123,
      username: "testuser",
      email: "test@example.com",
      avatar_url: "avatar.jpg"
    },
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    expires_in: 86400 // 24小时
  }
}
```

#### 4.3 获取用户信息
```javascript
// GET /api/user/profile
// Headers: Authorization: Bearer <token>

// 返回结构:
{
  code: 200,
  message: "success",
  data: {
    id: 123,
    username: "testuser",
    email: "test@example.com",
    phone: "13800138000",
    avatar_url: "avatar.jpg",
    created_at: "2024-01-01T00:00:00Z"
  }
}
```

## 🔐 认证中间件

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '访问令牌缺失'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: '访问令牌无效'
      });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
```

## 📋 Backend-Agent 交付清单

### 必须完成 ✅
- [ ] 完整的Express.js服务器代码
- [ ] 所有API接口实现 (商品、购物车、订单、用户)
- [ ] JWT认证中间件
- [ ] 数据库连接和模型定义
- [ ] 错误处理中间件
- [ ] API文档 (Swagger/OpenAPI)
- [ ] 环境配置文件 (.env.example)

### 可选完成 🔄
- [ ] 数据库迁移脚本
- [ ] 种子数据 (测试数据)
- [ ] API测试用例
- [ ] 日志记录中间件
- [ ] 请求限流中间件

### 技术要求
- **Node.js版本**: >= 16.0.0
- **数据库**: MySQL 8.0 或 PostgreSQL 13+
- **认证方式**: JWT Token
- **文档工具**: Swagger UI
- **测试工具**: Jest + Supertest (可选)

Backend-Agent请按照这个规范开始开发！
