<template>
  <view class="container">
    <view v-if="loading" class="loading text-center">
      <text>加载中...</text>
    </view>
    
    <view v-else-if="cartItems.length === 0" class="empty-cart text-center">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物车是空的</text>
      <button class="go-shopping-btn btn-primary" @click="goShopping">
        去购物
      </button>
    </view>
    
    <view v-else class="cart-content">
      <!-- 购物车列表 -->
      <view class="cart-list">
        <view 
          class="cart-item card"
          v-for="item in cartItems" 
          :key="item.id"
        >
          <view class="item-checkbox">
            <checkbox 
              :checked="item.selected" 
              @click="toggleSelect(item)"
              color="#007AFF"
            />
          </view>
          
          <image 
            class="item-image" 
            :src="item.product.image" 
            mode="aspectFill"
          ></image>
          
          <view class="item-info">
            <text class="item-name">{{ item.product.name }}</text>
            <text class="item-desc">{{ item.product.description }}</text>
            <view class="item-footer flex justify-between align-center">
              <text class="item-price price">¥{{ item.product.price }}</text>
              <view class="quantity-controls">
                <button 
                  class="quantity-btn" 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                >-</button>
                <text class="quantity-value">{{ item.quantity }}</text>
                <button 
                  class="quantity-btn" 
                  @click="increaseQuantity(item)"
                >+</button>
              </view>
            </view>
          </view>
          
          <view class="item-actions">
            <button class="delete-btn" @click="removeItem(item)">
              删除
            </button>
          </view>
        </view>
      </view>
      
      <!-- 底部结算栏 -->
      <view class="checkout-bar">
        <view class="select-all">
          <checkbox 
            :checked="allSelected" 
            @click="toggleSelectAll"
            color="#007AFF"
          />
          <text class="select-all-text">全选</text>
        </view>
        
        <view class="total-info">
          <text class="total-text">
            合计: <text class="total-price price">¥{{ totalPrice }}</text>
          </text>
          <text class="selected-count">已选择{{ selectedCount }}件商品</text>
        </view>
        
        <button 
          class="checkout-btn"
          :disabled="selectedCount === 0"
          @click="checkout"
        >
          结算({{ selectedCount }})
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cartItems: [],
      loading: false
    }
  },
  
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
  },
  
  onShow() {
    this.loadCartItems()
  },
  
  methods: {
    async loadCartItems() {
      const isLogin = uni.getStorageSync('isLogin')
      const token = uni.getStorageSync('token')

      if (!isLogin || !token) {
        this.cartItems = []
        return
      }

      this.loading = true
      try {
        const res = await this.$request({
          url: '/api/cart',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        // 处理返回的购物车数据
        if (res.data && res.data.items) {
          this.cartItems = res.data.items.map(item => ({
            ...item,
            selected: false // 默认不选中
          }))
        } else {
          this.cartItems = []
        }

      } catch (error) {
        console.error('加载购物车失败:', error)
        uni.showToast({
          title: '加载购物车失败',
          icon: 'none'
        })
        this.cartItems = []
      } finally {
        this.loading = false
      }
    },
    
    toggleSelect(item) {
      item.selected = !item.selected
    },
    
    toggleSelectAll() {
      const newSelectState = !this.allSelected
      this.cartItems.forEach(item => {
        item.selected = newSelectState
      })
    },
    
    async decreaseQuantity(item) {
      if (item.quantity > 1) {
        const newQuantity = item.quantity - 1
        await this.updateCartItem(item, newQuantity)
      }
    },

    async increaseQuantity(item) {
      // 检查库存限制
      if (item.product && item.product.stock && item.quantity >= item.product.stock) {
        uni.showToast({
          title: '库存不足',
          icon: 'none'
        })
        return
      }

      const newQuantity = item.quantity + 1
      await this.updateCartItem(item, newQuantity)
    },

    async updateCartItem(item, newQuantity) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      try {
        await this.$request({
          url: `/api/cart/${item.id}`,
          method: 'PUT',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            quantity: newQuantity
          }
        })

        // 更新本地数据
        item.quantity = newQuantity
        item.subtotal = item.product.price * newQuantity

      } catch (error) {
        console.error('更新购物车失败:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      }
    },
    
    removeItem(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个商品吗？',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteCartItem(item)
          }
        }
      })
    },

    async deleteCartItem(item) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }

      try {
        uni.showLoading({
          title: '删除中...'
        })

        await this.$request({
          url: `/api/cart/${item.id}`,
          method: 'DELETE',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        // 从本地数据中移除
        const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id)
        if (index > -1) {
          this.cartItems.splice(index, 1)
        }

        uni.hideLoading()
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })

      } catch (error) {
        uni.hideLoading()
        console.error('删除购物车项失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    },
    
    goShopping() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    
    checkout() {
      const selectedItems = this.cartItems.filter(item => item.selected)

      if (selectedItems.length === 0) {
        uni.showToast({
          title: '请选择要结算的商品',
          icon: 'none'
        })
        return
      }

      // 检查登录状态
      if (!this.$utils.checkLogin()) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          success: (res) => {
            if (res.confirm) {
              this.$utils.goLogin()
            }
          }
        })
        return
      }

      // 检查库存
      const outOfStockItems = selectedItems.filter(item =>
        item.product && item.quantity > item.product.stock
      )

      if (outOfStockItems.length > 0) {
        uni.showToast({
          title: '部分商品库存不足',
          icon: 'none'
        })
        return
      }

      // 跳转到订单确认页面
      const cartItemIds = selectedItems.map(item => item.id)
      const cartItemIdsStr = encodeURIComponent(JSON.stringify(cartItemIds))

      uni.navigateTo({
        url: `/pages/order/confirm?cartItemIds=${cartItemIdsStr}`
      })
    }
  }
}
</script>

<style scoped>
.empty-cart {
  padding: 200rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 40rpx;
  display: block;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 60rpx;
  display: block;
}

.go-shopping-btn {
  width: 300rpx;
  margin: 0 auto;
}

.cart-content {
  padding-bottom: 140rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.item-checkbox {
  margin-right: 20rpx;
}

.item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.item-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.item-footer {
  margin-top: 20rpx;
}

.item-price {
  font-size: 32rpx;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  overflow: hidden;
}

.quantity-btn {
  width: 50rpx;
  height: 50rpx;
  background: #f5f5f5;
  border: none;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
}

.quantity-value {
  width: 60rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  background: white;
  font-size: 24rpx;
}

.item-actions {
  margin-left: 20rpx;
}

.delete-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #eee;
}

.select-all {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.select-all-text {
  margin-left: 10rpx;
  font-size: 28rpx;
}

.total-info {
  flex: 1;
  text-align: center;
}

.total-text {
  font-size: 28rpx;
  margin-bottom: 5rpx;
  display: block;
}

.total-price {
  font-size: 32rpx;
}

.selected-count {
  font-size: 24rpx;
  color: #666;
}

.checkout-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: bold;
}

.checkout-btn:disabled {
  background: #ccc;
}

.loading {
  padding: 100rpx 20rpx;
  color: #666;
}
</style>
