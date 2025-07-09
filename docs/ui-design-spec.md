# 🎨 商品详情页UI设计规范

## 📱 页面布局设计

### 整体结构
```html
<!-- 商品详情页主容器 -->
<div class="product-detail-container min-h-screen bg-gray-50">
  <!-- 导航栏 -->
  <nav class="product-nav sticky top-0 z-50 bg-white shadow-sm">
    <!-- 返回按钮 + 标题 + 分享按钮 -->
  </nav>
  
  <!-- 主内容区 -->
  <main class="product-main container mx-auto px-4 py-6 max-w-7xl">
    <!-- 桌面端: 左右布局 | 移动端: 上下布局 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      
      <!-- 左侧: 商品图片区域 -->
      <section class="product-gallery">
        <!-- 主图显示区 -->
        <div class="gallery-main mb-4">
          <div class="main-image-container relative aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
            <img class="main-image w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
            <!-- 放大镜效果 -->
            <div class="zoom-overlay absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
              <div class="zoom-lens absolute border-2 border-blue-500 pointer-events-none"></div>
            </div>
          </div>
        </div>
        
        <!-- 缩略图列表 -->
        <div class="gallery-thumbs">
          <div class="thumbs-container flex gap-2 overflow-x-auto pb-2">
            <div class="thumb-item flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer transition-colors">
              <img class="w-full h-full object-cover" />
            </div>
            <!-- 重复缩略图项 -->
          </div>
        </div>
      </section>
      
      <!-- 右侧: 商品信息区域 -->
      <section class="product-info">
        <!-- 商品标题区 -->
        <header class="info-header mb-6">
          <h1 class="product-title text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            商品标题
          </h1>
          <p class="product-subtitle text-gray-600 text-sm lg:text-base">
            商品副标题或简短描述
          </p>
        </header>
        
        <!-- 价格区域 -->
        <div class="info-price mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
          <div class="price-main flex items-baseline gap-2 mb-2">
            <span class="current-price text-3xl lg:text-4xl font-bold text-red-600">
              ¥<span class="price-value">999</span>
            </span>
            <span class="original-price text-lg text-gray-400 line-through">
              ¥1299
            </span>
            <span class="discount-badge bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              7.7折
            </span>
          </div>
          <div class="price-info flex gap-4 text-sm text-gray-600">
            <span class="stock-info">库存: <span class="stock-count text-green-600 font-medium">99</span>件</span>
            <span class="sales-info">已售: <span class="sales-count font-medium">1200</span>+</span>
          </div>
        </div>
        
        <!-- 商品规格选择区 -->
        <div class="info-specs mb-6 space-y-4">
          <!-- 颜色选择 -->
          <div class="spec-group">
            <label class="spec-label block text-sm font-medium text-gray-700 mb-2">
              颜色分类
            </label>
            <div class="spec-options flex flex-wrap gap-2">
              <button class="spec-option px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors">
                深空灰
              </button>
              <button class="spec-option active bg-blue-500 text-white border-blue-500 px-4 py-2 border rounded-md text-sm">
                银色
              </button>
            </div>
          </div>
          
          <!-- 容量选择 -->
          <div class="spec-group">
            <label class="spec-label block text-sm font-medium text-gray-700 mb-2">
              存储容量
            </label>
            <div class="spec-options flex flex-wrap gap-2">
              <button class="spec-option px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-blue-500 transition-colors">
                128GB
              </button>
              <button class="spec-option active bg-blue-500 text-white border-blue-500 px-4 py-2 border rounded-md text-sm">
                256GB
              </button>
              <button class="spec-option px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-blue-500 transition-colors">
                512GB
              </button>
            </div>
          </div>
          
          <!-- 数量选择 -->
          <div class="spec-group">
            <label class="spec-label block text-sm font-medium text-gray-700 mb-2">
              购买数量
            </label>
            <div class="quantity-selector flex items-center gap-3">
              <div class="quantity-controls flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button class="quantity-btn decrease w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50">
                  -
                </button>
                <input class="quantity-input w-16 h-10 text-center border-0 focus:ring-0" type="number" value="1" min="1" />
                <button class="quantity-btn increase w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  +
                </button>
              </div>
              <span class="quantity-limit text-sm text-gray-500">
                限购5件
              </span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮区 -->
        <div class="info-actions space-y-3">
          <!-- 主要操作按钮 -->
          <div class="action-buttons flex gap-3">
            <button class="btn-add-cart flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-4 focus:ring-orange-200">
              <span class="btn-icon mr-2">🛒</span>
              加入购物车
            </button>
            <button class="btn-buy-now flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-4 focus:ring-red-200">
              立即购买
            </button>
          </div>
          
          <!-- 次要操作按钮 -->
          <div class="secondary-actions flex gap-3">
            <button class="btn-favorite flex-1 border border-gray-300 hover:border-red-500 hover:text-red-500 text-gray-600 py-2 px-4 rounded-lg transition-colors">
              <span class="btn-icon mr-1">❤️</span>
              收藏
            </button>
            <button class="btn-share flex-1 border border-gray-300 hover:border-blue-500 hover:text-blue-500 text-gray-600 py-2 px-4 rounded-lg transition-colors">
              <span class="btn-icon mr-1">📤</span>
              分享
            </button>
          </div>
        </div>
        
        <!-- 服务保障 -->
        <div class="service-guarantee mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="guarantee-title text-sm font-medium text-gray-700 mb-2">服务保障</h3>
          <div class="guarantee-list grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div class="guarantee-item flex items-center">
              <span class="item-icon mr-1">✅</span>
              正品保证
            </div>
            <div class="guarantee-item flex items-center">
              <span class="item-icon mr-1">🚚</span>
              快速配送
            </div>
            <div class="guarantee-item flex items-center">
              <span class="item-icon mr-1">🔄</span>
              7天退换
            </div>
            <div class="guarantee-item flex items-center">
              <span class="item-icon mr-1">🛡️</span>
              售后保障
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- 商品详情描述区 (全宽) -->
    <section class="product-description mt-12">
      <div class="description-tabs border-b border-gray-200 mb-6">
        <nav class="tab-nav flex space-x-8">
          <button class="tab-item active border-b-2 border-blue-500 text-blue-600 py-2 px-1 text-sm font-medium">
            商品详情
          </button>
          <button class="tab-item border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
            规格参数
          </button>
          <button class="tab-item border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium">
            用户评价
          </button>
        </nav>
      </div>
      
      <div class="description-content">
        <!-- 商品详情内容 -->
        <div class="content-panel bg-white rounded-lg p-6">
          <!-- 详情图片和文字内容 -->
        </div>
      </div>
    </section>
  </main>
  
  <!-- 移动端底部固定操作栏 -->
  <div class="mobile-bottom-bar lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
    <div class="flex gap-3">
      <button class="btn-mobile-cart flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium">
        加入购物车
      </button>
      <button class="btn-mobile-buy flex-1 bg-red-500 text-white py-3 rounded-lg font-medium">
        立即购买
      </button>
    </div>
  </div>
</div>
```

## 🎨 设计规范

### 颜色系统
```css
/* 主色调 */
--primary-blue: #3B82F6    /* 主要操作色 */
--primary-red: #EF4444     /* 价格、购买按钮 */
--primary-orange: #F97316  /* 购物车按钮 */

/* 中性色 */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-300: #D1D5DB
--gray-600: #4B5563
--gray-900: #111827

/* 状态色 */
--success-green: #10B981
--warning-yellow: #F59E0B
--error-red: #EF4444
```

### 字体规范
```css
/* 标题字体 */
.product-title { font-size: 1.875rem; font-weight: 700; } /* 30px */
.section-title { font-size: 1.25rem; font-weight: 600; }  /* 20px */

/* 正文字体 */
.body-large { font-size: 1rem; line-height: 1.5; }       /* 16px */
.body-medium { font-size: 0.875rem; line-height: 1.4; }  /* 14px */
.body-small { font-size: 0.75rem; line-height: 1.3; }    /* 12px */

/* 价格字体 */
.price-large { font-size: 2.25rem; font-weight: 700; }   /* 36px */
.price-medium { font-size: 1.5rem; font-weight: 600; }   /* 24px */
```

### 间距规范
```css
/* 组件间距 */
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */

/* 容器间距 */
--container-padding: 1rem;      /* 移动端 */
--container-padding-lg: 1.5rem; /* 桌面端 */
```

### 响应式断点
```css
/* Tailwind CSS 断点 */
sm: 640px   /* 小屏幕 */
md: 768px   /* 中等屏幕 */
lg: 1024px  /* 大屏幕 */
xl: 1280px  /* 超大屏幕 */
```

## 📱 交互状态设计

### 按钮状态
- **默认**: 正常显示状态
- **悬停**: hover:bg-opacity-90 + 轻微阴影
- **激活**: active:scale-95 + 按下效果
- **禁用**: opacity-50 + cursor-not-allowed
- **加载**: 显示loading图标 + 禁用点击

### 图片交互
- **缩略图悬停**: 边框高亮 + 轻微放大
- **主图悬停**: 显示放大镜效果
- **图片切换**: 淡入淡出过渡动画

### 规格选择
- **未选中**: 灰色边框 + 白色背景
- **已选中**: 蓝色边框 + 蓝色背景 + 白色文字
- **悬停**: 边框颜色变化 + 轻微阴影

这个设计规范为Frontend-Agent提供了完整的实现指导！
