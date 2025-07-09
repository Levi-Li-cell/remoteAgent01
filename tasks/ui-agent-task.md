# 🎨 UI-Agent 任务执行单

## 📋 任务概述
**任务ID**: UI-001
**负责人**: UI-Agent
**优先级**: 🔴 高
**开始时间**: 立即
**截止时间**: Day 1 结束 (今天)
**状态**: 🟢 进行中

## 🎯 具体任务要求

### 1. 商品详情页布局设计
基于已提供的设计规范，完善以下设计细节：

#### 桌面端布局 (≥1024px)
```html
<!-- 请完善这个结构的具体设计 -->
<div class="product-detail-container">
  <div class="grid grid-cols-2 gap-12">
    <!-- 左侧图片区域 - 请详细设计 -->
    <section class="product-gallery">
      <!-- 主图区域设计 -->
      <!-- 缩略图区域设计 -->
      <!-- 图片切换交互设计 -->
    </section>
    
    <!-- 右侧信息区域 - 请详细设计 -->
    <section class="product-info">
      <!-- 标题价格区域设计 -->
      <!-- 规格选择区域设计 -->
      <!-- 操作按钮区域设计 -->
    </section>
  </div>
</div>
```

#### 移动端布局 (<1024px)
```html
<!-- 请设计移动端的上下布局结构 -->
<div class="mobile-product-detail">
  <!-- 移动端图片区域 -->
  <!-- 移动端信息区域 -->
  <!-- 移动端固定底部操作栏 -->
</div>
```

### 2. 组件交互状态设计

#### 图片交互
- 缩略图悬停效果
- 主图放大镜效果
- 图片切换动画
- 移动端滑动切换

#### 规格选择交互
- 规格按钮选中/未选中状态
- 数量选择器交互
- 库存不足状态显示

#### 按钮交互
- 加入购物车按钮状态
- 立即购买按钮状态
- 收藏按钮状态
- 分享按钮状态

### 3. Tailwind CSS 类名规范

请为每个组件定义标准的CSS类名：

```css
/* 主容器类名 */
.product-detail-container { }
.product-gallery { }
.product-info { }

/* 图片相关类名 */
.gallery-main { }
.gallery-thumbs { }
.main-image { }
.thumb-image { }

/* 信息区域类名 */
.info-header { }
.info-price { }
.info-specs { }
.info-actions { }

/* 按钮类名 */
.btn-add-cart { }
.btn-buy-now { }
.btn-favorite { }
.btn-share { }
```

## 📋 交付清单

请在今天结束前提交以下文件：

### 必须交付 ✅
- [ ] `design/product-detail-layout.html` - 完整HTML结构
- [ ] `design/tailwind-classes.css` - Tailwind类名规范
- [ ] `design/responsive-design.md` - 响应式设计说明
- [ ] `design/interaction-states.md` - 交互状态定义

### 可选交付 🔄
- [ ] 设计效果图或原型
- [ ] 颜色和字体规范补充
- [ ] 动画效果说明

## 🔄 进度报告要求

请每2小时更新一次进度：

**进度报告格式**:
```
⏰ 时间: [当前时间]
📈 进度: [完成百分比]
✅ 已完成: [具体完成的工作]
🎯 进行中: [正在进行的工作]
🚫 问题: [遇到的问题，如有]
⏭️ 下一步: [接下来的计划]
```

## 🚨 重要提醒

1. **依赖关系**: Backend-Agent和Frontend-Agent都在等待您的设计
2. **质量要求**: 设计必须具备可实现性，考虑技术限制
3. **时间紧迫**: 今天必须完成，影响整体项目进度
4. **沟通及时**: 遇到问题立即反馈，不要等到最后

---

**@UI-Agent 请立即确认收到任务并开始执行！**

预计完成时间: ___________
是否需要澄清任何需求: ___________
