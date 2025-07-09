# 🎨 前端组件使用指南

## 📋 组件概览

数码商城前端基于UniApp + Vue3开发，采用组合式API和响应式设计，支持H5和微信小程序双端。

### 🏗️ 技术栈
- **框架**: UniApp + Vue3
- **样式**: SCSS + 响应式布局
- **状态管理**: 本地存储 + 全局工具方法
- **网络请求**: 统一封装的request工具
- **UI组件**: 自定义组件 + UniApp内置组件

## 📱 页面组件

### 1. 首页组件 (`/pages/index/index.vue`)

#### 功能特性
- ✅ 商品分类导航
- ✅ 搜索功能
- ✅ 商品列表展示
- ✅ 分类筛选
- ✅ 响应式布局

#### 使用方法
```javascript
// 页面跳转
uni.switchTab({
  url: '/pages/index/index'
})
```

#### 主要方法
```javascript
// 加载商品分类
loadCategories()

// 加载商品列表
loadProducts()

// 选择分类
selectCategory(categoryId)

// 搜索商品
searchProducts()

// 跳转商品详情
goToDetail(productId)
```

#### 数据结构
```javascript
data() {
  return {
    categories: [],      // 商品分类
    products: [],        // 商品列表
    selectedCategory: 'all', // 选中分类
    searchKeyword: '',   // 搜索关键词
    loading: false       // 加载状态
  }
}
```

### 2. 商品详情页 (`/pages/product/detail.vue`)

#### 功能特性
- ✅ 商品图片展示和切换
- ✅ 商品信息展示
- ✅ 规格选择 (颜色、存储等)
- ✅ 数量选择
- ✅ 加入购物车
- ✅ 立即购买
- ✅ 图片预览

#### 使用方法
```javascript
// 跳转到商品详情页
uni.navigateTo({
  url: `/pages/product/detail?id=${productId}`
})
```

#### 主要方法
```javascript
// 加载商品详情
loadProductDetail()

// 切换商品图片
switchImage(index)

// 选择规格
selectSpec(specType, specValue)

// 计算价格
calculatePrice()

// 增减数量
decreaseQuantity()
increaseQuantity()

// 加入购物车
addToCart()

// 立即购买
buyNow()
```

#### 数据结构
```javascript
data() {
  return {
    productId: null,     // 商品ID
    product: null,       // 商品详情
    quantity: 1,         // 选择数量
    selectedSpecs: {     // 选中规格
      color: '',
      storage: ''
    },
    currentImageIndex: 0, // 当前图片索引
    loading: true        // 加载状态
  }
}
```

### 3. 购物车页面 (`/pages/cart/cart.vue`)

#### 功能特性
- ✅ 购物车商品列表
- ✅ 商品数量调整
- ✅ 商品删除
- ✅ 全选/反选
- ✅ 价格计算
- ✅ 结算功能
- ✅ 空状态处理

#### 使用方法
```javascript
// 跳转到购物车页面
uni.switchTab({
  url: '/pages/cart/cart'
})
```

#### 主要方法
```javascript
// 加载购物车
loadCartItems()

// 选择商品
toggleSelect(item)
toggleSelectAll()

// 调整数量
decreaseQuantity(item)
increaseQuantity(item)
updateCartItem(item, newQuantity)

// 删除商品
removeItem(item)
deleteCartItem(item)

// 结算
checkout()
```

#### 计算属性
```javascript
computed: {
  selectedItems() {
    return this.cartItems.filter(item => item.selected)
  },
  
  selectedCount() {
    return this.selectedItems.reduce((total, item) => total + item.quantity, 0)
  },
  
  totalPrice() {
    return this.selectedItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0).toFixed(2)
  },
  
  allSelected() {
    return this.cartItems.length > 0 && this.cartItems.every(item => item.selected)
  }
}
```

### 4. 用户登录页 (`/pages/user/login.vue`)

#### 功能特性
- ✅ 邮箱密码登录
- ✅ 表单验证
- ✅ 微信授权登录 (小程序)
- ✅ 游客模式
- ✅ 登录状态保存

#### 使用方法
```javascript
// 跳转到登录页面
uni.navigateTo({
  url: '/pages/user/login'
})
```

#### 主要方法
```javascript
// 处理登录
handleLogin()

// 微信登录
wechatLogin(e)

// 游客登录
guestLogin()

// 跳转注册
goRegister()

// 返回上一页
navigateBack()
```

#### 数据结构
```javascript
data() {
  return {
    loginForm: {
      username: '',      // 邮箱
      password: ''       // 密码
    },
    loading: false,      // 登录状态
    isWeChat: false      // 是否微信环境
  }
}
```

### 5. 个人中心页 (`/pages/user/profile.vue`)

#### 功能特性
- ✅ 用户信息展示
- ✅ 订单管理入口
- ✅ 功能菜单
- ✅ 登录状态检查
- ✅ 退出登录

#### 使用方法
```javascript
// 跳转到个人中心页面
uni.switchTab({
  url: '/pages/user/profile'
})
```

#### 主要方法
```javascript
// 检查登录状态
checkLoginStatus()

// 加载用户信息
loadUserProfile()

// 清除登录状态
clearLoginStatus()

// 跳转登录
goLogin()

// 退出登录
logout()
```

## 🔧 全局工具

### 网络请求工具 (`utils/request.js`)

#### 基础用法
```javascript
// 在组件中使用
this.$request({
  url: '/api/products',
  method: 'GET',
  data: { page: 1, limit: 20 }
})

// 或使用快捷方法
this.$get('/api/products', { page: 1, limit: 20 })
this.$post('/api/user/login', { email: 'demo@example.com', password: '123456' })
this.$put('/api/cart/123', { quantity: 2 })
this.$delete('/api/cart/123')
```

#### 特性
- ✅ 自动添加Token
- ✅ 统一错误处理
- ✅ 请求/响应拦截
- ✅ 超时处理
- ✅ 网络状态检查

### 全局工具方法

#### 使用方法
```javascript
// 格式化价格
this.$utils.formatPrice(7999.00) // "7999.00"

// 格式化时间
this.$utils.formatTime(new Date()) // "2024/7/8 20:30:00"

// 检查登录状态
if (this.$utils.checkLogin()) {
  // 已登录
} else {
  // 未登录
  this.$utils.goLogin()
}
```

## 🎨 样式规范

### 响应式设计
```scss
// 移动端优先
.component {
  width: 100%;
  padding: 20rpx;
  
  // 桌面端适配
  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40rpx;
  }
}
```

### 通用样式类
```scss
// 布局类
.container { padding: 20rpx; }
.card { background: white; border-radius: 16rpx; padding: 20rpx; margin-bottom: 20rpx; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.text-center { text-align: center; }

// 颜色类
.primary { color: #007AFF; }
.success { color: #4CD964; }
.warning { color: #FF9500; }
.error { color: #FF3B30; }
.price { color: #FF3B30; font-weight: bold; }

// 按钮类
.btn-primary { background: #007AFF; color: white; border-radius: 12rpx; }
.btn-success { background: #4CD964; color: white; border-radius: 12rpx; }
.btn-warning { background: #FF9500; color: white; border-radius: 12rpx; }
```

## 📋 开发规范

### 组件命名
- 页面组件：PascalCase (如 `ProductDetail.vue`)
- 通用组件：PascalCase (如 `ProductCard.vue`)
- 文件夹：kebab-case (如 `product-detail/`)

### 方法命名
- 事件处理：`handle` + 动作 (如 `handleLogin`)
- 数据加载：`load` + 数据 (如 `loadProducts`)
- 页面跳转：`goTo` + 页面 (如 `goToDetail`)

### 数据命名
- 列表数据：复数形式 (如 `products`, `categories`)
- 单个数据：单数形式 (如 `product`, `user`)
- 状态数据：形容词 (如 `loading`, `visible`)

## 🚀 快速开始

### 1. 启动开发服务器
```bash
cd client
npm install
npm run dev:h5
```

### 2. 构建生产版本
```bash
# H5版本
npm run build:h5

# 微信小程序版本
npm run build:mp-weixin
```

### 3. 预览和调试
- **H5预览**: http://localhost:3001
- **小程序预览**: 使用微信开发者工具打开 `dist/dev/mp-weixin`

## 📝 注意事项

### 跨平台兼容
- 使用UniApp提供的API而不是浏览器API
- 样式单位使用rpx而不是px
- 条件编译处理平台差异

### 性能优化
- 图片使用懒加载
- 列表使用虚拟滚动
- 合理使用缓存

### 用户体验
- 加载状态提示
- 错误状态处理
- 网络异常处理
- 空状态展示

这个组件指南为开发者提供了完整的前端开发参考！
