import { createSSRApp } from 'vue'
import App from './App.vue'
import request from './utils/request.js'

export function createApp() {
  const app = createSSRApp(App)

  // 全局配置
  app.config.globalProperties.$baseUrl = 'http://localhost:3000'

  // 全局请求方法 (使用新的request工具)
  app.config.globalProperties.$request = request.request
  app.config.globalProperties.$get = request.get
  app.config.globalProperties.$post = request.post
  app.config.globalProperties.$put = request.put
  app.config.globalProperties.$delete = request.delete
  app.config.globalProperties.$upload = request.upload

  // 全局工具方法
  app.config.globalProperties.$utils = {
    // 格式化价格
    formatPrice: (price) => {
      return parseFloat(price).toFixed(2)
    },

    // 格式化时间
    formatTime: (time) => {
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    },

    // 检查登录状态
    checkLogin: () => {
      const isLogin = uni.getStorageSync('isLogin')
      const token = uni.getStorageSync('token')
      return isLogin && token
    },

    // 跳转到登录页
    goLogin: () => {
      uni.navigateTo({
        url: '/pages/user/login'
      })
    }
  }

  return {
    app
  }
}
