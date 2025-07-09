<template>
  <view class="order-confirm-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">确认订单</view>
      <view class="nav-right"></view>
    </view>

    <!-- 收货地址 -->
    <view class="address-section" @click="selectAddress">
      <view class="address-header">
        <text class="address-title">收货地址</text>
        <text class="address-arrow">></text>
      </view>
      
      <view v-if="selectedAddress" class="address-content">
        <view class="address-info">
          <text class="address-name">{{ selectedAddress.name }}</text>
          <text class="address-phone">{{ selectedAddress.phone }}</text>
        </view>
        <view class="address-detail">
          {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
        </view>
      </view>
      
      <view v-else class="address-empty">
        <text class="empty-text">请选择收货地址</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-title">商品清单</view>
      
      <view class="goods-list">
        <view v-for="item in orderItems" :key="item.id" class="goods-item">
          <image class="goods-image" :src="item.product.images[0]" mode="aspectFill"></image>
          
          <view class="goods-info">
            <view class="goods-name">{{ item.product.name }}</view>
            <view class="goods-specs" v-if="item.selected_specs">
              <text v-for="(value, key) in item.selected_specs" :key="key" class="spec-item">
                {{ value }}
              </text>
            </view>
            <view class="goods-price-qty">
              <text class="goods-price">¥{{ item.product.price }}</text>
              <text class="goods-qty">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">支付方式</view>
      
      <view class="payment-methods">
        <view 
          v-for="method in paymentMethods" 
          :key="method.value"
          class="payment-item"
          :class="{ active: selectedPayment === method.value }"
          @click="selectPayment(method.value)"
        >
          <view class="payment-info">
            <text class="payment-icon">{{ method.icon }}</text>
            <text class="payment-name">{{ method.name }}</text>
          </view>
          <view class="payment-radio">
            <view v-if="selectedPayment === method.value" class="radio-checked"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section">
      <view class="section-title">订单备注</view>
      <textarea 
        class="remark-input" 
        placeholder="选填，请输入订单备注"
        v-model="orderRemark"
        maxlength="200"
      ></textarea>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品总价</text>
        <text class="price-value">¥{{ totalPrice }}</text>
      </view>
      <view class="price-item">
        <text class="price-label">运费</text>
        <text class="price-value">¥{{ shippingFee }}</text>
      </view>
      <view class="price-item total">
        <text class="price-label">实付款</text>
        <text class="price-value total-price">¥{{ finalPrice }}</text>
      </view>
    </view>

    <!-- 底部提交栏 -->
    <view class="submit-bar">
      <view class="submit-info">
        <text class="submit-total">合计：¥{{ finalPrice }}</text>
      </view>
      <button class="submit-btn" @click="submitOrder" :disabled="!canSubmit">
        {{ submitLoading ? '提交中...' : '提交订单' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderItems: [],
      selectedAddress: null,
      selectedPayment: 'wechat_pay',
      orderRemark: '',
      submitLoading: false,
      paymentMethods: [
        { value: 'wechat_pay', name: '微信支付', icon: '💚' },
        { value: 'alipay', name: '支付宝', icon: '💙' },
        { value: 'credit_card', name: '信用卡支付', icon: '💳' }
      ],
      shippingFee: 0 // 免运费
    }
  },

  computed: {
    totalPrice() {
      return this.orderItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity)
      }, 0).toFixed(2)
    },

    finalPrice() {
      return (parseFloat(this.totalPrice) + this.shippingFee).toFixed(2)
    },

    canSubmit() {
      return this.selectedAddress && this.orderItems.length > 0 && !this.submitLoading
    }
  },

  onLoad(options) {
    // 从购物车传递过来的商品ID
    if (options.cartItemIds) {
      this.cartItemIds = JSON.parse(decodeURIComponent(options.cartItemIds))
      this.loadOrderItems()
    }
    
    this.loadDefaultAddress()
  },

  methods: {
    async loadOrderItems() {
      try {
        // 从购物车获取选中的商品
        const res = await this.$request({
          url: '/api/cart',
          method: 'GET'
        })
        
        if (res.data && res.data.items) {
          this.orderItems = res.data.items.filter(item => 
            this.cartItemIds.includes(item.id)
          )
        }
      } catch (error) {
        console.error('加载订单商品失败:', error)
        uni.showToast({
          title: '加载商品失败',
          icon: 'none'
        })
      }
    },

    async loadDefaultAddress() {
      try {
        const res = await this.$request({
          url: '/api/addresses',
          method: 'GET'
        })
        
        if (res.data && res.data.length > 0) {
          // 优先选择默认地址
          this.selectedAddress = res.data.find(addr => addr.is_default) || res.data[0]
        }
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    },

    selectAddress() {
      uni.navigateTo({
        url: '/pages/address/list?mode=select',
        events: {
          selectAddress: (address) => {
            this.selectedAddress = address
          }
        }
      })
    },

    selectPayment(method) {
      this.selectedPayment = method
    },

    async submitOrder() {
      if (!this.canSubmit) return

      if (!this.selectedAddress) {
        uni.showToast({
          title: '请选择收货地址',
          icon: 'none'
        })
        return
      }

      this.submitLoading = true

      try {
        const orderData = {
          cart_item_ids: this.cartItemIds,
          shipping_address: {
            name: this.selectedAddress.name,
            phone: this.selectedAddress.phone,
            province: this.selectedAddress.province,
            city: this.selectedAddress.city,
            district: this.selectedAddress.district,
            detail: this.selectedAddress.detail,
            postal_code: this.selectedAddress.postal_code
          },
          payment_method: this.selectedPayment,
          remark: this.orderRemark
        }

        const res = await this.$request({
          url: '/api/orders',
          method: 'POST',
          data: orderData
        })

        uni.showToast({
          title: '订单提交成功',
          icon: 'success'
        })

        // 跳转到支付页面或订单详情
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/order/detail?id=${res.data.order_id}`
          })
        }, 1500)

      } catch (error) {
        console.error('提交订单失败:', error)
        uni.showToast({
          title: error.message || '提交失败',
          icon: 'none'
        })
      } finally {
        this.submitLoading = false
      }
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-confirm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background-color: white;
  border-bottom: 1rpx solid #eee;

  .nav-left, .nav-right {
    width: 60rpx;
  }

  .nav-icon {
    font-size: 36rpx;
    color: #333;
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }
}

.address-section {
  margin: 20rpx;
  padding: 30rpx;
  background-color: white;
  border-radius: 16rpx;

  .address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .address-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }

    .address-arrow {
      font-size: 28rpx;
      color: #999;
    }
  }

  .address-content {
    .address-info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 10rpx;

      .address-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
      }

      .address-phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address-detail {
      font-size: 28rpx;
      color: #666;
      line-height: 1.4;
    }
  }

  .address-empty {
    text-align: center;
    padding: 40rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.goods-section, .payment-section, .remark-section {
  margin: 20rpx;
  background-color: white;
  border-radius: 16rpx;

  .section-title {
    padding: 30rpx 30rpx 20rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    border-bottom: 1rpx solid #f0f0f0;
  }
}

.goods-list {
  padding: 0 30rpx;

  .goods-item {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .goods-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 20rpx;
    }

    .goods-info {
      flex: 1;

      .goods-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 10rpx;
        line-height: 1.4;
      }

      .goods-specs {
        margin-bottom: 10rpx;

        .spec-item {
          display: inline-block;
          padding: 4rpx 12rpx;
          margin-right: 10rpx;
          background-color: #f5f5f5;
          border-radius: 8rpx;
          font-size: 24rpx;
          color: #666;
        }
      }

      .goods-price-qty {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .goods-price {
          font-size: 30rpx;
          font-weight: 500;
          color: #ff3b30;
        }

        .goods-qty {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
  }
}

.payment-methods {
  padding: 0 30rpx;

  .payment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.active {
      .payment-name {
        color: #007aff;
      }
    }

    .payment-info {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .payment-icon {
        font-size: 32rpx;
      }

      .payment-name {
        font-size: 30rpx;
        color: #333;
      }
    }

    .payment-radio {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      position: relative;

      .radio-checked {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20rpx;
        height: 20rpx;
        background-color: #007aff;
        border-radius: 50%;
      }
    }
  }
}

.remark-input {
  margin: 30rpx;
  padding: 20rpx;
  min-height: 120rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.price-section {
  margin: 20rpx;
  padding: 30rpx;
  background-color: white;
  border-radius: 16rpx;

  .price-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15rpx 0;

    &.total {
      border-top: 1rpx solid #f0f0f0;
      margin-top: 10rpx;
      padding-top: 25rpx;

      .price-label, .price-value {
        font-weight: 500;
        font-size: 32rpx;
      }

      .total-price {
        color: #ff3b30;
      }
    }

    .price-label {
      font-size: 28rpx;
      color: #666;
    }

    .price-value {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: white;
  border-top: 1rpx solid #eee;
  z-index: 100;

  .submit-info {
    flex: 1;

    .submit-total {
      font-size: 32rpx;
      font-weight: 500;
      color: #ff3b30;
    }
  }

  .submit-btn {
    width: 200rpx;
    height: 70rpx;
    background-color: #ff3b30;
    color: white;
    border: none;
    border-radius: 35rpx;
    font-size: 28rpx;
    font-weight: 500;

    &:disabled {
      background-color: #ccc;
    }
  }
}
</style>
