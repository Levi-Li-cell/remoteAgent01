<template>
  <view class="coupons-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">我的优惠券</view>
      <view class="nav-right">
        <text class="nav-get" @click="goToCouponCenter">领券中心</text>
      </view>
    </view>

    <!-- 状态筛选 -->
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

    <!-- 优惠券列表 -->
    <view class="coupons-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="coupons.length === 0" class="empty-container">
        <text class="empty-icon">🎫</text>
        <text class="empty-text">暂无优惠券</text>
        <button class="empty-btn" @click="goToCouponCenter">去领券</button>
      </view>

      <view v-else>
        <view v-for="coupon in coupons" :key="coupon.id" class="coupon-item" :class="getCouponClass(coupon)">
          <!-- 优惠券左侧 -->
          <view class="coupon-left">
            <view class="coupon-value">
              <text v-if="coupon.coupon.type === 'discount'" class="discount-value">
                {{ (coupon.coupon.value * 10).toFixed(0) }}折
              </text>
              <text v-else class="amount-value">
                ¥{{ coupon.coupon.value }}
              </text>
            </view>
            <text class="coupon-condition">
              满{{ coupon.coupon.min_amount }}元可用
            </text>
          </view>

          <!-- 优惠券右侧 -->
          <view class="coupon-right">
            <view class="coupon-info">
              <text class="coupon-name">{{ coupon.coupon.name }}</text>
              <text class="coupon-desc">{{ coupon.coupon.description }}</text>
              <text class="coupon-time">
                有效期至 {{ formatDate(coupon.coupon.end_time) }}
              </text>
            </view>

            <!-- 优惠券状态 -->
            <view class="coupon-status">
              <text v-if="coupon.status === 'unused'" class="status-unused">未使用</text>
              <text v-else-if="coupon.status === 'used'" class="status-used">已使用</text>
              <text v-else class="status-expired">已过期</text>
            </view>
          </view>

          <!-- 使用按钮 -->
          <button 
            v-if="coupon.status === 'unused' && !isExpired(coupon.coupon.end_time)"
            class="use-btn"
            @click="useCoupon(coupon)"
          >
            立即使用
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      coupons: [],
      loading: false,
      selectedStatus: 'unused',
      statusTabs: [
        { value: 'unused', label: '未使用' },
        { value: 'used', label: '已使用' },
        { value: 'expired', label: '已过期' }
      ]
    }
  },

  onLoad() {
    this.loadCoupons()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadCoupons()
  },

  methods: {
    async loadCoupons() {
      this.loading = true

      try {
        const params = {}
        if (this.selectedStatus) {
          params.status = this.selectedStatus
        }

        const res = await this.$request({
          url: '/api/user/coupons',
          method: 'GET',
          data: params
        })

        this.coupons = res.data || []

      } catch (error) {
        console.error('加载优惠券失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    selectStatus(status) {
      this.selectedStatus = status
      this.loadCoupons()
    },

    getCouponClass(coupon) {
      if (coupon.status === 'used') {
        return 'used'
      } else if (coupon.status === 'expired' || this.isExpired(coupon.coupon.end_time)) {
        return 'expired'
      }
      return 'available'
    },

    isExpired(endTime) {
      return new Date() > new Date(endTime)
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    },

    useCoupon(coupon) {
      // 跳转到商品页面使用优惠券
      uni.switchTab({
        url: '/pages/index/index'
      })
    },

    goToCouponCenter() {
      uni.navigateTo({
        url: '/pages/coupon/center'
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.coupons-page {
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
    width: 100rpx;
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

  .nav-get {
    font-size: 26rpx;
    color: #007aff;
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

.coupons-list {
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

.coupon-item {
  display: flex;
  background-color: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  position: relative;

  &.available {
    .coupon-left {
      background: linear-gradient(135deg, #ff6b35, #ff8c42);
    }
  }

  &.used {
    opacity: 0.6;
    
    .coupon-left {
      background: #999;
    }
  }

  &.expired {
    opacity: 0.6;
    
    .coupon-left {
      background: #ccc;
    }
  }

  .coupon-left {
    width: 200rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: -10rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 20rpx;
      height: 20rpx;
      background-color: #f5f5f5;
      border-radius: 50%;
    }

    .coupon-value {
      .discount-value, .amount-value {
        font-size: 48rpx;
        font-weight: bold;
        line-height: 1;
      }
    }

    .coupon-condition {
      font-size: 22rpx;
      margin-top: 8rpx;
      opacity: 0.9;
    }
  }

  .coupon-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;

    .coupon-info {
      flex: 1;

      .coupon-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
        display: block;
      }

      .coupon-desc {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
        display: block;
      }

      .coupon-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .coupon-status {
      .status-unused {
        color: #007aff;
        font-size: 24rpx;
      }

      .status-used {
        color: #999;
        font-size: 24rpx;
      }

      .status-expired {
        color: #ff3b30;
        font-size: 24rpx;
      }
    }
  }

  .use-btn {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    padding: 8rpx 20rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 20rpx;
    font-size: 22rpx;
  }
}
</style>
