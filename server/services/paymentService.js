/**
 * 支付服务模块
 * 支持微信支付、支付宝、信用卡等多种支付方式
 */

const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.paymentMethods = {
      wechat_pay: {
        name: '微信支付',
        enabled: true,
        config: {
          appId: process.env.WECHAT_APP_ID || 'demo_app_id',
          mchId: process.env.WECHAT_MCH_ID || 'demo_mch_id',
          apiKey: process.env.WECHAT_API_KEY || 'demo_api_key'
        }
      },
      alipay: {
        name: '支付宝',
        enabled: true,
        config: {
          appId: process.env.ALIPAY_APP_ID || 'demo_app_id',
          privateKey: process.env.ALIPAY_PRIVATE_KEY || 'demo_private_key',
          publicKey: process.env.ALIPAY_PUBLIC_KEY || 'demo_public_key'
        }
      },
      credit_card: {
        name: '信用卡支付',
        enabled: true,
        config: {
          merchantId: process.env.STRIPE_MERCHANT_ID || 'demo_merchant_id',
          secretKey: process.env.STRIPE_SECRET_KEY || 'demo_secret_key'
        }
      }
    };
  }

  /**
   * 创建支付订单
   * @param {Object} orderData 订单数据
   * @param {string} paymentMethod 支付方式
   * @returns {Object} 支付信息
   */
  async createPayment(orderData, paymentMethod) {
    try {
      const method = this.paymentMethods[paymentMethod];
      if (!method || !method.enabled) {
        throw new Error('不支持的支付方式');
      }

      switch (paymentMethod) {
        case 'wechat_pay':
          return await this.createWechatPayment(orderData);
        case 'alipay':
          return await this.createAlipayPayment(orderData);
        case 'credit_card':
          return await this.createCreditCardPayment(orderData);
        default:
          throw new Error('未知的支付方式');
      }
    } catch (error) {
      console.error('创建支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 创建微信支付订单
   */
  async createWechatPayment(orderData) {
    // 模拟微信支付API调用
    const paymentData = {
      payment_id: this.generatePaymentId('WX'),
      payment_method: 'wechat_pay',
      order_id: orderData.id,
      amount: orderData.total_amount,
      currency: 'CNY',
      status: 'pending',
      qr_code: this.generateQRCode(orderData),
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15分钟过期
      created_at: new Date()
    };

    // 在实际项目中，这里会调用微信支付API
    console.log('创建微信支付订单:', paymentData);
    
    return {
      success: true,
      payment_info: paymentData,
      redirect_url: null, // H5支付时需要
      qr_code: paymentData.qr_code // 扫码支付
    };
  }

  /**
   * 创建支付宝支付订单
   */
  async createAlipayPayment(orderData) {
    // 模拟支付宝API调用
    const paymentData = {
      payment_id: this.generatePaymentId('ALI'),
      payment_method: 'alipay',
      order_id: orderData.id,
      amount: orderData.total_amount,
      currency: 'CNY',
      status: 'pending',
      redirect_url: this.generateAlipayUrl(orderData),
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
      created_at: new Date()
    };

    console.log('创建支付宝支付订单:', paymentData);
    
    return {
      success: true,
      payment_info: paymentData,
      redirect_url: paymentData.redirect_url,
      qr_code: null
    };
  }

  /**
   * 创建信用卡支付订单
   */
  async createCreditCardPayment(orderData) {
    // 模拟信用卡支付API调用
    const paymentData = {
      payment_id: this.generatePaymentId('CC'),
      payment_method: 'credit_card',
      order_id: orderData.id,
      amount: orderData.total_amount,
      currency: 'CNY',
      status: 'pending',
      client_secret: this.generateClientSecret(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30分钟过期
      created_at: new Date()
    };

    console.log('创建信用卡支付订单:', paymentData);
    
    return {
      success: true,
      payment_info: paymentData,
      client_secret: paymentData.client_secret,
      redirect_url: null
    };
  }

  /**
   * 查询支付状态
   */
  async queryPaymentStatus(paymentId) {
    // 模拟查询支付状态
    // 在实际项目中，这里会调用对应支付平台的查询API
    
    const mockStatuses = ['pending', 'paid', 'failed', 'cancelled'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    return {
      payment_id: paymentId,
      status: randomStatus,
      paid_at: randomStatus === 'paid' ? new Date() : null,
      transaction_id: randomStatus === 'paid' ? this.generateTransactionId() : null
    };
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(paymentMethod, callbackData) {
    try {
      switch (paymentMethod) {
        case 'wechat_pay':
          return await this.handleWechatCallback(callbackData);
        case 'alipay':
          return await this.handleAlipayCallback(callbackData);
        case 'credit_card':
          return await this.handleCreditCardCallback(callbackData);
        default:
          throw new Error('未知的支付方式');
      }
    } catch (error) {
      console.error('处理支付回调失败:', error);
      throw error;
    }
  }

  /**
   * 处理微信支付回调
   */
  async handleWechatCallback(callbackData) {
    // 验证签名
    if (!this.verifyWechatSignature(callbackData)) {
      throw new Error('微信支付回调签名验证失败');
    }

    return {
      payment_id: callbackData.out_trade_no,
      status: callbackData.result_code === 'SUCCESS' ? 'paid' : 'failed',
      transaction_id: callbackData.transaction_id,
      paid_at: new Date()
    };
  }

  /**
   * 处理支付宝回调
   */
  async handleAlipayCallback(callbackData) {
    // 验证签名
    if (!this.verifyAlipaySignature(callbackData)) {
      throw new Error('支付宝回调签名验证失败');
    }

    return {
      payment_id: callbackData.out_trade_no,
      status: callbackData.trade_status === 'TRADE_SUCCESS' ? 'paid' : 'failed',
      transaction_id: callbackData.trade_no,
      paid_at: new Date()
    };
  }

  /**
   * 处理信用卡支付回调
   */
  async handleCreditCardCallback(callbackData) {
    return {
      payment_id: callbackData.payment_intent_id,
      status: callbackData.status === 'succeeded' ? 'paid' : 'failed',
      transaction_id: callbackData.charge_id,
      paid_at: new Date()
    };
  }

  /**
   * 申请退款
   */
  async requestRefund(paymentId, refundAmount, reason) {
    try {
      const refundData = {
        refund_id: this.generateRefundId(),
        payment_id: paymentId,
        amount: refundAmount,
        reason: reason,
        status: 'processing',
        created_at: new Date()
      };

      // 模拟退款处理
      console.log('申请退款:', refundData);
      
      return {
        success: true,
        refund_info: refundData
      };
    } catch (error) {
      console.error('申请退款失败:', error);
      throw error;
    }
  }

  // 工具方法
  generatePaymentId(prefix) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  }

  generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8);
  }

  generateRefundId() {
    return 'REF' + Date.now() + Math.random().toString(36).substring(2, 8);
  }

  generateQRCode(orderData) {
    // 模拟生成二维码数据
    return `weixin://wxpay/bizpayurl?pr=${this.generatePaymentId('QR')}`;
  }

  generateAlipayUrl(orderData) {
    // 模拟生成支付宝支付URL
    return `https://openapi.alipay.com/gateway.do?method=alipay.trade.page.pay&app_id=demo&out_trade_no=${orderData.id}`;
  }

  generateClientSecret() {
    return 'pi_' + crypto.randomBytes(16).toString('hex');
  }

  verifyWechatSignature(data) {
    // 模拟微信签名验证
    return true;
  }

  verifyAlipaySignature(data) {
    // 模拟支付宝签名验证
    return true;
  }

  /**
   * 获取支持的支付方式
   */
  getSupportedPaymentMethods() {
    return Object.keys(this.paymentMethods)
      .filter(method => this.paymentMethods[method].enabled)
      .map(method => ({
        method,
        name: this.paymentMethods[method].name,
        enabled: this.paymentMethods[method].enabled
      }));
  }
}

module.exports = new PaymentService();
