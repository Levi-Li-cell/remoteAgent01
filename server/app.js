const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 模拟数据库
let products = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 7999,
    image: 'https://via.placeholder.com/300x300?text=iPhone15Pro',
    description: '最新款iPhone，搭载A17 Pro芯片',
    category: 'phone',
    stock: 50,
    sales: 1200
  },
  {
    id: 2,
    name: 'MacBook Pro M3',
    price: 12999,
    image: 'https://via.placeholder.com/300x300?text=MacBookPro',
    description: '强大的M3芯片，专业级性能',
    category: 'laptop',
    stock: 30,
    sales: 800
  },
  {
    id: 3,
    name: 'iPad Air',
    price: 4399,
    image: 'https://via.placeholder.com/300x300?text=iPadAir',
    description: '轻薄便携，性能强劲',
    category: 'tablet',
    stock: 80,
    sales: 600
  },
  {
    id: 4,
    name: 'AirPods Pro',
    price: 1899,
    image: 'https://via.placeholder.com/300x300?text=AirPodsPro',
    description: '主动降噪，音质出色',
    category: 'accessory',
    stock: 100,
    sales: 2000
  }
];

let users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin'
  }
];

let carts = [];
let orders = [];

// API路由

// 商品相关API
app.get('/api/products', (req, res) => {
  const { category, keyword } = req.query;
  let filteredProducts = products;
  
  if (category && category !== 'all') {
    filteredProducts = products.filter(p => p.category === category);
  }
  
  if (keyword) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: filteredProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({
      code: 404,
      message: '商品不存在'
    });
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: product
  });
});

// 购物车API
app.get('/api/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userCart = carts.filter(c => c.userId === userId);
  
  res.json({
    code: 200,
    message: 'success',
    data: userCart
  });
});

app.post('/api/cart', (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;
  
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({
      code: 404,
      message: '商品不存在'
    });
  }
  
  const existingItem = carts.find(c => c.userId === userId && c.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts.push({
      id: Date.now(),
      userId,
      productId,
      quantity,
      product
    });
  }
  
  res.json({
    code: 200,
    message: '添加成功',
    data: null
  });
});

// 用户登录API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简化版登录验证
  if (username === 'demo' && password === '123456') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        id: 999,
        username: 'demo',
        token: 'demo-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    });
  }
});

// 分类API
app.get('/api/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 'all', name: '全部', icon: '📱' },
      { id: 'phone', name: '手机', icon: '📱' },
      { id: 'laptop', name: '笔记本', icon: '💻' },
      { id: 'tablet', name: '平板', icon: '📱' },
      { id: 'accessory', name: '配件', icon: '🎧' }
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 API文档: http://localhost:${PORT}/api`);
});

module.exports = app;
