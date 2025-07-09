/**
 * 统一的API请求工具
 * 基于uni.request封装，提供统一的错误处理和响应格式
 */

// API基础配置
const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
}

/**
 * 请求拦截器
 * @param {Object} options 请求配置
 */
const requestInterceptor = (options) => {
  // 添加基础URL
  if (!options.url.startsWith('http')) {
    options.url = API_CONFIG.baseURL + options.url
  }
  
  // 添加默认header
  options.header = {
    ...API_CONFIG.header,
    ...options.header
  }
  
  // 添加token (如果存在)
  const token = uni.getStorageSync('token')
  if (token && !options.header.Authorization) {
    options.header.Authorization = `Bearer ${token}`
  }
  
  // 设置超时时间
  options.timeout = options.timeout || API_CONFIG.timeout
  
  // 处理GET请求的参数
  if (options.method === 'GET' && options.data) {
    const params = new URLSearchParams(options.data).toString()
    options.url += (options.url.includes('?') ? '&' : '?') + params
    delete options.data
  }
  
  console.log('🚀 API请求:', {
    url: options.url,
    method: options.method || 'GET',
    data: options.data,
    header: options.header
  })
  
  return options
}

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 */
const responseInterceptor = (response) => {
  console.log('📥 API响应:', {
    url: response.config?.url,
    status: response.statusCode,
    data: response.data
  })
  
  // HTTP状态码检查
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || '请求失败'}`)
  }
  
  // 业务状态码检查
  const { code, message, data } = response.data
  
  if (code !== 200) {
    // 特殊错误处理
    switch (code) {
      case 401:
        // Token过期或无效，清除登录状态
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('isLogin')
        
        uni.showModal({
          title: '登录过期',
          content: '请重新登录',
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: '/pages/user/login'
            })
          }
        })
        break
        
      case 403:
        uni.showToast({
          title: '权限不足',
          icon: 'none'
        })
        break
        
      case 404:
        uni.showToast({
          title: '资源不存在',
          icon: 'none'
        })
        break
        
      case 429:
        uni.showToast({
          title: '请求过于频繁，请稍后再试',
          icon: 'none'
        })
        break
        
      case 500:
        uni.showToast({
          title: '服务器错误，请稍后再试',
          icon: 'none'
        })
        break
        
      default:
        uni.showToast({
          title: message || '请求失败',
          icon: 'none'
        })
    }
    
    const error = new Error(message || '请求失败')
    error.code = code
    error.data = data
    throw error
  }
  
  return response.data
}

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 请求Promise
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 请求拦截
    const config = requestInterceptor(options)
    
    // 发起请求
    uni.request({
      ...config,
      success: (response) => {
        try {
          // 响应拦截
          const result = responseInterceptor({
            ...response,
            config
          })
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        console.error('❌ 网络请求失败:', error)
        
        // 网络错误处理
        let errorMessage = '网络连接失败'
        
        if (error.errMsg) {
          if (error.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接'
          } else if (error.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请检查网络设置'
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none'
        })
        
        const networkError = new Error(errorMessage)
        networkError.type = 'network'
        networkError.original = error
        reject(networkError)
      }
    })
  })
}

/**
 * GET请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 其他配置
 */
const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  })
}

/**
 * POST请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 * @param {String} url 请求地址
 * @param {Object} options 其他配置
 */
const del = (url, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    ...options
  })
}

/**
 * 文件上传
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {Object} formData 表单数据
 * @param {Object} options 其他配置
 */
const upload = (url, filePath, formData = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    // 添加token
    const token = uni.getStorageSync('token')
    const header = {
      ...options.header
    }
    
    if (token) {
      header.Authorization = `Bearer ${token}`
    }
    
    uni.uploadFile({
      url: API_CONFIG.baseURL + url,
      filePath,
      name: options.name || 'file',
      formData,
      header,
      success: (response) => {
        try {
          const data = JSON.parse(response.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(new Error('响应数据格式错误'))
        }
      },
      fail: (error) => {
        console.error('文件上传失败:', error)
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}

// 导出方法
export default {
  request,
  get,
  post,
  put,
  delete: del,
  upload
}

// 也可以单独导出
export {
  request,
  get,
  post,
  put,
  del as delete,
  upload
}
