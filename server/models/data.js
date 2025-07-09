const bcrypt = require('bcryptjs');

/**
 * 模拟数据库 - 在实际项目中应该使用真实数据库
 */

// 用户数据
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    phone: '13800138000',
    avatar_url: 'https://via.placeholder.com/100x100?text=Admin',
    role: 'admin',
    status: 'active',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 999,
    username: 'demo',
    email: 'demo@example.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 123456
    phone: '13900139000',
    avatar_url: 'https://via.placeholder.com/100x100?text=Demo',
    role: 'user',
    status: 'active',
    created_at: new Date('2024-06-01'),
    updated_at: new Date('2024-06-01')
  }
];

// 商品分类数据
let categories = [
  { id: 1, name: '全部', parent_id: null, icon_url: '📱', sort_order: 0, status: 'active' },
  { id: 2, name: '手机', parent_id: null, icon_url: '📱', sort_order: 1, status: 'active' },
  { id: 3, name: '笔记本', parent_id: null, icon_url: '💻', sort_order: 2, status: 'active' },
  { id: 4, name: '平板', parent_id: null, icon_url: '📱', sort_order: 3, status: 'active' },
  { id: 5, name: '配件', parent_id: null, icon_url: '🎧', sort_order: 4, status: 'active' }
];

// 商品数据 (扩展版)
let products = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: '搭载A17 Pro芯片的专业级iPhone，采用钛金属设计，配备先进的摄像头系统',
    price: 7999.00,
    original_price: 8999.00,
    category_id: 2,
    brand: 'Apple',
    stock: 50,
    sales_count: 1200,
    images: [
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPhone+15+Pro+1',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPhone+15+Pro+2',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPhone+15+Pro+3',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPhone+15+Pro+4',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPhone+15+Pro+5'
    ],
    specs: {
      colors: [
        { name: '深空黑', code: '#2C2C2C', price_diff: 0 },
        { name: '银色', code: '#C0C0C0', price_diff: 0 },
        { name: '金色', code: '#FFD700', price_diff: 0 },
        { name: '蓝色钛金属', code: '#4169E1', price_diff: 0 }
      ],
      storage: [
        { name: '128GB', price_diff: 0 },
        { name: '256GB', price_diff: 800 },
        { name: '512GB', price_diff: 1600 },
        { name: '1TB', price_diff: 3200 }
      ]
    },
    status: 'active',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'MacBook Pro M3',
    description: '强大的M3芯片，专业级性能，适合开发者和创意工作者',
    price: 12999.00,
    original_price: 14999.00,
    category_id: 3,
    brand: 'Apple',
    stock: 30,
    sales_count: 800,
    images: [
      'https://via.placeholder.com/600x600/f0f0f0/666?text=MacBook+Pro+1',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=MacBook+Pro+2',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=MacBook+Pro+3'
    ],
    specs: {
      colors: [
        { name: '深空灰', code: '#2C2C2C', price_diff: 0 },
        { name: '银色', code: '#C0C0C0', price_diff: 0 }
      ],
      memory: [
        { name: '8GB', price_diff: 0 },
        { name: '16GB', price_diff: 2000 },
        { name: '32GB', price_diff: 6000 }
      ],
      storage: [
        { name: '512GB SSD', price_diff: 0 },
        { name: '1TB SSD', price_diff: 2000 },
        { name: '2TB SSD', price_diff: 6000 }
      ]
    },
    status: 'active',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 3,
    name: 'iPad Air',
    description: '轻薄便携，性能强劲，配备M1芯片的平板电脑',
    price: 4399.00,
    original_price: 4999.00,
    category_id: 4,
    brand: 'Apple',
    stock: 80,
    sales_count: 600,
    images: [
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPad+Air+1',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPad+Air+2',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=iPad+Air+3'
    ],
    specs: {
      colors: [
        { name: '深空灰', code: '#2C2C2C', price_diff: 0 },
        { name: '星光色', code: '#F5F5DC', price_diff: 0 },
        { name: '粉色', code: '#FFB6C1', price_diff: 0 },
        { name: '紫色', code: '#9370DB', price_diff: 0 },
        { name: '蓝色', code: '#4169E1', price_diff: 0 }
      ],
      storage: [
        { name: '64GB', price_diff: 0 },
        { name: '256GB', price_diff: 800 }
      ],
      connectivity: [
        { name: 'Wi-Fi', price_diff: 0 },
        { name: 'Wi-Fi + 蜂窝网络', price_diff: 1000 }
      ]
    },
    status: 'active',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01')
  },
  {
    id: 4,
    name: 'AirPods Pro',
    description: '主动降噪，音质出色，支持空间音频的无线耳机',
    price: 1899.00,
    original_price: 2199.00,
    category_id: 5,
    brand: 'Apple',
    stock: 100,
    sales_count: 2000,
    images: [
      'https://via.placeholder.com/600x600/f0f0f0/666?text=AirPods+Pro+1',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=AirPods+Pro+2'
    ],
    specs: {
      colors: [
        { name: '白色', code: '#FFFFFF', price_diff: 0 }
      ]
    },
    status: 'active',
    created_at: new Date('2024-02-15'),
    updated_at: new Date('2024-02-15')
  },
  {
    id: 5,
    name: 'Samsung Galaxy S24 Ultra',
    description: '三星旗舰手机，配备S Pen，专业摄影功能',
    price: 8999.00,
    original_price: 9999.00,
    category_id: 2,
    brand: 'Samsung',
    stock: 40,
    sales_count: 500,
    images: [
      'https://via.placeholder.com/600x600/f0f0f0/666?text=Galaxy+S24+1',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=Galaxy+S24+2',
      'https://via.placeholder.com/600x600/f0f0f0/666?text=Galaxy+S24+3'
    ],
    specs: {
      colors: [
        { name: '钛黑色', code: '#2C2C2C', price_diff: 0 },
        { name: '钛灰色', code: '#808080', price_diff: 0 },
        { name: '钛紫色', code: '#9370DB', price_diff: 0 },
        { name: '钛黄色', code: '#FFD700', price_diff: 0 }
      ],
      storage: [
        { name: '256GB', price_diff: 0 },
        { name: '512GB', price_diff: 1000 },
        { name: '1TB', price_diff: 2000 }
      ]
    },
    status: 'active',
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-03-01')
  }
];

// 购物车数据
let cartItems = [];

// 订单数据
let orders = [];
let orderItems = [];

// 用户地址数据
let userAddresses = [];

// 自增ID计数器
let counters = {
  users: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
  products: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
  categories: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
  cartItems: 1,
  orders: 1,
  orderItems: 1,
  userAddresses: 1
};

/**
 * 生成下一个ID
 */
const getNextId = (type) => {
  return counters[type]++;
};

/**
 * 生成订单号
 */
const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `ORD${year}${month}${day}${timestamp}${random}`;
};

/**
 * 密码加密
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 密码验证
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * 查找用户 (支持邮箱或用户名)
 */
const findUserByEmailOrUsername = (identifier) => {
  return users.find(user => 
    user.email === identifier || user.username === identifier
  );
};

/**
 * 根据ID查找用户
 */
const findUserById = (id) => {
  return users.find(user => user.id === parseInt(id));
};

/**
 * 创建用户
 */
const createUser = async (userData) => {
  const hashedPassword = await hashPassword(userData.password);
  
  const newUser = {
    id: getNextId('users'),
    username: userData.username,
    email: userData.email,
    password_hash: hashedPassword,
    phone: userData.phone || null,
    avatar_url: userData.avatar_url || null,
    role: 'user',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

/**
 * 更新用户信息
 */
const updateUser = (id, updateData) => {
  const userIndex = users.findIndex(user => user.id === parseInt(id));
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    updated_at: new Date()
  };
  
  return users[userIndex];
};

module.exports = {
  // 数据
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  userAddresses,
  
  // 工具函数
  getNextId,
  generateOrderNo,
  hashPassword,
  comparePassword,
  findUserByEmailOrUsername,
  findUserById,
  createUser,
  updateUser
};
