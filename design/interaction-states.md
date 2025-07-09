# 🎯 商品详情页交互状态定义

## 📋 交互状态概览

本文档定义了商品详情页所有交互元素的状态变化，包括视觉反馈、动画效果和用户操作响应。

## 🖼️ 图片画廊交互

### 主图交互状态

#### 1. 默认状态
```css
.main-image {
  @apply w-full h-full object-cover transition-transform duration-300;
}
```

#### 2. 悬停状态 (桌面端)
```css
.main-image-container:hover .main-image {
  @apply scale-105;
}

.main-image-container:hover .zoom-overlay {
  @apply opacity-100;
}
```

#### 3. 点击状态 (移动端)
```css
.main-image-container:active {
  @apply scale-95;
}
```

#### 4. 加载状态
```css
.main-image.loading {
  @apply opacity-50 bg-gray-200;
  background-image: url('data:image/svg+xml;base64,loading-spinner');
}
```

### 缩略图交互状态

#### 1. 默认状态
```css
.thumb-item {
  @apply w-16 h-16 lg:w-20 lg:h-20 rounded-md overflow-hidden border-2 border-gray-200 cursor-pointer transition-all duration-200;
}
```

#### 2. 悬停状态
```css
.thumb-item:hover {
  @apply border-blue-300 shadow-md transform scale-105;
}
```

#### 3. 选中状态
```css
.thumb-item.active {
  @apply border-blue-500 shadow-lg;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
```

#### 4. 点击状态
```css
.thumb-item:active {
  @apply scale-95;
}
```

### 放大镜效果 (桌面端专用)

#### 实现逻辑
```javascript
// 鼠标移动时显示放大镜
const mainImageContainer = document.querySelector('.main-image-container');
const zoomLens = document.querySelector('.zoom-lens');

mainImageContainer.addEventListener('mousemove', (e) => {
  const rect = mainImageContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 更新放大镜位置
  zoomLens.style.left = `${x - 64}px`; // 64px = lens width/2
  zoomLens.style.top = `${y - 64}px`;
  zoomLens.style.display = 'block';
});

mainImageContainer.addEventListener('mouseleave', () => {
  zoomLens.style.display = 'none';
});
```

## 🎛️ 规格选择交互

### 规格按钮状态

#### 1. 默认状态
```css
.spec-option {
  @apply px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white cursor-pointer transition-all duration-200;
}
```

#### 2. 悬停状态
```css
.spec-option:hover {
  @apply border-blue-400 shadow-sm transform translateY(-1px);
}
```

#### 3. 选中状态
```css
.spec-option.active {
  @apply bg-blue-500 text-white border-blue-500 shadow-md;
}
```

#### 4. 禁用状态
```css
.spec-option:disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100 text-gray-400;
}
```

#### 5. 点击动画
```css
.spec-option:active {
  @apply scale-95;
}
```

### 规格切换动画
```javascript
// 规格选择动画效果
function selectSpec(button, group) {
  // 移除其他选中状态
  group.querySelectorAll('.spec-option').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('animate-pulse'); // 短暂脉冲效果
    setTimeout(() => btn.classList.remove('animate-pulse'), 200);
  });
  
  // 添加选中状态
  button.classList.add('active');
  
  // 价格更新动画
  updatePriceWithAnimation();
}
```

## 🔢 数量选择器交互

### 数量按钮状态

#### 1. 默认状态
```css
.quantity-btn {
  @apply w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-0 cursor-pointer transition-colors duration-200;
}
```

#### 2. 悬停状态
```css
.quantity-btn:hover {
  @apply bg-gray-100 shadow-sm;
}
```

#### 3. 点击状态
```css
.quantity-btn:active {
  @apply bg-gray-200 scale-95;
}
```

#### 4. 禁用状态
```css
.quantity-btn:disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-50;
}
```

### 数量输入框状态

#### 1. 默认状态
```css
.quantity-input {
  @apply w-16 h-10 text-center border-0 focus:ring-0 focus:outline-none bg-white;
}
```

#### 2. 焦点状态
```css
.quantity-input:focus {
  @apply bg-blue-50 ring-2 ring-blue-200;
}
```

#### 3. 错误状态
```css
.quantity-input.error {
  @apply bg-red-50 text-red-600 ring-2 ring-red-200;
}
```

### 数量变化动画
```javascript
// 数量变化时的动画效果
function updateQuantity(newValue) {
  const input = document.querySelector('.quantity-input');
  const priceElement = document.querySelector('.current-price');
  
  // 输入框闪烁效果
  input.classList.add('animate-pulse');
  setTimeout(() => input.classList.remove('animate-pulse'), 300);
  
  // 价格更新动画
  priceElement.classList.add('animate-bounce');
  setTimeout(() => priceElement.classList.remove('animate-bounce'), 500);
}
```

## 🛒 操作按钮交互

### 主要按钮状态

#### 1. 加入购物车按钮
```css
/* 默认状态 */
.btn-add-cart {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-orange-200;
}

/* 悬停状态 */
.btn-add-cart:hover {
  @apply bg-orange-600 shadow-lg transform translateY(-1px);
}

/* 点击状态 */
.btn-add-cart:active {
  @apply scale-95 transform translateY(0);
}

/* 加载状态 */
.btn-add-cart.loading {
  @apply opacity-75 cursor-not-allowed;
}
```

#### 2. 立即购买按钮
```css
/* 默认状态 */
.btn-buy-now {
  @apply bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-red-200;
}

/* 悬停状态 */
.btn-buy-now:hover {
  @apply bg-red-600 shadow-lg transform translateY(-1px);
}

/* 点击状态 */
.btn-buy-now:active {
  @apply scale-95;
}
```

### 次要按钮状态

#### 1. 收藏按钮
```css
/* 默认状态 */
.btn-favorite {
  @apply border border-gray-300 text-gray-600 py-2 px-4 rounded-lg transition-all duration-200;
}

/* 悬停状态 */
.btn-favorite:hover {
  @apply border-red-500 text-red-500 bg-red-50;
}

/* 收藏状态 */
.btn-favorite.favorited {
  @apply border-red-500 text-red-500 bg-red-500 text-white;
}
```

#### 2. 分享按钮
```css
/* 默认状态 */
.btn-share {
  @apply border border-gray-300 text-gray-600 py-2 px-4 rounded-lg transition-all duration-200;
}

/* 悬停状态 */
.btn-share:hover {
  @apply border-blue-500 text-blue-500 bg-blue-50;
}
```

### 按钮点击动画
```javascript
// 加入购物车成功动画
function addToCartAnimation(button) {
  // 按钮状态变化
  button.innerHTML = '<span class="animate-spin">⏳</span> 添加中...';
  button.disabled = true;
  
  // 模拟API调用
  setTimeout(() => {
    button.innerHTML = '✅ 添加成功';
    button.classList.add('bg-green-500');
    
    // 恢复原状态
    setTimeout(() => {
      button.innerHTML = '🛒 加入购物车';
      button.classList.remove('bg-green-500');
      button.disabled = false;
    }, 1500);
  }, 1000);
}
```

## 📑 标签页交互

### 标签按钮状态

#### 1. 默认状态
```css
.tab-item {
  @apply border-b-2 border-transparent text-gray-500 py-2 px-1 text-sm font-medium cursor-pointer transition-all duration-200;
}
```

#### 2. 悬停状态
```css
.tab-item:hover {
  @apply text-gray-700 border-gray-300;
}
```

#### 3. 激活状态
```css
.tab-item.active {
  @apply border-blue-500 text-blue-600;
}
```

### 标签切换动画
```javascript
// 标签页切换动画
function switchTab(activeTab, content) {
  // 内容淡出
  content.classList.add('opacity-0');
  
  setTimeout(() => {
    // 更新内容
    updateTabContent(activeTab);
    
    // 内容淡入
    content.classList.remove('opacity-0');
    content.classList.add('animate-fadeIn');
  }, 150);
}
```

## 🎨 加载和错误状态

### 加载状态

#### 1. 骨架屏
```css
.skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

.skeleton-text {
  @apply h-4 bg-gray-200 rounded animate-pulse;
}

.skeleton-image {
  @apply aspect-square bg-gray-200 rounded-lg animate-pulse;
}
```

#### 2. 加载指示器
```css
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin;
}
```

### 错误状态

#### 1. 图片加载失败
```css
.image-error {
  @apply bg-gray-100 flex items-center justify-center text-gray-400;
}
```

#### 2. 网络错误提示
```css
.error-message {
  @apply bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg;
}
```

## 📱 移动端特殊交互

### 触摸反馈
```css
.touch-feedback {
  @apply active:bg-gray-100 active:scale-95 transition-all duration-100;
}
```

### 滑动手势
```javascript
// 图片滑动切换
let startX = 0;
let currentX = 0;

mainImage.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

mainImage.addEventListener('touchmove', (e) => {
  currentX = e.touches[0].clientX;
});

mainImage.addEventListener('touchend', () => {
  const diffX = startX - currentX;
  
  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextImage(); // 向左滑动，下一张
    } else {
      prevImage(); // 向右滑动，上一张
    }
  }
});
```

### 底部操作栏动画
```css
.mobile-bottom-bar {
  @apply transform transition-transform duration-300;
}

.mobile-bottom-bar.hidden {
  @apply translate-y-full;
}

.mobile-bottom-bar.visible {
  @apply translate-y-0;
}
```

## 🎯 无障碍交互

### 键盘导航
```css
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### 屏幕阅读器支持
```html
<!-- ARIA标签 -->
<button aria-label="加入购物车" aria-describedby="cart-help">
  🛒 加入购物车
</button>

<div id="cart-help" class="sr-only">
  将商品添加到购物车，可稍后结算
</div>
```

## ✅ 交互测试清单

### 基础交互
- [ ] 所有按钮都有悬停效果
- [ ] 点击反馈及时且明显
- [ ] 加载状态清晰可见
- [ ] 错误状态有明确提示

### 图片交互
- [ ] 缩略图切换流畅
- [ ] 主图放大效果正常
- [ ] 移动端滑动切换正常

### 规格选择
- [ ] 规格切换动画流畅
- [ ] 价格更新及时
- [ ] 库存状态正确显示

### 响应式交互
- [ ] 移动端触摸反馈正常
- [ ] 桌面端鼠标交互正常
- [ ] 跨设备交互一致

这个交互状态定义确保了商品详情页的所有交互都有清晰的视觉反馈和流畅的用户体验！
