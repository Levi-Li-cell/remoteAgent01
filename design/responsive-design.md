# 📱 商品详情页响应式设计规范

## 🎯 设计目标
确保商品详情页在所有设备上都能提供优秀的用户体验，从手机到桌面端都有合适的布局和交互方式。

## 📐 断点系统

### Tailwind CSS 断点定义
```css
/* 移动端 (默认) */
/* 0px - 639px */

/* 小屏幕 (sm) */
@media (min-width: 640px) { }

/* 中等屏幕 (md) */
@media (min-width: 768px) { }

/* 大屏幕 (lg) */
@media (min-width: 1024px) { }

/* 超大屏幕 (xl) */
@media (min-width: 1280px) { }

/* 2K屏幕 (2xl) */
@media (min-width: 1536px) { }
```

### 项目使用的关键断点
- **移动端**: < 1024px (lg以下)
- **桌面端**: ≥ 1024px (lg及以上)

## 📱 移动端设计 (< 1024px)

### 布局结构
```html
<div class="product-detail-container">
  <!-- 固定顶部导航 -->
  <nav class="sticky top-0">
    <!-- 返回按钮 + 标题 + 分享 -->
  </nav>
  
  <!-- 垂直滚动内容 -->
  <main class="px-4 py-6">
    <!-- 图片区域 (全宽) -->
    <section class="product-gallery mb-6">
      <!-- 主图 aspect-square -->
      <!-- 缩略图横向滚动 -->
    </section>
    
    <!-- 商品信息区域 -->
    <section class="product-info">
      <!-- 标题、价格、规格、按钮 -->
    </section>
    
    <!-- 详情描述 -->
    <section class="product-description">
      <!-- 标签页内容 -->
    </section>
  </main>
  
  <!-- 固定底部操作栏 -->
  <div class="fixed bottom-0 left-0 right-0">
    <!-- 加入购物车 + 立即购买 -->
  </div>
</div>
```

### 关键特性
1. **垂直布局**: 所有内容垂直排列
2. **全宽图片**: 图片占满容器宽度
3. **固定操作栏**: 底部固定购买按钮
4. **触摸优化**: 按钮尺寸适合手指点击
5. **滑动交互**: 缩略图支持横向滑动

### 移动端样式类名
```css
/* 移动端专用类名 */
.mobile-layout {
  @apply block lg:hidden;
}

.mobile-full-width {
  @apply w-full;
}

.mobile-bottom-bar {
  @apply lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40;
}

.mobile-touch-target {
  @apply min-h-[44px] min-w-[44px]; /* 44px是推荐的最小触摸目标 */
}
```

## 💻 桌面端设计 (≥ 1024px)

### 布局结构
```html
<div class="product-detail-container">
  <!-- 顶部导航 -->
  <nav class="sticky top-0">
    <!-- 导航内容 -->
  </nav>
  
  <!-- 主内容区域 -->
  <main class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- 左右两栏布局 -->
    <div class="grid grid-cols-2 gap-12">
      <!-- 左侧图片区域 -->
      <section class="product-gallery">
        <!-- 主图 + 缩略图 -->
      </section>
      
      <!-- 右侧信息区域 -->
      <section class="product-info">
        <!-- 商品信息 + 操作按钮 -->
      </section>
    </div>
    
    <!-- 全宽详情区域 -->
    <section class="product-description mt-12">
      <!-- 详情内容 -->
    </section>
  </main>
</div>
```

### 关键特性
1. **左右布局**: 图片和信息并排显示
2. **鼠标交互**: 悬停效果和放大镜
3. **更大间距**: 充分利用屏幕空间
4. **内联操作**: 操作按钮在信息区域内
5. **网格布局**: 使用CSS Grid进行精确布局

### 桌面端样式类名
```css
/* 桌面端专用类名 */
.desktop-layout {
  @apply hidden lg:block;
}

.desktop-grid {
  @apply lg:grid lg:grid-cols-2 lg:gap-12;
}

.desktop-spacing {
  @apply lg:px-6 lg:py-8;
}

.hover-effects {
  @apply hover:scale-105 hover:shadow-lg transition-all duration-300;
}
```

## 🔄 响应式组件设计

### 1. 图片画廊组件

#### 移动端
```html
<div class="product-gallery">
  <!-- 主图 -->
  <div class="aspect-square mb-4">
    <img class="w-full h-full object-cover rounded-lg" />
  </div>
  
  <!-- 缩略图 - 横向滚动 -->
  <div class="flex gap-2 overflow-x-auto pb-2">
    <div class="flex-shrink-0 w-16 h-16">
      <img class="w-full h-full object-cover rounded" />
    </div>
  </div>
</div>
```

#### 桌面端
```html
<div class="product-gallery">
  <!-- 主图 - 悬停放大 -->
  <div class="aspect-square mb-4 group">
    <img class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
    <!-- 放大镜效果 -->
    <div class="zoom-overlay opacity-0 group-hover:opacity-100"></div>
  </div>
  
  <!-- 缩略图 - 网格布局 -->
  <div class="grid grid-cols-5 gap-2">
    <div class="aspect-square">
      <img class="w-full h-full object-cover rounded hover:border-blue-500" />
    </div>
  </div>
</div>
```

### 2. 操作按钮组件

#### 移动端 - 固定底部
```html
<div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
  <div class="flex gap-3">
    <button class="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium">
      加入购物车
    </button>
    <button class="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium">
      立即购买
    </button>
  </div>
</div>
```

#### 桌面端 - 内联显示
```html
<div class="space-y-3">
  <div class="flex gap-3">
    <button class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg">
      加入购物车
    </button>
    <button class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg">
      立即购买
    </button>
  </div>
  
  <div class="flex gap-3">
    <button class="flex-1 border border-gray-300 hover:border-red-500 py-2 px-4 rounded-lg">
      收藏
    </button>
    <button class="flex-1 border border-gray-300 hover:border-blue-500 py-2 px-4 rounded-lg">
      分享
    </button>
  </div>
</div>
```

### 3. 规格选择组件

#### 响应式规格按钮
```html
<div class="spec-options flex flex-wrap gap-2">
  <button class="px-3 py-2 md:px-4 md:py-2 border rounded-md text-sm md:text-base">
    深空黑
  </button>
</div>
```

## 📏 尺寸规范

### 图片尺寸
```css
/* 主图 */
.main-image {
  /* 移动端: 全宽正方形 */
  @apply aspect-square w-full;
  
  /* 桌面端: 最大600px */
  @apply lg:max-w-[600px];
}

/* 缩略图 */
.thumb-image {
  /* 移动端: 64px */
  @apply w-16 h-16;
  
  /* 桌面端: 80px */
  @apply lg:w-20 lg:h-20;
}
```

### 按钮尺寸
```css
/* 主要按钮 */
.primary-button {
  /* 移动端: 48px高度 */
  @apply h-12 px-4;
  
  /* 桌面端: 更大内边距 */
  @apply lg:h-12 lg:px-6;
}

/* 次要按钮 */
.secondary-button {
  /* 移动端: 40px高度 */
  @apply h-10 px-3;
  
  /* 桌面端: 标准高度 */
  @apply lg:h-10 lg:px-4;
}
```

### 间距规范
```css
/* 容器内边距 */
.container-padding {
  /* 移动端: 16px */
  @apply px-4;
  
  /* 桌面端: 24px */
  @apply lg:px-6;
}

/* 组件间距 */
.component-spacing {
  /* 移动端: 24px */
  @apply space-y-6;
  
  /* 桌面端: 32px */
  @apply lg:space-y-8;
}
```

## 🎨 交互状态

### 悬停效果 (仅桌面端)
```css
.hover-effect {
  @apply lg:hover:scale-105 lg:hover:shadow-lg lg:transition-all lg:duration-300;
}
```

### 触摸反馈 (移动端)
```css
.touch-feedback {
  @apply active:scale-95 transition-transform duration-100;
}
```

### 焦点状态 (无障碍)
```css
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

## 🔧 实现建议

### 1. 使用Tailwind的响应式前缀
```html
<!-- 移动端隐藏，桌面端显示 -->
<div class="hidden lg:block">桌面端内容</div>

<!-- 移动端显示，桌面端隐藏 -->
<div class="block lg:hidden">移动端内容</div>

<!-- 响应式网格 -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
```

### 2. 条件渲染 (Vue.js)
```vue
<template>
  <!-- 移动端布局 -->
  <div v-if="isMobile" class="mobile-layout">
    <!-- 移动端特定内容 -->
  </div>
  
  <!-- 桌面端布局 -->
  <div v-else class="desktop-layout">
    <!-- 桌面端特定内容 -->
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const isMobile = ref(false)
    
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 1024
    }
    
    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
    })
    
    return { isMobile }
  }
}
</script>
```

### 3. CSS媒体查询补充
```css
/* 超小屏幕优化 */
@media (max-width: 375px) {
  .product-title {
    font-size: 1.25rem; /* 20px */
  }
  
  .price-main {
    font-size: 1.75rem; /* 28px */
  }
}

/* 大屏幕优化 */
@media (min-width: 1536px) {
  .product-main {
    max-width: 1400px;
  }
}
```

## ✅ 测试检查清单

### 移动端测试
- [ ] 在iPhone SE (375px) 上正常显示
- [ ] 在标准手机 (414px) 上正常显示
- [ ] 底部操作栏不遮挡内容
- [ ] 缩略图可以横向滑动
- [ ] 按钮大小适合触摸操作

### 桌面端测试
- [ ] 在1024px宽度下正常显示
- [ ] 在1920px宽度下正常显示
- [ ] 悬停效果正常工作
- [ ] 左右布局比例合适
- [ ] 放大镜效果流畅

### 跨设备测试
- [ ] 从移动端切换到桌面端布局正常
- [ ] 所有断点过渡平滑
- [ ] 图片在不同尺寸下清晰
- [ ] 文字在所有设备上可读

这个响应式设计规范确保了商品详情页在所有设备上都能提供最佳的用户体验！
