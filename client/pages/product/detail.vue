<template>
  <view class="container">
    <view v-if="loading" class="loading text-center">
      <text>加载中...</text>
    </view>
    
    <view v-else-if="product" class="product-detail">
      <!-- 商品图片 -->
      <view class="product-images">
        <image 
          class="main-image" 
          :src="product.image" 
          mode="aspectFill"
          @click="previewImage"
        ></image>
      </view>
      
      <!-- 商品信息 -->
      <view class="product-info card">
        <view class="product-header">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-price price">¥{{ product.price }}</text>
        </view>
        
        <view class="product-meta">
          <text class="meta-item">库存: {{ product.stock }}件</text>
          <text class="meta-item">销量: {{ product.sales }}+</text>
        </view>
        
        <view class="product-description">
          <text class="desc-title">商品描述</text>
          <text class="desc-content">{{ product.description }}</text>
        </view>
      </view>
      
      <!-- 规格选择 -->
      <view class="spec-section card">
        <text class="section-title">选择规格</text>
        <view class="spec-options">
          <view class="quantity-selector">
            <text class="quantity-label">数量:</text>
            <view class="quantity-controls">
              <button 
                class="quantity-btn" 
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >-</button>
              <text class="quantity-value">{{ quantity }}</text>
              <button 
                class="quantity-btn" 
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
              >+</button>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 商品详情 -->
      <view class="detail-section card">
        <text class="section-title">商品详情</text>
        <view class="detail-content">
          <text class="detail-text">{{ product.description }}</text>
          <text class="detail-text">这是一款优质的数码产品，具有出色的性能和可靠的品质。</text>
          <text class="detail-text">适合各种使用场景，是您的理想选择。</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-actions" v-if="product">
      <button class="action-btn cart-btn" @click="addToCart">
        加入购物车
      </button>
      <button class="action-btn buy-btn" @click="buyNow">
        立即购买
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productId: null,
      product: null,
      loading: true,
      quantity: 1,
      selectedSpecs: {
        color: '',
        storage: ''
      },
      currentImageIndex: 0
    }
  },
  
  onLoad(options) {
    this.productId = options.id
    this.loadProductDetail()
  },
  
  methods: {
    async loadProductDetail() {
      if (!this.productId) {
        uni.showToast({
          title: '商品ID无效',
          icon: 'none'
        })
        return
      }

      this.loading = true
      try {
        const res = await this.$request({
          url: `/api/products/${this.productId}`,
          method: 'GET'
        })

        this.product = res.data

        // 设置默认选中的规格
        if (this.product.specs) {
          // 默认选中第一个颜色
          if (this.product.specs.colors && this.product.specs.colors.length > 0) {
            this.selectedSpecs.color = this.product.specs.colors[0].name
          }
          // 默认选中第一个存储容量
          if (this.product.specs.storage && this.product.specs.storage.length > 0) {
            this.selectedSpecs.storage = this.product.specs.storage[0].name
          }
        }

      } catch (error) {
        console.error('加载商品详情失败:', error)
        uni.showToast({
          title: '商品不存在或已下架',
          icon: 'none'
        })

        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 2000)
      } finally {
        this.loading = false
      }
    },

    previewImage() {
      if (this.product && this.product.images && this.product.images.length > 0) {
        uni.previewImage({
          urls: this.product.images,
          current: this.product.images[this.currentImageIndex]
        })
      }
    },

    // 切换商品图片
    switchImage(index) {
      this.currentImageIndex = index
    },

    // 选择规格
    selectSpec(specType, specValue) {
      this.selectedSpecs[specType] = specValue

      // 根据规格计算价格差异
      this.calculatePrice()
    },

    // 计算价格 (根据选中规格)
    calculatePrice() {
      if (!this.product || !this.product.specs) return this.product.price

      let totalPriceDiff = 0

      // 计算存储容量价格差异
      if (this.selectedSpecs.storage && this.product.specs.storage) {
        const storageSpec = this.product.specs.storage.find(s => s.name === this.selectedSpecs.storage)
        if (storageSpec && storageSpec.price_diff) {
          totalPriceDiff += storageSpec.price_diff
        }
      }

      return this.product.price + totalPriceDiff
    },

    // 获取当前选中规格的价格
    getCurrentPrice() {
      return this.calculatePrice()
    },
    
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    
    increaseQuantity() {
      if (this.quantity < this.product.stock) {
        this.quantity++
      }
    },
    
    async addToCart() {
      const isLogin = uni.getStorageSync('isLogin')
      const token = uni.getStorageSync('token')

      if (!isLogin || !token) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/user/login'
              })
            }
          }
        })
        return
      }

      // 检查是否选择了必要规格
      if (this.product.specs) {
        if (this.product.specs.colors && this.product.specs.colors.length > 0 && !this.selectedSpecs.color) {
          uni.showToast({
            title: '请选择颜色',
            icon: 'none'
          })
          return
        }

        if (this.product.specs.storage && this.product.specs.storage.length > 0 && !this.selectedSpecs.storage) {
          uni.showToast({
            title: '请选择存储容量',
            icon: 'none'
          })
          return
        }
      }

      try {
        uni.showLoading({
          title: '添加中...'
        })

        await this.$request({
          url: '/api/cart',
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            product_id: this.product.id,
            quantity: this.quantity,
            selected_specs: this.selectedSpecs
          }
        })

        uni.hideLoading()
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        })

        // 可选：震动反馈
        uni.vibrateShort()

      } catch (error) {
        uni.hideLoading()
        console.error('添加购物车失败:', error)
        uni.showToast({
          title: error.message || '添加失败',
          icon: 'none'
        })
      }
    },
    
    buyNow() {
      const isLogin = uni.getStorageSync('isLogin')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/user/login'
              })
            }
          }
        })
        return
      }
      
      // 直接购买逻辑
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.product-detail {
  padding-bottom: 120rpx;
}

.product-images {
  margin-bottom: 20rpx;
}

.main-image {
  width: 100%;
  height: 600rpx;
  border-radius: 16rpx;
}

.product-header {
  margin-bottom: 20rpx;
}

.product-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.product-price {
  font-size: 40rpx;
}

.product-meta {
  display: flex;
  gap: 40rpx;
  margin-bottom: 30rpx;
}

.meta-item {
  font-size: 28rpx;
  color: #666;
}

.product-description {
  border-top: 1rpx solid #eee;
  padding-top: 20rpx;
}

.desc-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.desc-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.quantity-label {
  font-size: 28rpx;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  overflow: hidden;
}

.quantity-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border: none;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
}

.quantity-value {
  width: 80rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background: white;
  font-size: 28rpx;
}

.detail-content {
  line-height: 1.8;
}

.detail-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.cart-btn {
  background: #ff9500;
  color: white;
}

.buy-btn {
  background: #007AFF;
  color: white;
}

.loading {
  padding: 100rpx 20rpx;
  color: #666;
}
</style>
