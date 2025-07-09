const jwt = require('jsonwebtoken');

// JWT密钥 (生产环境应该使用环境变量)
const JWT_SECRET = process.env.JWT_SECRET || 'digital-mall-secret-key-2024';

/**
 * 生成JWT Token
 * @param {Object} payload - 用户信息
 * @returns {String} JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'digital-mall'
  });
};

/**
 * 验证JWT Token
 * @param {String} token - JWT Token
 * @returns {Object} 解码后的用户信息
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * 认证中间件 - 验证用户登录状态
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '访问令牌缺失，请先登录',
      data: null
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      code: 403,
      message: '访问令牌无效或已过期',
      data: null
    });
  }
};

/**
 * 可选认证中间件 - 如果有token则验证，没有则跳过
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // 忽略token错误，继续执行
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * 管理员权限验证中间件
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      code: 401,
      message: '需要登录',
      data: null
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限',
      data: null
    });
  }

  next();
};

/**
 * 刷新Token
 * @param {String} oldToken - 旧的JWT Token
 * @returns {String} 新的JWT Token
 */
const refreshToken = (oldToken) => {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });
    
    // 移除过期时间等JWT内置字段
    const { iat, exp, ...payload } = decoded;
    
    // 生成新token
    return generateToken(payload);
  } catch (error) {
    throw new Error('Invalid token for refresh');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  optionalAuth,
  requireAdmin,
  refreshToken,
  JWT_SECRET
};
