<template>
  <view class="order-list-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">我的订单</view>
      <view class="nav-right"></view>
    </view>

    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view 
        v-for="tab in statusTabs" 
        :key="tab.value"
        class="status-tab"
        :class="{ active: selectedStatus === tab.value }"
        @click="selectStatus(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="selectedStatus === tab.value" class="tab-indicator"></view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="orders.length === 0" class="empty-container">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无订单</text>
        <button class="empty-btn" @click="goShopping">去购物</button>
      </view>

      <view v-else>
        <view v-for="order in orders" :key="order.id" class="order-item" @click="goToDetail(order.id)">
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-info">
              <text class="order-no">订单号：{{ order.order_no }}</text>
              <text class="order-time">{{ formatTime(order.created_at) }}</text>
            </view>
            <view class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <!-- 订单商品 -->
          <view class="order-goods">
            <view v-for="item in order.items.slice(0, 3)" :key="item.id" class="goods-item">
              <image class="goods-image" :src="getProductImage(item)" mode="aspectFill"></image>
              <view class="goods-info">
                <text class="goods-name">{{ item.product_name }}</text>
                <view class="goods-specs" v-if="item.selected_specs">
                  <text v-for="(value, key) in item.selected_specs" :key="key" class="spec-item">
                    {{ value }}
                  </text>
                </view>
                <view class="goods-price-qty">
                  <text class="goods-price">¥{{ item.product_price }}</text>
                  <text class="goods-qty">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
            
            <!-- 更多商品提示 -->
            <view v-if="order.items.length > 3" class="more-goods">
              <text class="more-text">等{{ order.items.length }}件商品</text>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="order-footer">
            <view class="order-total">
              <text class="total-label">实付：</text>
              <text class="total-amount">¥{{ order.total_amount }}</text>
            </view>
            
            <view class="order-actions">
              <button 
                v-if="order.status === 'pending'" 
                class="action-btn secondary"
                @click.stop="cancelOrder(order)"
              >
                取消订单
              </button>
              <button 
                v-if="order.status === 'pending'" 
                class="action-btn primary"
                @click.stop="payOrder(order)"
              >
                立即支付
              </button>
              <button 
                v-if="order.status === 'shipped'" 
                class="action-btn primary"
                @click.stop="confirmReceive(order)"
              >
                确认收货
              </button>
              <button 
                v-if="order.status === 'delivered'" 
                class="action-btn secondary"
                @click.stop="rateOrder(order)"
              >
                评价
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orders: [],
      loading: false,
      selectedStatus: '',
      page: 1,
      hasMore: true,
      statusTabs: [
        { value: '', label: '全部' },
        { value: 'pending', label: '待付款' },
        { value: 'paid', label: '待发货' },
        { value: 'shipped', label: '待收货' },
        { value: 'delivered', label: '已完成' }
      ]
    }
  },

  onLoad(options) {
    if (options.status) {
      this.selectedStatus = options.status
    }
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.refreshOrders()
  },

  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },

  methods: {
    async loadOrders(isRefresh = false) {
      if (this.loading) return

      this.loading = true

      try {
        const params = {
          page: isRefresh ? 1 : this.page,
          limit: 10
        }

        if (this.selectedStatus) {
          params.status = this.selectedStatus
        }

        const res = await this.$request({
          url: '/api/orders',
          method: 'GET',
          data: params
        })

        if (isRefresh) {
          this.orders = res.data || []
          this.page = 1
        } else {
          this.orders = [...this.orders, ...(res.data || [])]
        }

        this.hasMore = res.pagination && res.pagination.has_next
        this.page = (res.pagination && res.pagination.current_page) + 1

      } catch (error) {
        console.error('加载订单失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        if (isRefresh) {
          uni.stopPullDownRefresh()
        }
      }
    },

    refreshOrders() {
      this.loadOrders(true)
    },

    loadMore() {
      this.loadOrders()
    },

    selectStatus(status) {
      this.selectedStatus = status
      this.page = 1
      this.hasMore = true
      this.orders = []
      this.loadOrders()
    },

    getStatusText(status) {
      const statusMap = {
        pending: '待付款',
        paid: '待发货',
        shipped: '待收货',
        delivered: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || '未知状态'
    },

    getStatusClass(status) {
      return `status-${status}`
    },

    getProductImage(item) {
      // 从商品数据中获取图片，如果没有则使用占位图
      const product = this.getProductById(item.product_id)
      return product && product.images && product.images[0] 
        ? product.images[0] 
        : 'https://via.placeholder.com/120x120?text=商品'
    },

    getProductById(productId) {
      // 这里可以从全局状态或缓存中获取商品信息
      // 暂时返回null，实际项目中需要实现
      return null
    },

    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },

    goToDetail(orderId) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${orderId}`
      })
    },

    async cancelOrder(order) {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 这里需要实现取消订单的API
              uni.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              this.refreshOrders()
            } catch (error) {
              uni.showToast({
                title: '取消失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    payOrder(order) {
      // 跳转到支付页面
      uni.navigateTo({
        url: `/pages/payment/pay?orderId=${order.id}`
      })
    },

    async confirmReceive(order) {
      uni.showModal({
        title: '确认收货',
        content: '确认已收到商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 这里需要实现确认收货的API
              uni.showToast({
                title: '确认收货成功',
                icon: 'success'
              })
              this.refreshOrders()
            } catch (error) {
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    rateOrder(order) {
      // 跳转到评价页面
      uni.navigateTo({
        url: `/pages/order/rate?orderId=${order.id}`
      })
    },

    goShopping() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
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

.status-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1rpx solid #eee;

  .status-tab {
    flex: 1;
    position: relative;
    text-align: center;
    padding: 30rpx 0;

    &.active {
      .tab-text {
        color: #007aff;
        font-weight: 500;
      }
    }

    .tab-text {
      font-size: 28rpx;
      color: #666;
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: #007aff;
      border-radius: 2rpx;
    }
  }
}

.order-list {
  padding: 20rpx;
}

.loading-container, .empty-container {
  text-align: center;
  padding: 100rpx 0;

  .loading-text, .empty-text {
    font-size: 28rpx;
    color: #999;
  }

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-btn {
    margin-top: 40rpx;
    width: 200rpx;
    height: 60rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 30rpx;
    font-size: 26rpx;
  }
}

.order-item {
  background-color: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;

  .order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .order-info {
      .order-no {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .order-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .order-status {
      font-size: 26rpx;
      font-weight: 500;

      &.status-pending {
        color: #ff9500;
      }

      &.status-paid {
        color: #007aff;
      }

      &.status-shipped {
        color: #34c759;
      }

      &.status-delivered {
        color: #666;
      }

      &.status-cancelled {
        color: #ff3b30;
      }
    }
  }

  .order-goods {
    padding: 0 30rpx;

    .goods-item {
      display: flex;
      padding: 20rpx 0;

      .goods-image {
        width: 100rpx;
        height: 100rpx;
        border-radius: 8rpx;
        margin-right: 20rpx;
      }

      .goods-info {
        flex: 1;

        .goods-name {
          font-size: 26rpx;
          color: #333;
          margin-bottom: 8rpx;
          line-height: 1.4;
        }

        .goods-specs {
          margin-bottom: 8rpx;

          .spec-item {
            display: inline-block;
            padding: 2rpx 8rpx;
            margin-right: 8rpx;
            background-color: #f5f5f5;
            border-radius: 4rpx;
            font-size: 22rpx;
            color: #666;
          }
        }

        .goods-price-qty {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .goods-price {
            font-size: 26rpx;
            color: #ff3b30;
          }

          .goods-qty {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
    }

    .more-goods {
      text-align: center;
      padding: 20rpx 0;

      .more-text {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .order-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-top: 1rpx solid #f0f0f0;

    .order-total {
      .total-label {
        font-size: 26rpx;
        color: #666;
      }

      .total-amount {
        font-size: 30rpx;
        font-weight: 500;
        color: #ff3b30;
      }
    }

    .order-actions {
      display: flex;
      gap: 20rpx;

      .action-btn {
        padding: 12rpx 24rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        border: 1rpx solid #ddd;

        &.primary {
          background-color: #007aff;
          color: white;
          border-color: #007aff;
        }

        &.secondary {
          background-color: white;
          color: #666;
        }
      }
    }
  }
}

.load-more {
  text-align: center;
  padding: 40rpx 0;

  .load-more-text {
    font-size: 26rpx;
    color: #666;
  }
}
</style>
