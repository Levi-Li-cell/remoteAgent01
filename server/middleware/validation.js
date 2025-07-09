const Joi = require('joi');

/**
 * 验证中间件生成器
 * @param {Object} schema - Joi验证模式
 * @param {String} source - 验证数据源 ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        code: 400,
        message: '请求参数验证失败',
        data: null,
        errors: errors
      });
    }

    // 将验证后的数据替换原数据
    req[source] = value;
    next();
  };
};

// 用户相关验证模式
const userSchemas = {
  // 用户注册验证
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.alphanum': '用户名只能包含字母和数字',
        'string.min': '用户名至少3个字符',
        'string.max': '用户名最多20个字符',
        'any.required': '用户名是必填项'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    
    password: Joi.string()
      .min(6)
      .max(50)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': '密码至少6个字符',
        'string.max': '密码最多50个字符',
        'string.pattern.base': '密码必须包含大小写字母和数字',
        'any.required': '密码是必填项'
      }),
    
    phone: Joi.string()
      .pattern(new RegExp('^1[3-9]\\d{9}$'))
      .optional()
      .messages({
        'string.pattern.base': '请输入有效的手机号码'
      })
  }),

  // 用户登录验证
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': '请输入有效的邮箱地址',
        'any.required': '邮箱是必填项'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': '密码是必填项'
      })
  }),

  // 更新用户信息验证
  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(20).optional(),
    phone: Joi.string().pattern(new RegExp('^1[3-9]\\d{9}$')).optional(),
    avatar_url: Joi.string().uri().optional()
  })
};

// 商品相关验证模式
const productSchemas = {
  // 商品列表查询验证
  getProducts: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().optional(),
    keyword: Joi.string().max(100).optional(),
    sort: Joi.string().valid('price_asc', 'price_desc', 'sales', 'newest').default('newest'),
    min_price: Joi.number().min(0).optional(),
    max_price: Joi.number().min(0).optional(),
    brand: Joi.string().optional()
  }),

  // 商品ID验证
  productId: Joi.object({
    id: Joi.number().integer().min(1).required()
  })
};

// 购物车相关验证模式
const cartSchemas = {
  // 添加到购物车验证
  addToCart: Joi.object({
    product_id: Joi.number().integer().min(1).required(),
    quantity: Joi.number().integer().min(1).max(99).default(1),
    selected_specs: Joi.object({
      color: Joi.string().optional(),
      size: Joi.string().optional(),
      storage: Joi.string().optional()
    }).optional()
  }),

  // 更新购物车验证
  updateCart: Joi.object({
    quantity: Joi.number().integer().min(1).max(99).required()
  }),

  // 购物车项ID验证
  cartItemId: Joi.object({
    id: Joi.number().integer().min(1).required()
  })
};

// 订单相关验证模式
const orderSchemas = {
  // 创建订单验证
  createOrder: Joi.object({
    cart_item_ids: Joi.array()
      .items(Joi.number().integer().min(1))
      .min(1)
      .required()
      .messages({
        'array.min': '至少选择一个商品',
        'any.required': '购物车商品ID是必填项'
      }),
    
    shipping_address: Joi.object({
      name: Joi.string().min(2).max(20).required(),
      phone: Joi.string().pattern(new RegExp('^1[3-9]\\d{9}$')).required(),
      province: Joi.string().required(),
      city: Joi.string().required(),
      district: Joi.string().required(),
      detail: Joi.string().min(5).max(200).required(),
      postal_code: Joi.string().pattern(new RegExp('^\\d{6}$')).optional()
    }).required(),
    
    payment_method: Joi.string()
      .valid('wechat_pay', 'alipay', 'credit_card')
      .default('wechat_pay'),
    
    remark: Joi.string().max(200).optional()
  }),

  // 订单查询验证
  getOrders: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    status: Joi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled').optional()
  }),

  // 订单ID验证
  orderId: Joi.object({
    id: Joi.number().integer().min(1).required()
  })
};

// 分页验证模式
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

/**
 * 通用ID验证
 */
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

/**
 * 验证请求参数是否为有效的正整数ID
 */
const validateId = validate(idSchema, 'params');

/**
 * 验证分页参数
 */
const validatePagination = validate(paginationSchema, 'query');

module.exports = {
  validate,
  userSchemas,
  productSchemas,
  cartSchemas,
  orderSchemas,
  validateId,
  validatePagination
};
