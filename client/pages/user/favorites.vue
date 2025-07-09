<template>
  <view class="favorites-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">我的收藏</view>
      <view class="nav-right">
        <text v-if="favorites.length > 0" class="nav-edit" @click="toggleEditMode">
          {{ editMode ? '完成' : '编辑' }}
        </text>
      </view>
    </view>

    <!-- 收藏列表 -->
    <view class="favorites-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="favorites.length === 0" class="empty-container">
        <text class="empty-icon">❤️</text>
        <text class="empty-text">暂无收藏商品</text>
        <button class="empty-btn" @click="goShopping">去逛逛</button>
      </view>

      <view v-else class="favorites-grid">
        <view 
          v-for="favorite in favorites" 
          :key="favorite.id" 
          class="favorite-item"
          @click="goToProduct(favorite.product)"
        >
          <!-- 编辑模式选择框 -->
          <view v-if="editMode" class="select-checkbox" @click.stop="toggleSelect(favorite)">
            <view class="checkbox" :class="{ checked: selectedItems.includes(favorite.id) }">
              <text v-if="selectedItems.includes(favorite.id)" class="check-icon">✓</text>
            </view>
          </view>

          <!-- 商品图片 -->
          <view class="product-image-container">
            <image class="product-image" :src="favorite.product.images[0]" mode="aspectFill"></image>
            
            <!-- 非编辑模式的收藏按钮 -->
            <view v-if="!editMode" class="favorite-btn" @click.stop="removeFavorite(favorite)">
              <text class="favorite-icon">❤️</text>
            </view>
          </view>

          <!-- 商品信息 -->
          <view class="product-info">
            <text class="product-name">{{ favorite.product.name }}</text>
            <view class="product-price-container">
              <text class="product-price">¥{{ favorite.product.price }}</text>
              <text v-if="favorite.product.original_price > favorite.product.price" class="original-price">
                ¥{{ favorite.product.original_price }}
              </text>
            </view>
            <text class="favorite-time">{{ formatTime(favorite.created_at) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑模式底部操作栏 -->
    <view v-if="editMode && favorites.length > 0" class="edit-actions">
      <view class="select-all" @click="toggleSelectAll">
        <view class="checkbox" :class="{ checked: isAllSelected }">
          <text v-if="isAllSelected" class="check-icon">✓</text>
        </view>
        <text class="select-text">全选</text>
      </view>
      
      <button 
        class="batch-delete-btn" 
        :disabled="selectedItems.length === 0"
        @click="batchDelete"
      >
        删除选中 ({{ selectedItems.length }})
      </button>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading && !editMode" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      favorites: [],
      loading: false,
      editMode: false,
      selectedItems: [],
      page: 1,
      hasMore: true
    }
  },

  computed: {
    isAllSelected() {
      return this.favorites.length > 0 && this.selectedItems.length === this.favorites.length
    }
  },

  onLoad() {
    this.loadFavorites()
  },

  onPullDownRefresh() {
    this.refreshFavorites()
  },

  onReachBottom() {
    if (this.hasMore && !this.loading && !this.editMode) {
      this.loadMore()
    }
  },

  methods: {
    async loadFavorites(isRefresh = false) {
      if (this.loading) return

      this.loading = true

      try {
        const params = {
          page: isRefresh ? 1 : this.page,
          limit: 20
        }

        const res = await this.$request({
          url: '/api/favorites',
          method: 'GET',
          data: params
        })

        if (isRefresh) {
          this.favorites = res.data || []
          this.page = 1
        } else {
          this.favorites = [...this.favorites, ...(res.data || [])]
        }

        this.hasMore = res.pagination && res.pagination.has_next
        this.page = (res.pagination && res.pagination.current_page) + 1

      } catch (error) {
        console.error('加载收藏失败:', error)
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

    refreshFavorites() {
      this.editMode = false
      this.selectedItems = []
      this.loadFavorites(true)
    },

    loadMore() {
      this.loadFavorites()
    },

    toggleEditMode() {
      this.editMode = !this.editMode
      this.selectedItems = []
    },

    toggleSelect(favorite) {
      const index = this.selectedItems.indexOf(favorite.id)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(favorite.id)
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.favorites.map(f => f.id)
      }
    },

    async removeFavorite(favorite) {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消收藏这个商品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$request({
                url: `/api/favorites/${favorite.id}`,
                method: 'DELETE'
              })

              // 从列表中移除
              const index = this.favorites.findIndex(f => f.id === favorite.id)
              if (index > -1) {
                this.favorites.splice(index, 1)
              }

              uni.showToast({
                title: '取消收藏成功',
                icon: 'success'
              })

            } catch (error) {
              console.error('取消收藏失败:', error)
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    async batchDelete() {
      if (this.selectedItems.length === 0) return

      uni.showModal({
        title: '批量删除',
        content: `确定要删除选中的${this.selectedItems.length}个商品吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 批量删除请求
              const deletePromises = this.selectedItems.map(id => 
                this.$request({
                  url: `/api/favorites/${id}`,
                  method: 'DELETE'
                })
              )

              await Promise.all(deletePromises)

              // 从列表中移除
              this.favorites = this.favorites.filter(f => !this.selectedItems.includes(f.id))
              this.selectedItems = []
              this.editMode = false

              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })

            } catch (error) {
              console.error('批量删除失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    goToProduct(product) {
      if (this.editMode) return

      uni.navigateTo({
        url: `/pages/product/detail?id=${product.id}`
      })
    },

    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 86400000) { // 1天内
        return '今天'
      } else if (diff < 172800000) { // 2天内
        return '昨天'
      } else {
        return date.toLocaleDateString('zh-CN')
      }
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
.favorites-page {
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
    width: 80rpx;
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

  .nav-edit {
    font-size: 28rpx;
    color: #007aff;
  }
}

.favorites-list {
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

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.favorite-item {
  background-color: white;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;

  .select-checkbox {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    z-index: 10;

    .checkbox {
      width: 40rpx;
      height: 40rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background-color: #007aff;
        border-color: #007aff;
      }

      .check-icon {
        font-size: 24rpx;
        color: white;
      }
    }
  }

  .product-image-container {
    position: relative;
    height: 300rpx;

    .product-image {
      width: 100%;
      height: 100%;
    }

    .favorite-btn {
      position: absolute;
      top: 20rpx;
      right: 20rpx;
      width: 60rpx;
      height: 60rpx;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .favorite-icon {
        font-size: 28rpx;
      }
    }
  }

  .product-info {
    padding: 20rpx;

    .product-name {
      font-size: 26rpx;
      color: #333;
      margin-bottom: 10rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      line-height: 1.4;
    }

    .product-price-container {
      display: flex;
      align-items: center;
      gap: 10rpx;
      margin-bottom: 8rpx;

      .product-price {
        font-size: 28rpx;
        font-weight: 500;
        color: #ff3b30;
      }

      .original-price {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
      }
    }

    .favorite-time {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.edit-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: white;
  border-top: 1rpx solid #eee;

  .select-all {
    display: flex;
    align-items: center;
    gap: 15rpx;

    .checkbox {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background-color: #007aff;
        border-color: #007aff;
      }

      .check-icon {
        font-size: 20rpx;
        color: white;
      }
    }

    .select-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .batch-delete-btn {
    padding: 15rpx 30rpx;
    background-color: #ff3b30;
    color: white;
    border: none;
    border-radius: 25rpx;
    font-size: 26rpx;

    &:disabled {
      background-color: #ccc;
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
