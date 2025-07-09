/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 异步错误处理包装器
 * 用于包装async函数，自动捕获Promise rejection
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404错误处理中间件
 */
const notFound = (req, res, next) => {
  const error = new AppError(`请求的资源 ${req.originalUrl} 不存在`, 404, 'RESOURCE_NOT_FOUND');
  next(error);
};

/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // JWT错误处理
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('无效的访问令牌', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('访问令牌已过期', 401, 'TOKEN_EXPIRED');
  }

  // 数据库错误处理 (如果使用数据库)
  if (err.code === 'ER_DUP_ENTRY') {
    error = new AppError('数据已存在，请检查唯一性约束', 400, 'DUPLICATE_ENTRY');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError('引用的数据不存在', 400, 'FOREIGN_KEY_CONSTRAINT');
  }

  // 验证错误处理
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // 类型转换错误
  if (err.name === 'CastError') {
    error = new AppError('无效的数据格式', 400, 'INVALID_DATA_FORMAT');
  }

  // 请求体过大错误
  if (err.type === 'entity.too.large') {
    error = new AppError('请求数据过大', 413, 'PAYLOAD_TOO_LARGE');
  }

  // 语法错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('请求数据格式错误', 400, 'INVALID_JSON');
  }

  // 构建错误响应
  const response = {
    code: error.statusCode || 500,
    message: error.message || '服务器内部错误',
    data: null
  };

  // 开发环境下返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      stack: err.stack,
      details: err
    };
  }

  // 添加错误代码
  if (error.code) {
    response.error_code = error.code;
  }

  // 添加请求ID (如果有)
  if (req.requestId) {
    response.request_id = req.requestId;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * 业务错误快捷方法
 */
const createError = {
  badRequest: (message = '请求参数错误') => new AppError(message, 400, 'BAD_REQUEST'),
  unauthorized: (message = '未授权访问') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = '禁止访问') => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (message = '资源不存在') => new AppError(message, 404, 'NOT_FOUND'),
  conflict: (message = '资源冲突') => new AppError(message, 409, 'CONFLICT'),
  unprocessable: (message = '无法处理的实体') => new AppError(message, 422, 'UNPROCESSABLE_ENTITY'),
  tooManyRequests: (message = '请求过于频繁') => new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  internal: (message = '服务器内部错误') => new AppError(message, 500, 'INTERNAL_SERVER_ERROR'),
  notImplemented: (message = '功能未实现') => new AppError(message, 501, 'NOT_IMPLEMENTED'),
  serviceUnavailable: (message = '服务不可用') => new AppError(message, 503, 'SERVICE_UNAVAILABLE')
};

/**
 * 成功响应格式化
 */
const successResponse = (res, data = null, message = 'success', code = 200) => {
  res.status(code).json({
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * 分页响应格式化
 */
const paginatedResponse = (res, data, pagination, message = 'success') => {
  res.status(200).json({
    code: 200,
    message,
    data,
    pagination: {
      current_page: pagination.page,
      per_page: pagination.limit,
      total: pagination.total,
      total_pages: Math.ceil(pagination.total / pagination.limit),
      has_next: pagination.page * pagination.limit < pagination.total,
      has_prev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * 请求ID生成中间件
 */
const requestId = (req, res, next) => {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 记录请求开始
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  AppError,
  asyncHandler,
  notFound,
  errorHandler,
  createError,
  successResponse,
  paginatedResponse,
  requestId,
  requestLogger
};
