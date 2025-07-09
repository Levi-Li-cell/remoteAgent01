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
  userAddresses,
  productReviews,
  coupons,
  userCoupons,
  searchHistory,
  productFavorites,
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

// 注意：数据已经从 models/data.js 导入，这里不需要重复定义

// 注意：旧的简单API路由已删除，使用下面的完整版本

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
// 订单相关API
// ================================

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 创建订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart_item_ids
 *               - shipping_address
 *             properties:
 *               cart_item_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               shipping_address:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   province:
 *                     type: string
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   detail:
 *                     type: string
 *               payment_method:
 *                 type: string
 *                 enum: [wechat_pay, alipay, credit_card]
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: 订单创建成功
 *       400:
 *         description: 请求参数错误
 */
app.post('/api/orders',
  authenticateToken,
  validate(orderSchemas.createOrder),
  asyncHandler(async (req, res) => {
    const { cart_item_ids, shipping_address, payment_method, remark } = req.body;
    const userId = req.user.id;

    // 获取购物车商品
    const selectedCartItems = cartItems.filter(item =>
      cart_item_ids.includes(item.id) && item.userId === userId
    );

    if (selectedCartItems.length === 0) {
      throw createError.badRequest('购物车商品不存在');
    }

    // 验证商品库存和计算总价
    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of selectedCartItems) {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) {
        throw createError.badRequest(`商品 ${cartItem.productId} 不存在`);
      }

      if (product.stock < cartItem.quantity) {
        throw createError.badRequest(`商品 ${product.name} 库存不足`);
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        id: getNextId('orderItems'),
        product_id: cartItem.productId,
        product_name: product.name,
        product_price: product.price,
        quantity: cartItem.quantity,
        selected_specs: cartItem.selected_specs || {},
        subtotal: itemTotal
      });
    }

    // 创建订单
    const newOrder = {
      id: getNextId('orders'),
      order_no: generateOrderNo(),
      user_id: userId,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      shipping_address,
      status: 'pending',
      payment_method: payment_method || 'wechat_pay',
      payment_status: 'pending',
      remark: remark || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    orders.push(newOrder);

    // 添加订单商品
    orderItemsData.forEach(item => {
      item.order_id = newOrder.id;
      orderItems.push(item);
    });

    // 扣减库存
    for (const cartItem of selectedCartItems) {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        product.stock -= cartItem.quantity;
        product.sales_count += cartItem.quantity;
      }
    }

    // 清空购物车中的已下单商品
    cart_item_ids.forEach(cartItemId => {
      const index = cartItems.findIndex(item => item.id === cartItemId);
      if (index > -1) {
        cartItems.splice(index, 1);
      }
    });

    successResponse(res, {
      order_id: newOrder.id,
      order_no: newOrder.order_no,
      total_amount: newOrder.total_amount,
      payment_info: {
        payment_method: newOrder.payment_method,
        payment_status: newOrder.payment_status
      }
    }, '订单创建成功');
  })
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 获取用户订单列表
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/orders',
  authenticateToken,
  validate(orderSchemas.getOrders, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const userId = req.user.id;

    let userOrders = orders.filter(order => order.user_id === userId);

    // 状态筛选
    if (status) {
      userOrders = userOrders.filter(order => order.status === status);
    }

    // 按创建时间倒序排列
    userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = userOrders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = userOrders.slice(startIndex, endIndex);

    // 添加订单商品信息
    const ordersWithItems = paginatedOrders.map(order => {
      const items = orderItems.filter(item => item.order_id === order.id);
      return {
        ...order,
        items
      };
    });

    paginatedResponse(res, ordersWithItems, {
      page,
      limit,
      total
    });
  })
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [订单管理]
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
 *         description: 获取成功
 *       404:
 *         description: 订单不存在
 */
app.get('/api/orders/:id',
  authenticateToken,
  validate(orderSchemas.orderId, 'params'),
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    const userId = req.user.id;

    const order = orders.find(o => o.id === orderId && o.user_id === userId);
    if (!order) {
      throw createError.notFound('订单不存在');
    }

    // 获取订单商品
    const items = orderItems.filter(item => item.order_id === orderId);

    const orderDetail = {
      ...order,
      items
    };

    successResponse(res, orderDetail);
  })
);

// ================================
// 地址管理API
// ================================

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: 获取用户地址列表
 *     tags: [地址管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/addresses',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addresses = userAddresses.filter(addr => addr.user_id === userId);

    // 按默认地址和创建时间排序
    addresses.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    successResponse(res, addresses);
  })
);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: 添加收货地址
 *     tags: [地址管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - province
 *               - city
 *               - district
 *               - detail
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               detail:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 添加成功
 */
app.post('/api/addresses',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { name, phone, province, city, district, detail, postal_code, is_default } = req.body;
    const userId = req.user.id;

    // 如果设置为默认地址，取消其他默认地址
    if (is_default) {
      userAddresses.forEach(addr => {
        if (addr.user_id === userId) {
          addr.is_default = false;
        }
      });
    }

    const newAddress = {
      id: getNextId('userAddresses'),
      user_id: userId,
      name,
      phone,
      province,
      city,
      district,
      detail,
      postal_code: postal_code || '',
      is_default: is_default || false,
      created_at: new Date(),
      updated_at: new Date()
    };

    userAddresses.push(newAddress);

    successResponse(res, newAddress, '地址添加成功');
  })
);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: 更新收货地址
 *     tags: [地址管理]
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
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               detail:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 地址不存在
 */
app.put('/api/addresses/:id',
  authenticateToken,
  validateId,
  asyncHandler(async (req, res) => {
    const addressId = parseInt(req.params.id);
    const userId = req.user.id;
    const updateData = req.body;

    const addressIndex = userAddresses.findIndex(addr =>
      addr.id === addressId && addr.user_id === userId
    );

    if (addressIndex === -1) {
      throw createError.notFound('地址不存在');
    }

    // 如果设置为默认地址，取消其他默认地址
    if (updateData.is_default) {
      userAddresses.forEach(addr => {
        if (addr.user_id === userId && addr.id !== addressId) {
          addr.is_default = false;
        }
      });
    }

    // 更新地址
    userAddresses[addressIndex] = {
      ...userAddresses[addressIndex],
      ...updateData,
      updated_at: new Date()
    };

    successResponse(res, userAddresses[addressIndex], '地址更新成功');
  })
);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: 删除收货地址
 *     tags: [地址管理]
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
 *         description: 地址不存在
 */
app.delete('/api/addresses/:id',
  authenticateToken,
  validateId,
  asyncHandler(async (req, res) => {
    const addressId = parseInt(req.params.id);
    const userId = req.user.id;

    const addressIndex = userAddresses.findIndex(addr =>
      addr.id === addressId && addr.user_id === userId
    );

    if (addressIndex === -1) {
      throw createError.notFound('地址不存在');
    }

    // 删除地址
    userAddresses.splice(addressIndex, 1);

    successResponse(res, null, '地址删除成功');
  })
);

// ================================
// 商品评价API
// ================================

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: 获取商品评价列表
 *     tags: [商品评价]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/products/:id/reviews',
  validateId,
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const { page = 1, limit = 10, rating } = req.query;

    // 检查商品是否存在
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw createError.notFound('商品不存在');
    }

    let reviews = productReviews.filter(review => review.product_id === productId);

    // 评分筛选
    if (rating) {
      reviews = reviews.filter(review => review.rating === parseInt(rating));
    }

    // 按时间倒序排列
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = reviews.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    // 添加用户信息
    const reviewsWithUser = paginatedReviews.map(review => {
      const user = users.find(u => u.id === review.user_id);
      return {
        ...review,
        user: user ? {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url
        } : null
      };
    });

    // 计算评价统计
    const allReviews = productReviews.filter(r => r.product_id === productId);
    const stats = {
      total_count: allReviews.length,
      average_rating: allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0,
      rating_distribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length
      }
    };

    paginatedResponse(res, {
      reviews: reviewsWithUser,
      stats
    }, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  })
);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: 添加商品评价
 *     tags: [商品评价]
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
 *               - order_id
 *               - rating
 *               - content
 *             properties:
 *               product_id:
 *                 type: integer
 *               order_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               content:
 *                 type: string
 *                 maxLength: 500
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 评价成功
 */
app.post('/api/reviews',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { product_id, order_id, rating, content, images = [] } = req.body;
    const userId = req.user.id;

    // 验证商品存在
    const product = products.find(p => p.id === product_id);
    if (!product) {
      throw createError.notFound('商品不存在');
    }

    // 验证订单存在且属于当前用户
    const order = orders.find(o => o.id === order_id && o.user_id === userId);
    if (!order) {
      throw createError.notFound('订单不存在');
    }

    // 检查是否已经评价过
    const existingReview = productReviews.find(r =>
      r.product_id === product_id && r.user_id === userId && r.order_id === order_id
    );
    if (existingReview) {
      throw createError.conflict('该商品已评价过');
    }

    // 创建评价
    const newReview = {
      id: getNextId('productReviews'),
      product_id,
      user_id: userId,
      order_id,
      rating: parseInt(rating),
      content: content.trim(),
      images: images.slice(0, 9), // 最多9张图片
      reply: null,
      helpful_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    productReviews.push(newReview);

    successResponse(res, newReview, '评价成功');
  })
);

// ================================
// 优惠券API
// ================================

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: 获取可领取的优惠券列表
 *     tags: [优惠券]
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/coupons',
  asyncHandler(async (req, res) => {
    const activeCoupons = coupons.filter(coupon =>
      coupon.status === 'active' &&
      new Date() >= coupon.start_time &&
      new Date() <= coupon.end_time &&
      coupon.used_count < coupon.total_count
    );

    successResponse(res, activeCoupons);
  })
);

/**
 * @swagger
 * /api/user/coupons:
 *   get:
 *     summary: 获取用户优惠券
 *     tags: [优惠券]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unused, used, expired]
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/user/coupons',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;

    let userCouponList = userCoupons.filter(uc => uc.user_id === userId);

    // 状态筛选
    if (status) {
      userCouponList = userCouponList.filter(uc => uc.status === status);
    }

    // 添加优惠券详情
    const couponsWithDetail = userCouponList.map(uc => {
      const coupon = coupons.find(c => c.id === uc.coupon_id);
      return {
        ...uc,
        coupon
      };
    });

    successResponse(res, couponsWithDetail);
  })
);

/**
 * @swagger
 * /api/coupons/{id}/receive:
 *   post:
 *     summary: 领取优惠券
 *     tags: [优惠券]
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
 *         description: 领取成功
 */
app.post('/api/coupons/:id/receive',
  authenticateToken,
  validateId,
  asyncHandler(async (req, res) => {
    const couponId = parseInt(req.params.id);
    const userId = req.user.id;

    // 检查优惠券是否存在
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) {
      throw createError.notFound('优惠券不存在');
    }

    // 检查优惠券是否可领取
    if (coupon.status !== 'active') {
      throw createError.badRequest('优惠券已下架');
    }

    if (new Date() < coupon.start_time || new Date() > coupon.end_time) {
      throw createError.badRequest('优惠券不在有效期内');
    }

    if (coupon.used_count >= coupon.total_count) {
      throw createError.badRequest('优惠券已被领完');
    }

    // 检查用户是否已领取
    const existingUserCoupon = userCoupons.find(uc =>
      uc.user_id === userId && uc.coupon_id === couponId
    );
    if (existingUserCoupon) {
      throw createError.conflict('您已领取过该优惠券');
    }

    // 领取优惠券
    const newUserCoupon = {
      id: getNextId('userCoupons'),
      user_id: userId,
      coupon_id: couponId,
      status: 'unused',
      received_at: new Date(),
      used_at: null,
      order_id: null
    };

    userCoupons.push(newUserCoupon);

    // 更新优惠券使用数量
    coupon.used_count += 1;

    successResponse(res, newUserCoupon, '领取成功');
  })
);

// ================================
// 商品收藏API
// ================================

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: 获取用户收藏列表
 *     tags: [商品收藏]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/favorites',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    let userFavorites = productFavorites.filter(f => f.user_id === userId);

    // 按收藏时间倒序排列
    userFavorites.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = userFavorites.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFavorites = userFavorites.slice(startIndex, endIndex);

    // 添加商品详情
    const favoritesWithProduct = paginatedFavorites.map(favorite => {
      const product = products.find(p => p.id === favorite.product_id);
      return {
        ...favorite,
        product
      };
    }).filter(item => item.product); // 过滤掉商品不存在的收藏

    paginatedResponse(res, favoritesWithProduct, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  })
);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: 添加商品收藏
 *     tags: [商品收藏]
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
 *     responses:
 *       200:
 *         description: 收藏成功
 */
app.post('/api/favorites',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { product_id } = req.body;
    const userId = req.user.id;

    // 检查商品是否存在
    const product = products.find(p => p.id === product_id);
    if (!product) {
      throw createError.notFound('商品不存在');
    }

    // 检查是否已收藏
    const existingFavorite = productFavorites.find(f =>
      f.user_id === userId && f.product_id === product_id
    );
    if (existingFavorite) {
      throw createError.conflict('商品已收藏');
    }

    // 添加收藏
    const newFavorite = {
      id: getNextId('productFavorites'),
      user_id: userId,
      product_id,
      created_at: new Date()
    };

    productFavorites.push(newFavorite);

    successResponse(res, newFavorite, '收藏成功');
  })
);

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: 取消商品收藏
 *     tags: [商品收藏]
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
 *         description: 取消收藏成功
 */
app.delete('/api/favorites/:id',
  authenticateToken,
  validateId,
  asyncHandler(async (req, res) => {
    const favoriteId = parseInt(req.params.id);
    const userId = req.user.id;

    const favoriteIndex = productFavorites.findIndex(f =>
      f.id === favoriteId && f.user_id === userId
    );

    if (favoriteIndex === -1) {
      throw createError.notFound('收藏记录不存在');
    }

    productFavorites.splice(favoriteIndex, 1);

    successResponse(res, null, '取消收藏成功');
  })
);

// ================================
// 搜索相关API
// ================================

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: 获取搜索历史
 *     tags: [搜索功能]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/search/history',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userSearchHistory = searchHistory
      .filter(h => h.user_id === userId)
      .sort((a, b) => new Date(b.last_search_at) - new Date(a.last_search_at))
      .slice(0, 10); // 最多返回10条

    successResponse(res, userSearchHistory);
  })
);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: 获取搜索建议
 *     tags: [搜索功能]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/search/suggestions',
  asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return successResponse(res, []);
    }

    // 从商品名称中搜索建议
    const suggestions = products
      .filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()))
      .map(p => p.name)
      .slice(0, 8); // 最多8个建议

    // 去重
    const uniqueSuggestions = [...new Set(suggestions)];

    successResponse(res, uniqueSuggestions);
  })
);

/**
 * @swagger
 * /api/search/hot:
 *   get:
 *     summary: 获取热门搜索
 *     tags: [搜索功能]
 *     responses:
 *       200:
 *         description: 获取成功
 */
app.get('/api/search/hot',
  asyncHandler(async (req, res) => {
    // 根据搜索次数排序，返回热门搜索词
    const hotKeywords = searchHistory
      .reduce((acc, curr) => {
        const existing = acc.find(item => item.keyword === curr.keyword);
        if (existing) {
          existing.count += curr.search_count;
        } else {
          acc.push({ keyword: curr.keyword, count: curr.search_count });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => item.keyword);

    successResponse(res, hotKeywords);
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
