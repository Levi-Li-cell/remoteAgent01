<template>
  <view id="app">
    <!-- 这里是应用的根组件 -->
  </view>
</template>

<script>
export default {
  name: 'App',
  onLaunch: function() {
    console.log('App Launch')
    
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (token) {
      uni.setStorageSync('isLogin', true)
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  padding: 20rpx;
}

.card {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.btn-primary {
  background: linear-gradient(45deg, #007AFF, #5AC8FA);
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 32rpx;
}

.btn-primary:active {
  opacity: 0.8;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.mt-20 {
  margin-top: 20rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.price {
  color: #ff4757;
  font-weight: bold;
}
</style>
