<template>
  <view class="notifications-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">消息通知</view>
      <view class="nav-right">
        <text v-if="unreadCount > 0" class="nav-action" @click="markAllRead">全部已读</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        v-for="filter in filters" 
        :key="filter.value"
        class="filter-tab"
        :class="{ active: selectedFilter === filter.value }"
        @click="selectFilter(filter.value)"
      >
        <text class="tab-text">{{ filter.label }}</text>
        <view v-if="selectedFilter === filter.value" class="tab-indicator"></view>
      </view>
    </view>

    <!-- 通知列表 -->
    <view class="notifications-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="notifications.length === 0" class="empty-container">
        <text class="empty-icon">🔔</text>
        <text class="empty-text">暂无通知消息</text>
      </view>

      <view v-else>
        <view 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <!-- 通知图标 -->
          <view class="notification-icon">
            <text class="icon-text">{{ getNotificationIcon(notification.type) }}</text>
            <view v-if="!notification.read" class="unread-dot"></view>
          </view>

          <!-- 通知内容 -->
          <view class="notification-content">
            <view class="notification-header">
              <text class="notification-title">{{ notification.title }}</text>
              <text class="notification-time">{{ formatTime(notification.created_at) }}</text>
            </view>
            
            <text class="notification-text">{{ notification.content }}</text>
            
            <!-- 通知类型标签 -->
            <view class="notification-meta">
              <text class="notification-type">{{ getTypeLabel(notification.type) }}</text>
              <view v-if="notification.priority === 'high'" class="priority-badge">
                <text class="priority-text">重要</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="notification-actions" @click.stop>
            <view v-if="!notification.read" class="action-btn read-btn" @click="markAsRead(notification)">
              <text class="action-text">标记已读</text>
            </view>
            <view class="action-btn delete-btn" @click="deleteNotification(notification)">
              <text class="action-text">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>

    <!-- 通知设置入口 -->
    <view class="settings-entry" @click="goToSettings">
      <text class="settings-icon">⚙️</text>
      <text class="settings-text">通知设置</text>
      <text class="settings-arrow">></text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notifications: [],
      loading: false,
      selectedFilter: 'all',
      page: 1,
      hasMore: true,
      unreadCount: 0,
      filters: [
        { value: 'all', label: '全部' },
        { value: 'unread', label: '未读' },
        { value: 'order_created', label: '订单' },
        { value: 'payment_success', label: '支付' },
        { value: 'order_shipped', label: '物流' },
        { value: 'system_notice', label: '系统' }
      ]
    }
  },

  onLoad() {
    this.loadNotifications()
  },

  onShow() {
    // 页面显示时刷新未读数量
    this.loadNotifications(true)
  },

  onPullDownRefresh() {
    this.refreshNotifications()
  },

  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },

  methods: {
    async loadNotifications(isRefresh = false) {
      if (this.loading) return

      this.loading = true

      try {
        const params = {
          page: isRefresh ? 1 : this.page,
          limit: 20
        }

        // 添加筛选条件
        if (this.selectedFilter === 'unread') {
          params.read = false
        } else if (this.selectedFilter !== 'all') {
          params.type = this.selectedFilter
        }

        const res = await this.$request({
          url: '/api/notifications',
          method: 'GET',
          data: params
        })

        if (isRefresh) {
          this.notifications = res.data || []
          this.page = 1
        } else {
          this.notifications = [...this.notifications, ...(res.data || [])]
        }

        this.hasMore = res.pagination && res.pagination.has_next
        this.page = (res.pagination && res.pagination.current_page) + 1
        this.unreadCount = res.extra_data?.unread_count || 0

      } catch (error) {
        console.error('加载通知失败:', error)
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

    refreshNotifications() {
      this.loadNotifications(true)
    },

    loadMore() {
      this.loadNotifications()
    },

    selectFilter(filter) {
      this.selectedFilter = filter
      this.page = 1
      this.hasMore = true
      this.notifications = []
      this.loadNotifications()
    },

    async markAsRead(notification) {
      try {
        await this.$request({
          url: `/api/notifications/${notification.id}/read`,
          method: 'PUT'
        })

        // 更新本地状态
        notification.read = true
        notification.read_at = new Date()
        this.unreadCount = Math.max(0, this.unreadCount - 1)

        uni.showToast({
          title: '已标记为已读',
          icon: 'success'
        })

      } catch (error) {
        console.error('标记已读失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    async markAllRead() {
      if (this.unreadCount === 0) return

      try {
        const res = await this.$request({
          url: '/api/notifications/read-all',
          method: 'PUT'
        })

        // 更新本地状态
        this.notifications.forEach(notification => {
          if (!notification.read) {
            notification.read = true
            notification.read_at = new Date()
          }
        })
        this.unreadCount = 0

        uni.showToast({
          title: `已标记${res.data.count}条为已读`,
          icon: 'success'
        })

      } catch (error) {
        console.error('全部标记已读失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    async deleteNotification(notification) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条通知吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$request({
                url: `/api/notifications/${notification.id}`,
                method: 'DELETE'
              })

              // 从列表中移除
              const index = this.notifications.findIndex(n => n.id === notification.id)
              if (index > -1) {
                this.notifications.splice(index, 1)
                if (!notification.read) {
                  this.unreadCount = Math.max(0, this.unreadCount - 1)
                }
              }

              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })

            } catch (error) {
              console.error('删除通知失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    handleNotificationClick(notification) {
      // 如果未读，先标记为已读
      if (!notification.read) {
        this.markAsRead(notification)
      }

      // 根据通知类型跳转到相应页面
      this.navigateByNotificationType(notification)
    },

    navigateByNotificationType(notification) {
      const { type, data } = notification

      switch (type) {
        case 'order_created':
        case 'order_paid':
        case 'order_shipped':
        case 'order_delivered':
        case 'order_cancelled':
          if (data.order_id) {
            uni.navigateTo({
              url: `/pages/order/detail?id=${data.order_id}`
            })
          }
          break
        
        case 'coupon_received':
        case 'coupon_expired':
          uni.navigateTo({
            url: '/pages/user/coupons'
          })
          break
        
        default:
          // 其他类型暂不跳转
          break
      }
    },

    getNotificationIcon(type) {
      const icons = {
        'order_created': '📋',
        'order_paid': '💰',
        'order_shipped': '🚚',
        'order_delivered': '✅',
        'order_cancelled': '❌',
        'payment_success': '💳',
        'payment_failed': '⚠️',
        'refund_success': '💸',
        'coupon_received': '🎫',
        'coupon_expired': '⏰',
        'system_notice': '📢',
        'promotion': '🎉'
      }
      return icons[type] || '📝'
    },

    getTypeLabel(type) {
      const labels = {
        'order_created': '订单',
        'order_paid': '订单',
        'order_shipped': '物流',
        'order_delivered': '物流',
        'order_cancelled': '订单',
        'payment_success': '支付',
        'payment_failed': '支付',
        'refund_success': '退款',
        'coupon_received': '优惠券',
        'coupon_expired': '优惠券',
        'system_notice': '系统',
        'promotion': '活动'
      }
      return labels[type] || '通知'
    },

    formatTime(time) {
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 1天内
        return `${Math.floor(diff / 3600000)}小时前`
      } else if (diff < 604800000) { // 1周内
        return `${Math.floor(diff / 86400000)}天前`
      } else {
        return date.toLocaleDateString('zh-CN')
      }
    },

    goToSettings() {
      uni.navigateTo({
        url: '/pages/user/notification-settings'
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.notifications-page {
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

  .nav-action {
    font-size: 26rpx;
    color: #007aff;
  }
}

.filter-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;

  .filter-tab {
    flex-shrink: 0;
    position: relative;
    padding: 30rpx 40rpx;
    text-align: center;

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

.notifications-list {
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
}

.notification-item {
  display: flex;
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;

  &.unread {
    border-left: 6rpx solid #007aff;
  }

  .notification-icon {
    position: relative;
    margin-right: 20rpx;

    .icon-text {
      font-size: 40rpx;
    }

    .unread-dot {
      position: absolute;
      top: 0;
      right: 0;
      width: 16rpx;
      height: 16rpx;
      background-color: #ff3b30;
      border-radius: 50%;
    }
  }

  .notification-content {
    flex: 1;

    .notification-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10rpx;

      .notification-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
      }

      .notification-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .notification-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 15rpx;
      display: block;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 15rpx;

      .notification-type {
        padding: 4rpx 12rpx;
        background-color: #f0f0f0;
        border-radius: 8rpx;
        font-size: 22rpx;
        color: #666;
      }

      .priority-badge {
        padding: 4rpx 8rpx;
        background-color: #ff3b30;
        border-radius: 6rpx;

        .priority-text {
          font-size: 20rpx;
          color: white;
        }
      }
    }
  }

  .notification-actions {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    margin-left: 20rpx;

    .action-btn {
      padding: 8rpx 16rpx;
      border-radius: 12rpx;
      border: 1rpx solid #ddd;

      &.read-btn {
        background-color: #007aff;
        border-color: #007aff;

        .action-text {
          color: white;
        }
      }

      &.delete-btn {
        background-color: white;
        border-color: #ff3b30;

        .action-text {
          color: #ff3b30;
        }
      }

      .action-text {
        font-size: 22rpx;
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

.settings-entry {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;

  .settings-icon {
    font-size: 32rpx;
    margin-right: 20rpx;
  }

  .settings-text {
    flex: 1;
    font-size: 30rpx;
    color: #333;
  }

  .settings-arrow {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
