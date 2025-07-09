const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 导入中间件
const { authenticateToken, optionalAuth, generateToken } = require('./middleware/auth');
const { validate, userSchemas, productSchemas, cartSchemas, orderSchemas, validateId } = require('./middleware/validation');
const {
  errorHandler,
  notFound,
  asyncHandler,
  createError,
  successResponse,
  paginatedResponse,
  requestId,
  requestLogger
} = require('./middleware/errorHandler');

// 导入数据模型
const {
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  getNextId,
  generateOrderNo,
  findUserByEmailOrUsername,
  findUserById,
  createUser,
  updateUser,
  comparePassword
} = require('./models/data');

// 导入Swagger配置
const { specs, swaggerUi, swaggerUiOptions } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// 请求限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null
  }
});
app.use('/api/', limiter);

// 基础中间件
app.use(requestId);
app.use(requestLogger);
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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
    existingItem.quantity = quantity; // 更新为设置数量而不是累加
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
    message: '操作成功',
    data: null
  });
});

// 删除购物车商品
app.delete('/api/cart/:id', (req, res) => {
  const cartId = parseInt(req.params.id);
  const index = carts.findIndex(c => c.id === cartId);

  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: '购物车商品不存在'
    });
  }

  carts.splice(index, 1);

  res.json({
    code: 200,
    message: '删除成功',
    data: null
  });
});

// ================================
// 用户认证相关API
// ================================

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: 用户注册
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: 注册成功
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 用户已存在
 */
app.post('/api/user/register',
  validate(userSchemas.register),
  asyncHandler(async (req, res) => {
    const { username, email, password, phone } = req.body;

    // 检查用户是否已存在
    const existingUser = findUserByEmailOrUsername(email) || findUserByEmailOrUsername(username);
    if (existingUser) {
      throw createError.conflict('用户名或邮箱已存在');
    }

    // 创建新用户
    const newUser = await createUser({ username, email, password, phone });

    // 生成token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    // 返回用户信息 (不包含密码)
    const { password_hash, ...userInfo } = newUser;

    successResponse(res, {
      user: userInfo,
      token,
      expires_in: 86400 // 24小时
    }, '注册成功');
  })
);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: 用户登录
 *     tags: [用户管理]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 用户名或密码错误
 */
app.post('/api/user/login',
  validate(userSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 查找用户
    const user = findUserByEmailOrUsername(email);
    if (!user) {
      throw createError.unauthorized('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw createError.unauthorized('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw createError.forbidden('账户已被禁用');
    }

    // 生成token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // 返回用户信息 (不包含密码)
    const { password_hash, ...userInfo } = user;

    successResponse(res, {
      user: userInfo,
      token,
      expires_in: 86400 // 24小时
    }, '登录成功');
  })
);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: 获取用户信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
app.get('/api/user/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = findUserById(req.user.id);
    if (!user) {
      throw createError.notFound('用户不存在');
    }

    // 返回用户信息 (不包含密码)
    const { password_hash, ...userInfo } = user;

    successResponse(res, userInfo);
  })
);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 更新用户信息
 *     tags: [用户管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授权
 */
app.put('/api/user/profile',
  authenticateToken,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const updateData = req.body;

    // 如果更新用户名，检查是否已存在
    if (updateData.username) {
      const existingUser = users.find(u => u.username === updateData.username && u.id !== req.user.id);
      if (existingUser) {
        throw createError.conflict('用户名已存在');
      }
    }

    const updatedUser = updateUser(req.user.id, updateData);
    if (!updatedUser) {
      throw createError.notFound('用户不存在');
    }

    // 返回更新后的用户信息 (不包含密码)
    const { password_hash, ...userInfo } = updatedUser;

    successResponse(res, userInfo, '更新成功');
  })
);

// ================================
// 商品相关API
// ================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [商品管理]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, sales, newest]
 *           default: newest
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/products',
  validate(productSchemas.getProducts, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, category, keyword, sort, min_price, max_price, brand } = req.query;

    let filteredProducts = products.filter(p => p.status === 'active');

    // 分类筛选
    if (category && category !== 'all') {
      const categoryObj = categories.find(c => c.name === category);
      if (categoryObj) {
        filteredProducts = filteredProducts.filter(p => p.category_id === categoryObj.id);
      }
    }

    // 品牌筛选
    if (brand) {
      filteredProducts = filteredProducts.filter(p =>
        p.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    // 关键词搜索
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm)
      );
    }

    // 价格筛选
    if (min_price !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= min_price);
    }
    if (max_price !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= max_price);
    }

    // 排序
    switch (sort) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'sales':
        filteredProducts.sort((a, b) => b.sales_count - a.sales_count);
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    // 分页
    const total = filteredProducts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // 添加分类信息
    const productsWithCategory = paginatedProducts.map(product => {
      const category = categories.find(c => c.id === product.category_id);
      return {
        ...product,
        category: category ? { id: category.id, name: category.name } : null
      };
    });

    paginatedResponse(res, productsWithCategory, {
      page,
      limit,
      total
    });
  })
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [商品管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 商品不存在
 */
app.get('/api/products/:id',
  validate(productSchemas.productId, 'params'),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId && p.status === 'active');

    if (!product) {
      throw createError.notFound('商品不存在');
    }

    // 添加分类信息
    const category = categories.find(c => c.id === product.category_id);
    const productWithCategory = {
      ...product,
      category: category ? { id: category.id, name: category.name } : null
    };

    successResponse(res, productWithCategory);
  })
);

// ================================
// 购物车相关API
// ================================

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: 获取用户购物车
 *     tags: [购物车管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
app.get('/api/cart',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userCartItems = cartItems.filter(item => item.userId === userId);

    // 添加商品详细信息
    const cartWithProducts = userCartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.id,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          stock: product.stock
        } : null,
        quantity: item.quantity,
        selected_specs: item.selected_specs || {},
        subtotal: product ? (product.price * item.quantity) : 0,
        created_at: item.created_at
      };
    }).filter(item => item.product !== null); // 过滤掉商品不存在的项

    // 计算总计
    const totalQuantity = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartWithProducts.reduce((sum, item) => sum + item.subtotal, 0);

    successResponse(res, {
      items: cartWithProducts,
      total_quantity: totalQuantity,
      total_amount: parseFloat(totalAmount.toFixed(2))
    });
  })
);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: 添加商品到购物车
 *     tags: [购物车管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               selected_specs:
 *                 type: object
 *     responses:
 *       200:
 *         description: 添加成功
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 商品不存在
 */
app.post('/api/cart',
  authenticateToken,
  validate(cartSchemas.addToCart),
  asyncHandler(async (req, res) => {
    const { product_id, quantity, selected_specs } = req.body;
    const userId = req.user.id;

    // 检查商品是否存在
    const product = products.find(p => p.id === product_id && p.status === 'active');
    if (!product) {
      throw createError.notFound('商品不存在');
    }

    // 检查库存
    if (product.stock < quantity) {
      throw createError.badRequest(`库存不足，当前库存：${product.stock}`);
    }

    // 检查是否已存在相同商品和规格
    const existingItemIndex = cartItems.findIndex(item =>
      item.userId === userId &&
      item.productId === product_id &&
      JSON.stringify(item.selected_specs || {}) === JSON.stringify(selected_specs || {})
    );

    if (existingItemIndex !== -1) {
      // 更新数量
      const newQuantity = cartItems[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        throw createError.badRequest(`库存不足，当前库存：${product.stock}，购物车已有：${cartItems[existingItemIndex].quantity}`);
      }
      cartItems[existingItemIndex].quantity = newQuantity;
      cartItems[existingItemIndex].updated_at = new Date();
    } else {
      // 添加新项
      cartItems.push({
        id: getNextId('cartItems'),
        userId,
        productId: product_id,
        quantity,
        selected_specs: selected_specs || {},
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    successResponse(res, null, '添加成功');
  })
);

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: 更新购物车商品数量
 *     tags: [购物车管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 购物车项不存在
 */
app.put('/api/cart/:id',
  authenticateToken,
  validate(cartSchemas.cartItemId, 'params'),
  validate(cartSchemas.updateCart),
  asyncHandler(async (req, res) => {
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItemIndex = cartItems.findIndex(item =>
      item.id === cartItemId && item.userId === userId
    );

    if (cartItemIndex === -1) {
      throw createError.notFound('购物车项不存在');
    }

    const cartItem = cartItems[cartItemIndex];
    const product = products.find(p => p.id === cartItem.productId);

    if (!product) {
      throw createError.notFound('商品不存在');
    }

    // 检查库存
    if (product.stock < quantity) {
      throw createError.badRequest(`库存不足，当前库存：${product.stock}`);
    }

    // 更新数量
    cartItems[cartItemIndex].quantity = quantity;
    cartItems[cartItemIndex].updated_at = new Date();

    successResponse(res, null, '更新成功');
  })
);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: 删除购物车商品
 *     tags: [购物车管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 购物车项不存在
 */
app.delete('/api/cart/:id',
  authenticateToken,
  validate(cartSchemas.cartItemId, 'params'),
  asyncHandler(async (req, res) => {
    const cartItemId = parseInt(req.params.id);
    const userId = req.user.id;

    const cartItemIndex = cartItems.findIndex(item =>
      item.id === cartItemId && item.userId === userId
    );

    if (cartItemIndex === -1) {
      throw createError.notFound('购物车项不存在');
    }

    // 删除购物车项
    cartItems.splice(cartItemIndex, 1);

    successResponse(res, null, '删除成功');
  })
);

// ================================
// 分类相关API
// ================================

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: 获取商品分类列表
 *     tags: [商品管理]
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/categories',
  asyncHandler(async (req, res) => {
    const activeCategories = categories.filter(cat => cat.status === 'active');
    successResponse(res, activeCategories);
  })
);

// ================================
// 错误处理中间件 (必须放在最后)
// ================================

// 404处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
