<template>
  <view class="container">
    <view class="login-header text-center">
      <text class="app-logo">🛒</text>
      <text class="app-name">数码商城</text>
      <text class="welcome-text">欢迎登录</text>
    </view>
    
    <view class="login-form card">
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input 
          class="form-input" 
          placeholder="请输入用户名"
          v-model="loginForm.username"
          maxlength="20"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">密码</text>
        <input 
          class="form-input" 
          placeholder="请输入密码"
          password
          v-model="loginForm.password"
          maxlength="20"
        />
      </view>
      
      <button 
        class="login-btn btn-primary"
        :loading="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <view class="login-tips">
        <text class="tip-text">Demo账号: demo / 123456</text>
      </view>
    </view>
    
    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>
      
      <!-- 微信登录 -->
      <button 
        class="wechat-login-btn"
        open-type="getUserInfo"
        @getuserinfo="wechatLogin"
        v-if="isWeChat"
      >
        <text class="wechat-icon">💬</text>
        <text>微信快速登录</text>
      </button>
      
      <!-- 游客模式 -->
      <button class="guest-btn" @click="guestLogin">
        <text class="guest-icon">👤</text>
        <text>游客模式</text>
      </button>
    </view>
    
    <!-- 注册提示 -->
    <view class="register-tip text-center">
      <text class="tip-text">还没有账号？</text>
      <text class="register-link" @click="goRegister">立即注册</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loading: false,
      isWeChat: false
    }
  },
  
  onLoad() {
    // 检测是否在微信环境
    // #ifdef MP-WEIXIN
    this.isWeChat = true
    // #endif
  },
  
  methods: {
    async handleLogin() {
      if (!this.loginForm.username.trim()) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        })
        return
      }
      
      if (!this.loginForm.password.trim()) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const res = await this.$request({
          url: '/api/login',
          method: 'POST',
          data: this.loginForm
        })
        
        // 保存登录状态
        uni.setStorageSync('token', res.data.token)
        uni.setStorageSync('userInfo', res.data)
        uni.setStorageSync('isLogin', true)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.navigateBack()
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    wechatLogin(e) {
      console.log('微信登录:', e)
      if (e.detail.userInfo) {
        // 模拟微信登录成功
        const userInfo = {
          id: 999,
          username: e.detail.userInfo.nickName,
          avatar: e.detail.userInfo.avatarUrl,
          token: 'wechat-token-' + Date.now()
        }
        
        uni.setStorageSync('token', userInfo.token)
        uni.setStorageSync('userInfo', userInfo)
        uni.setStorageSync('isLogin', true)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          this.navigateBack()
        }, 1500)
      } else {
        uni.showToast({
          title: '登录取消',
          icon: 'none'
        })
      }
    },
    
    guestLogin() {
      // 游客模式登录
      const guestInfo = {
        id: 888,
        username: '游客用户',
        avatar: '',
        token: 'guest-token-' + Date.now()
      }
      
      uni.setStorageSync('token', guestInfo.token)
      uni.setStorageSync('userInfo', guestInfo)
      uni.setStorageSync('isLogin', true)
      
      uni.showToast({
        title: '游客登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        this.navigateBack()
      }, 1500)
    },
    
    goRegister() {
      uni.showToast({
        title: '注册功能开发中',
        icon: 'none'
      })
    },
    
    navigateBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    }
  }
}
</script>

<style scoped>
.login-header {
  padding: 100rpx 40rpx 60rpx;
}

.app-logo {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  display: block;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.welcome-text {
  font-size: 32rpx;
  color: #666;
}

.login-form {
  margin-bottom: 60rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 32rpx;
  background: #f9f9f9;
}

.form-input:focus {
  border-color: #007AFF;
  background: white;
}

.login-btn {
  width: 100%;
  height: 80rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
}

.login-tips {
  margin-top: 30rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
}

.other-login {
  margin-bottom: 60rpx;
}

.divider {
  position: relative;
  text-align: center;
  margin: 40rpx 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1rpx;
  background: #eee;
}

.divider-text {
  background: #f5f5f5;
  padding: 0 30rpx;
  font-size: 24rpx;
  color: #999;
  position: relative;
  z-index: 1;
}

.wechat-login-btn,
.guest-btn {
  width: 100%;
  height: 80rpx;
  background: white;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.wechat-login-btn {
  background: #1aad19;
  color: white;
  border-color: #1aad19;
}

.wechat-icon,
.guest-icon {
  margin-right: 15rpx;
  font-size: 36rpx;
}

.register-tip {
  padding: 40rpx;
}

.register-link {
  color: #007AFF;
  margin-left: 10rpx;
}
</style>
