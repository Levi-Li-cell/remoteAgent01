/**
 * 消息通知服务模块
 * 支持站内消息、短信、邮件、推送等多种通知方式
 */

class NotificationService {
  constructor() {
    this.notificationTypes = {
      'order_created': '订单创建',
      'order_paid': '订单支付成功',
      'order_shipped': '订单已发货',
      'order_delivered': '订单已签收',
      'order_cancelled': '订单已取消',
      'payment_success': '支付成功',
      'payment_failed': '支付失败',
      'refund_success': '退款成功',
      'coupon_received': '优惠券到账',
      'coupon_expired': '优惠券即将过期',
      'system_notice': '系统通知',
      'promotion': '促销活动'
    };

    this.channels = {
      'in_app': { name: '站内消息', enabled: true },
      'sms': { name: '短信通知', enabled: true },
      'email': { name: '邮件通知', enabled: true },
      'push': { name: '推送通知', enabled: true }
    };

    // 存储通知记录
    this.notifications = [];
    this.notificationSettings = new Map(); // 用户通知设置
  }

  /**
   * 发送通知
   * @param {Object} notificationData 通知数据
   * @returns {Object} 发送结果
   */
  async sendNotification(notificationData) {
    try {
      const {
        user_id,
        type,
        title,
        content,
        channels = ['in_app'],
        data = {},
        priority = 'normal'
      } = notificationData;

      // 检查用户通知设置
      const userSettings = this.getUserNotificationSettings(user_id);
      const enabledChannels = channels.filter(channel => 
        userSettings[channel] !== false && this.channels[channel]?.enabled
      );

      const notification = {
        id: this.generateNotificationId(),
        user_id,
        type,
        title,
        content,
        data,
        priority,
        channels: enabledChannels,
        status: 'sent',
        read: false,
        created_at: new Date(),
        read_at: null
      };

      // 存储通知记录
      this.notifications.push(notification);

      // 发送到各个渠道
      const sendResults = {};
      for (const channel of enabledChannels) {
        try {
          sendResults[channel] = await this.sendToChannel(channel, notification);
        } catch (error) {
          console.error(`发送${channel}通知失败:`, error);
          sendResults[channel] = { success: false, error: error.message };
        }
      }

      console.log('发送通知:', notification);
      console.log('发送结果:', sendResults);

      return {
        success: true,
        notification_id: notification.id,
        send_results: sendResults
      };
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    }
  }

  /**
   * 发送到指定渠道
   */
  async sendToChannel(channel, notification) {
    switch (channel) {
      case 'in_app':
        return await this.sendInAppNotification(notification);
      case 'sms':
        return await this.sendSMSNotification(notification);
      case 'email':
        return await this.sendEmailNotification(notification);
      case 'push':
        return await this.sendPushNotification(notification);
      default:
        throw new Error(`不支持的通知渠道: ${channel}`);
    }
  }

  /**
   * 发送站内消息
   */
  async sendInAppNotification(notification) {
    // 站内消息已经存储在notifications数组中
    return { success: true, message: '站内消息发送成功' };
  }

  /**
   * 发送短信通知
   */
  async sendSMSNotification(notification) {
    // 模拟短信发送
    const smsData = {
      phone: notification.data.phone || '138****8888',
      content: notification.content,
      template_id: this.getSMSTemplate(notification.type),
      sent_at: new Date()
    };

    console.log('发送短信:', smsData);
    return { success: true, sms_id: this.generateSMSId(), message: '短信发送成功' };
  }

  /**
   * 发送邮件通知
   */
  async sendEmailNotification(notification) {
    // 模拟邮件发送
    const emailData = {
      to: notification.data.email || 'user@example.com',
      subject: notification.title,
      content: notification.content,
      template: this.getEmailTemplate(notification.type),
      sent_at: new Date()
    };

    console.log('发送邮件:', emailData);
    return { success: true, email_id: this.generateEmailId(), message: '邮件发送成功' };
  }

  /**
   * 发送推送通知
   */
  async sendPushNotification(notification) {
    // 模拟推送通知
    const pushData = {
      user_id: notification.user_id,
      title: notification.title,
      body: notification.content,
      data: notification.data,
      sent_at: new Date()
    };

    console.log('发送推送:', pushData);
    return { success: true, push_id: this.generatePushId(), message: '推送发送成功' };
  }

  /**
   * 获取用户通知列表
   */
  getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      type = null,
      read = null
    } = options;

    let userNotifications = this.notifications.filter(n => n.user_id === userId);

    // 类型筛选
    if (type) {
      userNotifications = userNotifications.filter(n => n.type === type);
    }

    // 已读状态筛选
    if (read !== null) {
      userNotifications = userNotifications.filter(n => n.read === read);
    }

    // 按时间倒序排列
    userNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 分页
    const total = userNotifications.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

    return {
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total,
        has_next: endIndex < total
      },
      unread_count: userNotifications.filter(n => !n.read).length
    };
  }

  /**
   * 标记通知为已读
   */
  markAsRead(notificationId, userId) {
    const notification = this.notifications.find(n => 
      n.id === notificationId && n.user_id === userId
    );

    if (notification && !notification.read) {
      notification.read = true;
      notification.read_at = new Date();
      return true;
    }

    return false;
  }

  /**
   * 批量标记为已读
   */
  markAllAsRead(userId) {
    let count = 0;
    this.notifications.forEach(notification => {
      if (notification.user_id === userId && !notification.read) {
        notification.read = true;
        notification.read_at = new Date();
        count++;
      }
    });
    return count;
  }

  /**
   * 删除通知
   */
  deleteNotification(notificationId, userId) {
    const index = this.notifications.findIndex(n => 
      n.id === notificationId && n.user_id === userId
    );

    if (index > -1) {
      this.notifications.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * 获取用户通知设置
   */
  getUserNotificationSettings(userId) {
    return this.notificationSettings.get(userId) || {
      in_app: true,
      sms: true,
      email: true,
      push: true,
      order_notifications: true,
      payment_notifications: true,
      promotion_notifications: true
    };
  }

  /**
   * 更新用户通知设置
   */
  updateUserNotificationSettings(userId, settings) {
    const currentSettings = this.getUserNotificationSettings(userId);
    const newSettings = { ...currentSettings, ...settings };
    this.notificationSettings.set(userId, newSettings);
    return newSettings;
  }

  /**
   * 发送订单相关通知
   */
  async sendOrderNotification(orderId, type, extraData = {}) {
    // 这里需要根据订单ID获取订单信息和用户信息
    // 简化处理，实际项目中需要查询数据库
    const notificationData = {
      user_id: extraData.user_id || 999,
      type: type,
      title: this.getNotificationTitle(type),
      content: this.getNotificationContent(type, { order_id: orderId, ...extraData }),
      channels: ['in_app', 'sms'],
      data: {
        order_id: orderId,
        ...extraData
      }
    };

    return await this.sendNotification(notificationData);
  }

  /**
   * 获取通知标题
   */
  getNotificationTitle(type) {
    const titles = {
      'order_created': '订单创建成功',
      'order_paid': '支付成功',
      'order_shipped': '商品已发货',
      'order_delivered': '商品已签收',
      'order_cancelled': '订单已取消',
      'payment_success': '支付成功',
      'payment_failed': '支付失败',
      'refund_success': '退款成功',
      'coupon_received': '优惠券到账',
      'coupon_expired': '优惠券即将过期'
    };

    return titles[type] || '系统通知';
  }

  /**
   * 获取通知内容
   */
  getNotificationContent(type, data) {
    const contents = {
      'order_created': `您的订单 ${data.order_no || data.order_id} 已创建成功，请及时支付。`,
      'order_paid': `您的订单 ${data.order_no || data.order_id} 支付成功，我们将尽快为您发货。`,
      'order_shipped': `您的订单 ${data.order_no || data.order_id} 已发货，快递单号：${data.tracking_number}。`,
      'order_delivered': `您的订单 ${data.order_no || data.order_id} 已签收，感谢您的购买！`,
      'order_cancelled': `您的订单 ${data.order_no || data.order_id} 已取消。`,
      'payment_success': `支付成功，金额：¥${data.amount}。`,
      'payment_failed': `支付失败，请重新尝试支付。`,
      'refund_success': `退款成功，金额：¥${data.amount}，将在3-5个工作日内到账。`,
      'coupon_received': `恭喜您获得优惠券：${data.coupon_name}，快去使用吧！`,
      'coupon_expired': `您的优惠券 ${data.coupon_name} 即将过期，请尽快使用。`
    };

    return contents[type] || '您有新的系统通知，请查看。';
  }

  // 工具方法
  generateNotificationId() {
    return 'NOTIF' + Date.now() + Math.random().toString(36).substring(2, 8);
  }

  generateSMSId() {
    return 'SMS' + Date.now() + Math.random().toString(36).substring(2, 6);
  }

  generateEmailId() {
    return 'EMAIL' + Date.now() + Math.random().toString(36).substring(2, 6);
  }

  generatePushId() {
    return 'PUSH' + Date.now() + Math.random().toString(36).substring(2, 6);
  }

  getSMSTemplate(type) {
    const templates = {
      'order_created': 'SMS_ORDER_CREATED',
      'order_paid': 'SMS_ORDER_PAID',
      'order_shipped': 'SMS_ORDER_SHIPPED',
      'order_delivered': 'SMS_ORDER_DELIVERED'
    };
    return templates[type] || 'SMS_DEFAULT';
  }

  getEmailTemplate(type) {
    const templates = {
      'order_created': 'email_order_created.html',
      'order_paid': 'email_order_paid.html',
      'order_shipped': 'email_order_shipped.html',
      'order_delivered': 'email_order_delivered.html'
    };
    return templates[type] || 'email_default.html';
  }
}

module.exports = new NotificationService();
