<template>
  <view class="reviews-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">商品评价</view>
      <view class="nav-right"></view>
    </view>

    <!-- 评价统计 -->
    <view class="review-stats">
      <view class="stats-header">
        <view class="average-rating">
          <text class="rating-number">{{ reviewStats.average_rating }}</text>
          <view class="rating-stars">
            <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.floor(reviewStats.average_rating) }">
              ★
            </text>
          </view>
          <text class="total-count">共{{ reviewStats.total_count }}条评价</text>
        </view>
      </view>
      
      <view class="rating-distribution">
        <view v-for="(count, rating) in reviewStats.rating_distribution" :key="rating" class="rating-bar">
          <text class="rating-label">{{ rating }}星</text>
          <view class="bar-container">
            <view class="bar-fill" :style="{ width: getBarWidth(count) }"></view>
          </view>
          <text class="rating-count">{{ count }}</text>
        </view>
      </view>
    </view>

    <!-- 评价筛选 -->
    <view class="review-filters">
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-item"
        :class="{ active: selectedFilter === filter.value }"
        @click="selectFilter(filter.value)"
      >
        <text class="filter-text">{{ filter.label }}</text>
      </view>
    </view>

    <!-- 评价列表 -->
    <view class="review-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="reviews.length === 0" class="empty-container">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无评价</text>
      </view>

      <view v-else>
        <view v-for="review in reviews" :key="review.id" class="review-item">
          <!-- 用户信息 -->
          <view class="review-header">
            <view class="user-info">
              <image class="user-avatar" :src="review.user?.avatar_url || defaultAvatar" mode="aspectFill"></image>
              <view class="user-details">
                <text class="username">{{ review.user?.username || '匿名用户' }}</text>
                <view class="rating-stars">
                  <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= review.rating }">
                    ★
                  </text>
                </view>
              </view>
            </view>
            <text class="review-time">{{ formatTime(review.created_at) }}</text>
          </view>

          <!-- 评价内容 -->
          <view class="review-content">
            <text class="review-text">{{ review.content }}</text>
            
            <!-- 评价图片 -->
            <view v-if="review.images && review.images.length > 0" class="review-images">
              <image 
                v-for="(image, index) in review.images" 
                :key="index"
                class="review-image"
                :src="image"
                mode="aspectFill"
                @click="previewImages(review.images, index)"
              ></image>
            </view>
          </view>

          <!-- 商家回复 -->
          <view v-if="review.reply" class="merchant-reply">
            <view class="reply-header">
              <text class="reply-label">商家回复：</text>
            </view>
            <text class="reply-content">{{ review.reply }}</text>
          </view>

          <!-- 评价操作 -->
          <view class="review-actions">
            <view class="action-item" @click="toggleHelpful(review)">
              <text class="action-icon">👍</text>
              <text class="action-text">有用 {{ review.helpful_count }}</text>
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
      productId: null,
      reviews: [],
      reviewStats: {
        total_count: 0,
        average_rating: 0,
        rating_distribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      },
      loading: false,
      selectedFilter: '',
      page: 1,
      hasMore: true,
      defaultAvatar: 'https://via.placeholder.com/60x60?text=👤',
      filters: [
        { value: '', label: '全部' },
        { value: '5', label: '5星' },
        { value: '4', label: '4星' },
        { value: '3', label: '3星' },
        { value: '2', label: '2星' },
        { value: '1', label: '1星' }
      ]
    }
  },

  onLoad(options) {
    if (options.productId) {
      this.productId = parseInt(options.productId)
      this.loadReviews()
    }
  },

  onPullDownRefresh() {
    this.refreshReviews()
  },

  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },

  methods: {
    async loadReviews(isRefresh = false) {
      if (this.loading) return

      this.loading = true

      try {
        const params = {
          page: isRefresh ? 1 : this.page,
          limit: 10
        }

        if (this.selectedFilter) {
          params.rating = this.selectedFilter
        }

        const res = await this.$request({
          url: `/api/products/${this.productId}/reviews`,
          method: 'GET',
          data: params
        })

        if (isRefresh) {
          this.reviews = res.data.reviews || []
          this.page = 1
        } else {
          this.reviews = [...this.reviews, ...(res.data.reviews || [])]
        }

        this.reviewStats = res.data.stats || this.reviewStats
        this.hasMore = res.pagination && res.pagination.has_next
        this.page = (res.pagination && res.pagination.current_page) + 1

      } catch (error) {
        console.error('加载评价失败:', error)
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

    refreshReviews() {
      this.loadReviews(true)
    },

    loadMore() {
      this.loadReviews()
    },

    selectFilter(filter) {
      this.selectedFilter = filter
      this.page = 1
      this.hasMore = true
      this.reviews = []
      this.loadReviews()
    },

    getBarWidth(count) {
      const maxCount = Math.max(...Object.values(this.reviewStats.rating_distribution))
      return maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%'
    },

    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 86400000) { // 1天内
        if (diff < 3600000) { // 1小时内
          return `${Math.floor(diff / 60000)}分钟前`
        } else {
          return `${Math.floor(diff / 3600000)}小时前`
        }
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },

    previewImages(images, current) {
      uni.previewImage({
        urls: images,
        current: current
      })
    },

    async toggleHelpful(review) {
      // 这里可以实现点赞功能
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.reviews-page {
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

.review-stats {
  background-color: white;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .stats-header {
    .average-rating {
      text-align: center;
      margin-bottom: 30rpx;

      .rating-number {
        font-size: 60rpx;
        font-weight: bold;
        color: #ff6b35;
        display: block;
        margin-bottom: 10rpx;
      }

      .rating-stars {
        margin-bottom: 10rpx;

        .star {
          font-size: 24rpx;
          color: #ddd;
          margin: 0 2rpx;

          &.active {
            color: #ff6b35;
          }
        }
      }

      .total-count {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .rating-distribution {
    .rating-bar {
      display: flex;
      align-items: center;
      margin-bottom: 15rpx;

      .rating-label {
        width: 60rpx;
        font-size: 24rpx;
        color: #666;
      }

      .bar-container {
        flex: 1;
        height: 12rpx;
        background-color: #f0f0f0;
        border-radius: 6rpx;
        margin: 0 20rpx;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          background-color: #ff6b35;
          border-radius: 6rpx;
          transition: width 0.3s ease;
        }
      }

      .rating-count {
        width: 40rpx;
        text-align: right;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.review-filters {
  display: flex;
  background-color: white;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  gap: 20rpx;

  .filter-item {
    padding: 12rpx 24rpx;
    border: 1rpx solid #ddd;
    border-radius: 20rpx;
    background-color: white;

    &.active {
      background-color: #ff6b35;
      border-color: #ff6b35;

      .filter-text {
        color: white;
      }
    }

    .filter-text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.review-list {
  padding: 0 20rpx;
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
}

.review-item {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .user-info {
      display: flex;
      align-items: center;

      .user-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .user-details {
        .username {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
          display: block;
        }

        .rating-stars {
          .star {
            font-size: 20rpx;
            color: #ddd;
            margin-right: 4rpx;

            &.active {
              color: #ff6b35;
            }
          }
        }
      }
    }

    .review-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .review-content {
    .review-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      margin-bottom: 20rpx;
      display: block;
    }

    .review-images {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;

      .review-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 8rpx;
      }
    }
  }

  .merchant-reply {
    background-color: #f8f8f8;
    padding: 20rpx;
    border-radius: 8rpx;
    margin-top: 20rpx;

    .reply-header {
      margin-bottom: 10rpx;

      .reply-label {
        font-size: 24rpx;
        color: #ff6b35;
        font-weight: 500;
      }
    }

    .reply-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  .review-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;

    .action-item {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .action-icon {
        font-size: 24rpx;
      }

      .action-text {
        font-size: 24rpx;
        color: #666;
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
