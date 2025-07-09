<template>
  <view class="address-list-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">←</text>
      </view>
      <view class="nav-title">{{ isSelectMode ? '选择地址' : '收货地址' }}</view>
      <view class="nav-right">
        <text v-if="!isSelectMode" class="nav-add" @click="addAddress">添加</text>
      </view>
    </view>

    <!-- 地址列表 -->
    <view class="address-list">
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="addresses.length === 0" class="empty-container">
        <text class="empty-icon">📍</text>
        <text class="empty-text">暂无收货地址</text>
        <button class="empty-btn" @click="addAddress">添加地址</button>
      </view>

      <view v-else>
        <view 
          v-for="address in addresses" 
          :key="address.id" 
          class="address-item"
          @click="selectAddress(address)"
        >
          <!-- 地址信息 -->
          <view class="address-content">
            <view class="address-header">
              <view class="user-info">
                <text class="user-name">{{ address.name }}</text>
                <text class="user-phone">{{ address.phone }}</text>
              </view>
              <view v-if="address.is_default" class="default-badge">
                <text class="badge-text">默认</text>
              </view>
            </view>
            
            <view class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
            </view>
          </view>

          <!-- 操作按钮 -->
          <view v-if="!isSelectMode" class="address-actions" @click.stop>
            <button class="action-btn edit" @click="editAddress(address)">
              编辑
            </button>
            <button class="action-btn delete" @click="deleteAddress(address)">
              删除
            </button>
          </view>

          <!-- 选择模式的选中标识 -->
          <view v-if="isSelectMode" class="select-indicator">
            <view class="select-radio">
              <view v-if="selectedAddressId === address.id" class="radio-checked"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加地址按钮 -->
    <view v-if="!isSelectMode && addresses.length > 0" class="add-address-btn">
      <button class="add-btn" @click="addAddress">
        <text class="add-icon">+</text>
        <text class="add-text">新增收货地址</text>
      </button>
    </view>

    <!-- 选择模式的确认按钮 -->
    <view v-if="isSelectMode && selectedAddress" class="confirm-bar">
      <button class="confirm-btn" @click="confirmSelect">
        确认选择
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addresses: [],
      loading: false,
      isSelectMode: false,
      selectedAddressId: null,
      selectedAddress: null
    }
  },

  onLoad(options) {
    this.isSelectMode = options.mode === 'select'
    this.loadAddresses()
  },

  methods: {
    async loadAddresses() {
      this.loading = true

      try {
        const res = await this.$request({
          url: '/api/addresses',
          method: 'GET'
        })

        this.addresses = res.data || []

      } catch (error) {
        console.error('加载地址失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    selectAddress(address) {
      if (this.isSelectMode) {
        this.selectedAddressId = address.id
        this.selectedAddress = address
      } else {
        // 非选择模式，点击进入编辑
        this.editAddress(address)
      }
    },

    confirmSelect() {
      if (this.selectedAddress) {
        // 通过事件回调返回选中的地址
        const eventChannel = this.getOpenerEventChannel()
        if (eventChannel) {
          eventChannel.emit('selectAddress', this.selectedAddress)
        }
        uni.navigateBack()
      }
    },

    addAddress() {
      uni.navigateTo({
        url: '/pages/address/edit',
        events: {
          addressSaved: () => {
            this.loadAddresses()
          }
        }
      })
    },

    editAddress(address) {
      uni.navigateTo({
        url: `/pages/address/edit?id=${address.id}`,
        events: {
          addressSaved: () => {
            this.loadAddresses()
          }
        }
      })
    },

    deleteAddress(address) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.$request({
                url: `/api/addresses/${address.id}`,
                method: 'DELETE'
              })

              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })

              this.loadAddresses()

            } catch (error) {
              console.error('删除地址失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.address-list-page {
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

  .nav-add {
    font-size: 28rpx;
    color: #007aff;
  }
}

.address-list {
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

.address-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  position: relative;

  .address-content {
    flex: 1;

    .address-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15rpx;

      .user-info {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .user-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
        }

        .user-phone {
          font-size: 28rpx;
          color: #666;
        }
      }

      .default-badge {
        padding: 4rpx 12rpx;
        background-color: #ff3b30;
        border-radius: 8rpx;

        .badge-text {
          font-size: 22rpx;
          color: white;
        }
      }
    }

    .address-detail {
      font-size: 28rpx;
      color: #666;
      line-height: 1.4;
    }
  }

  .address-actions {
    display: flex;
    gap: 15rpx;

    .action-btn {
      padding: 12rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      border: 1rpx solid #ddd;

      &.edit {
        background-color: white;
        color: #007aff;
        border-color: #007aff;
      }

      &.delete {
        background-color: white;
        color: #ff3b30;
        border-color: #ff3b30;
      }
    }
  }

  .select-indicator {
    margin-left: 20rpx;

    .select-radio {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #ddd;
      border-radius: 50%;
      position: relative;

      .radio-checked {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20rpx;
        height: 20rpx;
        background-color: #007aff;
        border-radius: 50%;
      }
    }
  }
}

.add-address-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;

  .add-btn {
    width: 100%;
    height: 80rpx;
    background-color: white;
    border: 2rpx dashed #ddd;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;

    .add-icon {
      font-size: 32rpx;
      color: #007aff;
    }

    .add-text {
      font-size: 28rpx;
      color: #007aff;
    }
  }
}

.confirm-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background-color: white;
  border-top: 1rpx solid #eee;

  .confirm-btn {
    width: 100%;
    height: 80rpx;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 500;
  }
}
</style>
