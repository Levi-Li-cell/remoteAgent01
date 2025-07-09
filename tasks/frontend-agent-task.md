# 🎨 Frontend-Agent 任务执行单

## 📋 任务概述
**任务ID**: FE-001
**负责人**: Frontend-Agent
**优先级**: 🟡 中 (依赖UI-Agent和Backend-Agent)
**开始时间**: UI-Agent和Backend-Agent完成后
**截止时间**: Day 6 结束
**状态**: ⏳ 等待依赖完成

## 🎯 具体任务要求

### 1. Vue3 + Tailwind CSS 组件开发

基于UI-Agent的设计规范和Backend-Agent的API，开发以下组件：

#### 1.1 首页组件 (HomePage.vue)
```vue
<!-- 功能要求 -->
<template>
  <div class="home-page">
    <!-- 搜索栏组件 -->
    <SearchBar @search="handleSearch" />
    
    <!-- 分类导航组件 -->
    <CategoryNav :categories="categories" @select="handleCategorySelect" />
    
    <!-- 轮播图组件 -->
    <HeroBanner :banners="banners" />
    
    <!-- 热门推荐组件 -->
    <ProductGrid 
      :products="hotProducts" 
      title="热门推荐"
      @product-click="goToDetail"
    />
    
    <!-- 商品列表组件 -->
    <ProductList 
      :products="products"
      :loading="loading"
      @load-more="loadMore"
    />
  </div>
</template>

<script setup>
// 使用Composition API
// 集成Backend-Agent的API
// 实现响应式数据管理
</script>
```

**具体功能要求**:
- 商品分类横向滚动导航
- 搜索框with实时搜索建议
- 热门商品轮播展示
- 商品网格布局with懒加载
- 分页或无限滚动加载
- 筛选和排序功能

#### 1.2 商品详情页组件 (ProductDetail.vue)
```vue
<!-- 基于UI-Agent设计实现 -->
<template>
  <div class="product-detail">
    <!-- 图片画廊组件 -->
    <ProductGallery 
      :images="product.images"
      :main-image="mainImage"
      @image-change="handleImageChange"
    />
    
    <!-- 商品信息组件 -->
    <ProductInfo 
      :product="product"
      :selected-specs="selectedSpecs"
      @spec-change="handleSpecChange"
      @quantity-change="handleQuantityChange"
    />
    
    <!-- 操作按钮组件 -->
    <ProductActions
      :product="product"
      :quantity="quantity"
      :selected-specs="selectedSpecs"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />
    
    <!-- 商品描述标签页 -->
    <ProductTabs :product="product" />
  </div>
</template>
```

**具体功能要求**:
- 图片放大镜效果
- 规格选择器(颜色、尺寸等)
- 数量选择器with库存限制
- 加入购物车动画效果
- 立即购买流程
- 商品收藏功能
- 分享功能

#### 1.3 登录注册页组件 (AuthPage.vue)
```vue
<template>
  <div class="auth-page">
    <!-- 标签切换 -->
    <AuthTabs v-model="activeTab" />
    
    <!-- 登录表单 -->
    <LoginForm 
      v-if="activeTab === 'login'"
      @submit="handleLogin"
      :loading="loginLoading"
    />
    
    <!-- 注册表单 -->
    <RegisterForm 
      v-if="activeTab === 'register'"
      @submit="handleRegister"
      :loading="registerLoading"
    />
    
    <!-- 第三方登录 -->
    <SocialLogin @social-login="handleSocialLogin" />
  </div>
</template>
```

**具体功能要求**:
- 登录/注册表单切换
- 实时表单验证
- 密码强度指示器
- 邮箱格式验证
- 验证码输入
- 记住登录状态
- 第三方登录集成
- 错误提示显示

#### 1.4 购物车页组件 (CartPage.vue)
```vue
<template>
  <div class="cart-page">
    <!-- 购物车头部 -->
    <CartHeader :total-items="totalItems" />
    
    <!-- 购物车列表 -->
    <CartItemList 
      :items="cartItems"
      @quantity-change="handleQuantityChange"
      @remove-item="handleRemoveItem"
      @select-change="handleSelectChange"
    />
    
    <!-- 购物车摘要 -->
    <CartSummary 
      :selected-items="selectedItems"
      :total-amount="totalAmount"
    />
    
    <!-- 结算按钮 -->
    <CheckoutButton 
      :disabled="!hasSelectedItems"
      @checkout="handleCheckout"
    />
  </div>
</template>
```

**具体功能要求**:
- 商品列表展示
- 数量增减控制
- 单个/批量删除
- 全选/反选功能
- 实时价格计算
- 优惠券应用
- 运费计算
- 结算流程

### 2. 技术实现要求

#### 2.1 Vue3 Composition API
```javascript
// 使用组合式API
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'pinia'

// 状态管理
const useProductStore = () => {
  // 商品相关状态管理
}

const useCartStore = () => {
  // 购物车状态管理
}

const useUserStore = () => {
  // 用户状态管理
}
```

#### 2.2 API集成
```javascript
// api/index.js
import axios from 'axios'

// 请求拦截器
// 响应拦截器
// 错误处理
// Token管理

// 具体API调用
export const productAPI = {
  getProducts: (params) => {},
  getProductDetail: (id) => {},
  // ...
}

export const cartAPI = {
  getCart: () => {},
  addToCart: (data) => {},
  // ...
}
```

#### 2.3 路由配置
```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: HomePage },
  { path: '/product/:id', component: ProductDetail },
  { path: '/cart', component: CartPage },
  { path: '/auth', component: AuthPage },
  // 路由守卫
  // 权限控制
]
```

#### 2.4 状态管理 (Pinia)
```javascript
// stores/product.js
import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
    categories: [],
    loading: false
  }),
  
  actions: {
    async fetchProducts(params) {},
    async fetchProductDetail(id) {},
    // ...
  }
})
```

### 3. 响应式设计要求

#### 3.1 Tailwind CSS断点
```css
/* 移动端优先设计 */
.component {
  @apply block; /* 默认移动端 */
}

/* 平板端 */
@screen md {
  .component {
    @apply flex;
  }
}

/* 桌面端 */
@screen lg {
  .component {
    @apply grid grid-cols-2;
  }
}
```

#### 3.2 组件响应式
- 移动端: 单列布局，底部固定操作栏
- 平板端: 两列布局，侧边栏导航
- 桌面端: 多列布局，顶部导航

## 📋 交付清单

### 必须交付 ✅
- [ ] `frontend/src/pages/HomePage.vue` - 首页组件
- [ ] `frontend/src/pages/ProductDetail.vue` - 商品详情页
- [ ] `frontend/src/pages/AuthPage.vue` - 登录注册页
- [ ] `frontend/src/pages/CartPage.vue` - 购物车页
- [ ] `frontend/src/components/` - 子组件库
- [ ] `frontend/src/stores/` - Pinia状态管理
- [ ] `frontend/src/api/` - API调用封装
- [ ] `frontend/src/router/` - 路由配置
- [ ] `frontend/src/utils/` - 工具函数
- [ ] `frontend/README.md` - 组件使用文档

### 可选交付 🔄
- [ ] 单元测试文件
- [ ] E2E测试
- [ ] Storybook组件文档
- [ ] 性能优化报告

## 🔧 技术栈要求

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "@headlessui/vue": "^1.7.0",
    "@heroicons/vue": "^2.0.0"
  },
  "devDependencies": {
    "vite": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## 🔄 进度报告要求

**每日报告格式**:
```
📅 日期: [日期]
📈 总进度: [完成百分比]
✅ 今日完成:
  - [完成的组件]
  - [实现的功能]
🎯 明日计划:
  - [计划开发的组件]
🚫 遇到问题:
  - [技术难点]
  - [API集成问题]
💡 需要支持:
  - [需要Backend-Agent澄清的API]
  - [需要UI-Agent补充的设计]
```

---

**@Frontend-Agent 请等待依赖完成后立即开始执行！**

依赖状态检查:
- [ ] UI-Agent设计完成
- [ ] Backend-Agent API完成
- [ ] 开始执行时间: ___________
