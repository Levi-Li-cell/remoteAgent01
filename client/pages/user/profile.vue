<template>
  <view class="container">
    <!-- 用户信息头部 -->
    <view class="user-header card">
      <view v-if="isLogin" class="user-info">
        <image 
          class="user-avatar" 
          :src="userInfo.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        ></image>
        <view class="user-details">
          <text class="user-name">{{ userInfo.username }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
        </view>
        <view class="user-actions">
          <button class="edit-btn" @click="editProfile">编辑</button>
        </view>
      </view>
      
      <view v-else class="login-prompt">
        <image class="guest-avatar" src="/static/guest-avatar.png" mode="aspectFill"></image>
        <view class="login-info">
          <text class="login-text">您还未登录</text>
          <button class="login-btn btn-primary" @click="goLogin">立即登录</button>
        </view>
      </view>
    </view>
    
    <!-- 订单管理 -->
    <view class="order-section card">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <text class="more-link" @click="goOrderList">查看全部 ></text>
      </view>
      
      <view class="order-types">
        <view class="order-type" @click="goOrderList('pending')">
          <text class="order-icon">⏰</text>
          <text class="order-name">待付款</text>
        </view>
        <view class="order-type" @click="goOrderList('paid')">
          <text class="order-icon">📦</text>
          <text class="order-name">待发货</text>
        </view>
        <view class="order-type" @click="goOrderList('shipped')">
          <text class="order-icon">🚚</text>
          <text class="order-name">待收货</text>
        </view>
        <view class="order-type" @click="goOrderList('completed')">
          <text class="order-icon">✅</text>
          <text class="order-name">已完成</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @click="goAddressList">
        <text class="menu-icon">📍</text>
        <text class="menu-name">收货地址</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goFavorites">
        <text class="menu-icon">❤️</text>
        <text class="menu-name">我的收藏</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="goCoupons">
        <text class="menu-icon">🎫</text>
        <text class="menu-name">优惠券</text>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="goNotifications">
        <text class="menu-icon">🔔</text>
        <text class="menu-name">消息通知</text>
        <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
        <text class="menu-arrow">></text>
      </view>

      <view class="menu-item" @click="goCustomerService">
        <text class="menu-icon">💬</text>
        <text class="menu-name">客服中心</text>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-name">设置</text>
        <text class="menu-arrow">></text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view v-if="isLogin" class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      userInfo: {},
      unreadCount: 0
    }
  },
  
  onShow() {
    this.checkLoginStatus()
    if (this.isLogin) {
      this.loadUnreadCount()
    }
  },

  methods: {
    async checkLoginStatus() {
      const isLogin = uni.getStorageSync('isLogin') || false
      const token = uni.getStorageSync('token')

      this.isLogin = isLogin && token

      if (this.isLogin) {
        // 尝试从本地获取用户信息
        const localUserInfo = uni.getStorageSync('userInfo')
        if (localUserInfo) {
          this.userInfo = localUserInfo
        }

        // 从服务器获取最新用户信息
        await this.loadUserProfile()
      } else {
        this.userInfo = {}
      }
    },

    async loadUserProfile() {
      const token = uni.getStorageSync('token')
      if (!token) return

      try {
        const res = await this.$request({
          url: '/api/user/profile',
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (res.data) {
          this.userInfo = res.data
          // 更新本地存储
          uni.setStorageSync('userInfo', res.data)
        }

      } catch (error) {
        console.error('获取用户信息失败:', error)

        // 如果token无效，清除登录状态
        if (error.code === 401 || error.code === 403) {
          this.clearLoginStatus()
        }
      }
    },

    clearLoginStatus() {
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('isLogin')
      this.isLogin = false
      this.userInfo = {}
    },
    
    goLogin() {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    },
    
    editProfile() {
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      })
    },
    
    goOrderList(status = '') {
      if (!this.isLogin) {
        this.goLogin()
        return
      }

      // 跳转到订单列表页面
      let url = '/pages/order/list'
      if (status) {
        url += `?status=${status}`
      }

      uni.navigateTo({
        url: url
      })
    },

    goAddressList() {
      if (!this.isLogin) {
        this.goLogin()
        return
      }

      // 跳转到地址管理页面
      uni.navigateTo({
        url: '/pages/address/list'
      })
    },
    
    goFavorites() {
      if (!this.isLogin) {
        this.goLogin()
        return
      }

      uni.navigateTo({
        url: '/pages/user/favorites'
      })
    },

    goCoupons() {
      if (!this.isLogin) {
        this.goLogin()
        return
      }

      uni.navigateTo({
        url: '/pages/user/coupons'
      })
    },

    goNotifications() {
      if (!this.isLogin) {
        this.goLogin()
        return
      }

      uni.navigateTo({
        url: '/pages/user/notifications'
      })
    },

    async loadUnreadCount() {
      try {
        const res = await this.$request({
          url: '/api/notifications',
          method: 'GET',
          data: { page: 1, limit: 1, read: false }
        })

        this.unreadCount = res.extra_data?.unread_count || 0
      } catch (error) {
        console.error('加载未读消息数量失败:', error)
      }
    },
    
    goCustomerService() {
      uni.showToast({
        title: '客服功能开发中',
        icon: 'none'
      })
    },
    
    goSettings() {
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
    },
    
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.clearLoginStatus()

            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })

            // 可选：跳转到首页
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/index/index'
              })
            }, 1500)
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.user-header {
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar,
.guest-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: #666;
}

.edit-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 15rpx 30rpx;
  font-size: 24rpx;
}

.login-prompt {
  display: flex;
  align-items: center;
}

.login-info {
  flex: 1;
}

.login-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.login-btn {
  width: 200rpx;
  height: 60rpx;
  font-size: 28rpx;
}

.order-section {
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
}

.more-link {
  font-size: 24rpx;
  color: #007AFF;
}

.order-types {
  display: flex;
  justify-content: space-around;
}

.order-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.order-icon {
  font-size: 48rpx;
  margin-bottom: 15rpx;
}

.order-name {
  font-size: 24rpx;
  color: #666;
}

.menu-section {
  margin-bottom: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 30rpx;
  width: 60rpx;
  text-align: center;
}

.menu-name {
  flex: 1;
  font-size: 32rpx;
}

.badge {
  background-color: #ff3b30;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  min-width: 20rpx;
  text-align: center;
  margin-right: 10rpx;
}

.menu-arrow {
  font-size: 24rpx;
  color: #ccc;
}

.logout-section {
  margin-top: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>
