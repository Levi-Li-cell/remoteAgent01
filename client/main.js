import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  
  // 全局配置
  app.config.globalProperties.$baseUrl = 'http://localhost:3000'
  
  // 全局请求方法
  app.config.globalProperties.$request = (options) => {
    return new Promise((resolve, reject) => {
      uni.request({
        url: app.config.globalProperties.$baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.data.code === 200) {
            resolve(res.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }
  
  return {
    app
  }
}
