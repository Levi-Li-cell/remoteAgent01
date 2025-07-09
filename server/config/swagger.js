const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger配置
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '数码商城API文档',
      version: '1.0.0',
      description: '数码商城后端API接口文档',
      contact: {
        name: 'API Support',
        email: 'support@digitalmall.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境'
      },
      {
        url: 'https://api.digitalmall.com',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT认证，格式：Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '用户ID'
            },
            username: {
              type: 'string',
              description: '用户名'
            },
            email: {
              type: 'string',
              format: 'email',
              description: '邮箱'
            },
            phone: {
              type: 'string',
              description: '手机号'
            },
            avatar_url: {
              type: 'string',
              description: '头像URL'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: '用户角色'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'banned'],
              description: '用户状态'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '商品ID'
            },
            name: {
              type: 'string',
              description: '商品名称'
            },
            description: {
              type: 'string',
              description: '商品描述'
            },
            price: {
              type: 'number',
              format: 'float',
              description: '商品价格'
            },
            original_price: {
              type: 'number',
              format: 'float',
              description: '原价'
            },
            brand: {
              type: 'string',
              description: '品牌'
            },
            stock: {
              type: 'integer',
              description: '库存数量'
            },
            sales_count: {
              type: 'integer',
              description: '销量'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '商品图片URL数组'
            },
            specs: {
              type: 'object',
              description: '商品规格'
            },
            category: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer'
                },
                name: {
                  type: 'string'
                }
              },
              description: '商品分类'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'out_of_stock'],
              description: '商品状态'
            }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '购物车项ID'
            },
            product: {
              $ref: '#/components/schemas/Product',
              description: '商品信息'
            },
            quantity: {
              type: 'integer',
              description: '数量'
            },
            selected_specs: {
              type: 'object',
              description: '选中的规格'
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: '小计'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '分类ID'
            },
            name: {
              type: 'string',
              description: '分类名称'
            },
            parent_id: {
              type: 'integer',
              nullable: true,
              description: '父分类ID'
            },
            icon_url: {
              type: 'string',
              description: '分类图标'
            },
            sort_order: {
              type: 'integer',
              description: '排序'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: '分类状态'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '响应状态码'
            },
            message: {
              type: 'string',
              description: '响应消息'
            },
            data: {
              description: '响应数据'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '响应时间'
            }
          }
        },
        PaginatedResponse: {
          allOf: [
            {
              $ref: '#/components/schemas/ApiResponse'
            },
            {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    current_page: {
                      type: 'integer',
                      description: '当前页码'
                    },
                    per_page: {
                      type: 'integer',
                      description: '每页数量'
                    },
                    total: {
                      type: 'integer',
                      description: '总数量'
                    },
                    total_pages: {
                      type: 'integer',
                      description: '总页数'
                    },
                    has_next: {
                      type: 'boolean',
                      description: '是否有下一页'
                    },
                    has_prev: {
                      type: 'boolean',
                      description: '是否有上一页'
                    }
                  }
                }
              }
            }
          ]
        },
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '错误状态码'
            },
            message: {
              type: 'string',
              description: '错误消息'
            },
            data: {
              type: 'null',
              description: '错误时数据为null'
            },
            error_code: {
              type: 'string',
              description: '业务错误代码'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: '错误字段'
                  },
                  message: {
                    type: 'string',
                    description: '错误消息'
                  },
                  value: {
                    description: '错误值'
                  }
                }
              },
              description: '详细错误信息'
            }
          }
        }
      }
    },
    tags: [
      {
        name: '用户管理',
        description: '用户注册、登录、信息管理'
      },
      {
        name: '商品管理',
        description: '商品列表、详情、分类'
      },
      {
        name: '购物车管理',
        description: '购物车增删改查'
      },
      {
        name: '订单管理',
        description: '订单创建、查询、状态管理'
      }
    ]
  },
  apis: ['./server/app.js', './server/routes/*.js'], // 扫描包含注释的文件
};

// 生成Swagger规范
const specs = swaggerJsdoc(options);

// 自定义Swagger UI配置
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: '数码商城API文档',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};
