<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索商品..." 
        v-model="searchKeyword"
        @confirm="searchProducts"
      />
      <button class="search-btn" @click="searchProducts">搜索</button>
    </view>
    
    <!-- 分类导航 -->
    <view class="category-nav">
      <scroll-view scroll-x="true" class="category-scroll">
        <view class="category-list">
          <view 
            class="category-item"
            :class="{ active: selectedCategory === item.id }"
            v-for="item in categories" 
            :key="item.id"
            @click="selectCategory(item.id)"
          >
            <text class="category-icon">{{ item.icon }}</text>
            <text class="category-name">{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 商品列表 -->
    <view class="product-list">
      <view 
        class="product-item card"
        v-for="product in products" 
        :key="product.id"
        @click="goToDetail(product.id)"
      >
        <image class="product-image" :src="product.image" mode="aspectFill"></image>
        <view class="product-info">
          <text class="product-name">{{ product.name }}</text>
          <text class="product-desc">{{ product.description }}</text>
          <view class="product-footer flex justify-between align-center">
            <text class="price">¥{{ product.price }}</text>
            <button 
              class="add-cart-btn" 
              @click.stop="addToCart(product)"
              size="mini"
            >
              加入购物车
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading text-center">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKeyword: '',
      selectedCategory: 'all',
      categories: [],
      products: [],
      loading: false
    }
  },
  
  onLoad() {
    this.loadCategories()
    this.loadProducts()
  },
  
  onPullDownRefresh() {
    this.loadProducts().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    async loadCategories() {
      try {
        const res = await this.$request({
          url: '/api/categories'
        })
        this.categories = res.data
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    async loadProducts() {
      this.loading = true
      try {
        const res = await this.$request({
          url: '/api/products',
          data: {
            category: this.selectedCategory,
            keyword: this.searchKeyword
          }
        })
        this.products = res.data
      } catch (error) {
        console.error('加载商品失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.loadProducts()
    },
    
    searchProducts() {
      this.loadProducts()
    },
    
    goToDetail(productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${productId}`
      })
    },
    
    async addToCart(product) {
      const isLogin = uni.getStorageSync('isLogin')
      if (!isLogin) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/user/login'
              })
            }
          }
        })
        return
      }
      
      try {
        await this.$request({
          url: '/api/cart',
          method: 'POST',
          data: {
            userId: 999, // Demo用户ID
            productId: product.id,
            quantity: 1
          }
        })
        
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('添加购物车失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 16rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.search-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
}

.category-nav {
  margin-bottom: 20rpx;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: flex;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  min-width: 120rpx;
}

.category-item.active {
  background: #007AFF;
  color: white;
}

.category-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.category-name {
  font-size: 24rpx;
}

.product-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.product-item {
  padding: 0;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 300rpx;
}

.product-info {
  padding: 20rpx;
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.product-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.product-footer {
  margin-top: 20rpx;
}

.add-cart-btn {
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
}

.loading {
  padding: 40rpx;
  color: #666;
}
</style>
