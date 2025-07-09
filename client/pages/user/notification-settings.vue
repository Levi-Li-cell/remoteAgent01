<template>
  <view class="notification-settings-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">通知设置</view>
      <view class="nav-right"></view>
    </view>

    <!-- 设置内容 -->
    <view class="settings-content">
      <!-- 通知渠道设置 -->
      <view class="settings-section">
        <view class="section-title">通知渠道</view>
        <view class="section-desc">选择您希望接收通知的方式</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">📱</text>
            <view class="setting-details">
              <text class="setting-name">站内消息</text>
              <text class="setting-desc">在应用内接收通知消息</text>
            </view>
          </view>
          <switch 
            :checked="settings.in_app" 
            @change="updateSetting('in_app', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">📧</text>
            <view class="setting-details">
              <text class="setting-name">邮件通知</text>
              <text class="setting-desc">通过邮件接收重要通知</text>
            </view>
          </view>
          <switch 
            :checked="settings.email" 
            @change="updateSetting('email', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">💬</text>
            <view class="setting-details">
              <text class="setting-name">短信通知</text>
              <text class="setting-desc">通过短信接收重要通知</text>
            </view>
          </view>
          <switch 
            :checked="settings.sms" 
            @change="updateSetting('sms', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">🔔</text>
            <view class="setting-details">
              <text class="setting-name">推送通知</text>
              <text class="setting-desc">通过系统推送接收通知</text>
            </view>
          </view>
          <switch 
            :checked="settings.push" 
            @change="updateSetting('push', $event.detail.value)"
            color="#007aff"
          />
        </view>
      </view>

      <!-- 通知类型设置 -->
      <view class="settings-section">
        <view class="section-title">通知类型</view>
        <view class="section-desc">选择您希望接收的通知类型</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">📦</text>
            <view class="setting-details">
              <text class="setting-name">订单通知</text>
              <text class="setting-desc">订单状态变更、发货、签收等</text>
            </view>
          </view>
          <switch 
            :checked="settings.order_notifications" 
            @change="updateSetting('order_notifications', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">💳</text>
            <view class="setting-details">
              <text class="setting-name">支付通知</text>
              <text class="setting-desc">支付成功、失败、退款等</text>
            </view>
          </view>
          <switch 
            :checked="settings.payment_notifications" 
            @change="updateSetting('payment_notifications', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">🎉</text>
            <view class="setting-details">
              <text class="setting-name">促销通知</text>
              <text class="setting-desc">优惠活动、新品上架等</text>
            </view>
          </view>
          <switch 
            :checked="settings.promotion_notifications" 
            @change="updateSetting('promotion_notifications', $event.detail.value)"
            color="#007aff"
          />
        </view>
      </view>

      <!-- 免打扰时间设置 -->
      <view class="settings-section">
        <view class="section-title">免打扰时间</view>
        <view class="section-desc">设置不接收通知的时间段</view>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-icon">🌙</text>
            <view class="setting-details">
              <text class="setting-name">夜间免打扰</text>
              <text class="setting-desc">22:00 - 08:00 不接收通知</text>
            </view>
          </view>
          <switch 
            :checked="settings.night_mode" 
            @change="updateSetting('night_mode', $event.detail.value)"
            color="#007aff"
          />
        </view>

        <view v-if="settings.night_mode" class="time-range-setting">
          <view class="time-item">
            <text class="time-label">开始时间</text>
            <picker mode="time" :value="settings.night_start" @change="updateSetting('night_start', $event.detail.value)">
              <view class="time-value">{{ settings.night_start }}</view>
            </picker>
          </view>
          
          <view class="time-item">
            <text class="time-label">结束时间</text>
            <picker mode="time" :value="settings.night_end" @change="updateSetting('night_end', $event.detail.value)">
              <view class="time-value">{{ settings.night_end }}</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="save-btn" @click="saveSettings" :disabled="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
        
        <button class="reset-btn" @click="resetSettings">
          恢复默认设置
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      settings: {
        // 通知渠道
        in_app: true,
        email: true,
        sms: false,
        push: true,
        
        // 通知类型
        order_notifications: true,
        payment_notifications: true,
        promotion_notifications: false,
        
        // 免打扰设置
        night_mode: false,
        night_start: '22:00',
        night_end: '08:00'
      },
      originalSettings: {},
      saving: false
    }
  },

  onLoad() {
    this.loadSettings()
  },

  methods: {
    async loadSettings() {
      try {
        const res = await this.$request({
          url: '/api/notifications/settings',
          method: 'GET'
        })

        if (res.data) {
          this.settings = { ...this.settings, ...res.data }
          this.originalSettings = { ...this.settings }
        }
      } catch (error) {
        console.error('加载通知设置失败:', error)
        uni.showToast({
          title: '加载设置失败',
          icon: 'none'
        })
      }
    },

    updateSetting(key, value) {
      this.settings[key] = value
    },

    async saveSettings() {
      if (this.saving) return

      this.saving = true

      try {
        await this.$request({
          url: '/api/notifications/settings',
          method: 'PUT',
          data: this.settings
        })

        this.originalSettings = { ...this.settings }

        uni.showToast({
          title: '设置保存成功',
          icon: 'success'
        })

      } catch (error) {
        console.error('保存通知设置失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.saving = false
      }
    },

    resetSettings() {
      uni.showModal({
        title: '恢复默认设置',
        content: '确定要恢复默认的通知设置吗？',
        success: (res) => {
          if (res.confirm) {
            this.settings = {
              in_app: true,
              email: true,
              sms: false,
              push: true,
              order_notifications: true,
              payment_notifications: true,
              promotion_notifications: false,
              night_mode: false,
              night_start: '22:00',
              night_end: '08:00'
            }

            uni.showToast({
              title: '已恢复默认设置',
              icon: 'success'
            })
          }
        }
      })
    },

    goBack() {
      // 检查是否有未保存的更改
      const hasChanges = JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings)
      
      if (hasChanges) {
        uni.showModal({
          title: '提示',
          content: '您有未保存的更改，确定要离开吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-settings-page {
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

.settings-content {
  padding: 20rpx;
}

.settings-section {
  background-color: white;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;

  .section-title {
    padding: 30rpx 30rpx 10rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }

  .section-desc {
    padding: 0 30rpx 20rpx;
    font-size: 26rpx;
    color: #999;
    line-height: 1.4;
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .setting-info {
    display: flex;
    align-items: center;
    flex: 1;

    .setting-icon {
      font-size: 32rpx;
      margin-right: 20rpx;
    }

    .setting-details {
      flex: 1;

      .setting-name {
        font-size: 30rpx;
        color: #333;
        margin-bottom: 8rpx;
        display: block;
      }

      .setting-desc {
        font-size: 24rpx;
        color: #999;
        line-height: 1.3;
      }
    }
  }
}

.time-range-setting {
  padding: 0 30rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .time-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;

    .time-label {
      font-size: 28rpx;
      color: #333;
    }

    .time-value {
      padding: 12rpx 20rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #007aff;
    }
  }
}

.action-buttons {
  padding: 40rpx 0;

  .save-btn, .reset-btn {
    width: 100%;
    height: 80rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 20rpx;
    border: none;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .save-btn {
    background-color: #007aff;
    color: white;

    &:disabled {
      background-color: #ccc;
    }
  }

  .reset-btn {
    background-color: white;
    color: #666;
    border: 1rpx solid #ddd;
  }
}
</style>
