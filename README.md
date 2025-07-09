# 🛒 数码商城Demo项目

一个基于UniApp + Node.js的跨平台数码商城演示项目，支持H5和微信小程序。

## ✨ 项目特色

- 🚀 **快速开发**: 一天内打通前后端完整流程
- 📱 **跨平台**: 一套代码支持Web H5和微信小程序
- 🎨 **现代UI**: 响应式设计，适配多种设备
- 🔧 **模块化**: 清晰的前后端分离架构
- 💡 **易扩展**: 完整的开发规范和代码结构

## 🏗️ 技术栈

### 前端
- **框架**: UniApp + Vue3
- **构建工具**: Vite
- **样式**: SCSS + 响应式布局
- **状态管理**: 本地存储
- **网络请求**: uni.request封装

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据存储**: 内存数据库(演示用)
- **跨域**: CORS支持

## 📱 功能模块

### ✅ 已完成功能
- [x] **首页**: 商品展示、分类筛选、搜索功能
- [x] **商品详情**: 图片预览、规格选择、加购物车
- [x] **购物车**: 商品管理、数量调整、价格计算
- [x] **用户系统**: 登录认证、个人中心
- [x] **跨平台适配**: H5 + 微信小程序支持

### 🚧 开发中功能
- [ ] 订单管理系统
- [ ] 支付集成
- [ ] 地址管理
- [ ] 后台管理系统
- [ ] 商品评价系统

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

### 启动开发服务器

1. **启动后端API服务**
```bash
npm run dev
```
服务器将运行在: http://localhost:3000

2. **启动前端开发服务**
```bash
cd client
npm run dev:h5
```
前端将运行在: http://localhost:3001

### 📱 多端开发

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 构建H5生产版本
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin
```

## 🎯 Demo账号

- **用户名**: `demo`
- **密码**: `123456`
- **游客模式**: 支持游客快速体验
- **微信登录**: 小程序环境下支持微信授权

## 📋 API接口

### 商品相关
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `GET /api/categories` - 获取商品分类

### 购物车相关
- `GET /api/cart/:userId` - 获取用户购物车
- `POST /api/cart` - 添加/更新购物车商品
- `DELETE /api/cart/:id` - 删除购物车商品

### 用户相关
- `POST /api/login` - 用户登录

## 📁 项目结构

```
├── package.json              # 根项目配置
├── server/                   # 后端服务
│   └── app.js               # Express服务器
├── client/                  # 前端应用
│   ├── manifest.json        # UniApp配置
│   ├── pages.json          # 页面路由配置
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── uni.scss            # 全局样式变量
│   ├── vite.config.js      # Vite配置
│   └── pages/              # 页面目录
│       ├── index/          # 首页
│       ├── product/        # 商品详情
│       ├── cart/           # 购物车
│       └── user/           # 用户相关
└── README.md               # 项目说明
```

## 🔧 开发规范

### 代码风格
- 使用ESLint + Prettier统一代码格式
- 组件命名采用PascalCase
- 文件命名采用kebab-case
- 提交信息遵循Conventional Commits

### Git工作流
- `main` - 主分支，稳定版本
- `feature/*` - 功能分支
- `hotfix/*` - 热修复分支

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [UniApp](https://uniapp.dcloud.io/) - 跨平台应用开发框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Express](https://expressjs.com/) - 快速、极简的Node.js Web框架

---

**Happy Coding!** 🎉