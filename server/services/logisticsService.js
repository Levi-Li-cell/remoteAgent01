/**
 * 物流跟踪服务模块
 * 支持多家物流公司的快递跟踪
 */

class LogisticsService {
  constructor() {
    this.logisticsCompanies = {
      'sf': { name: '顺丰速运', code: 'sf', enabled: true },
      'ems': { name: '中国邮政', code: 'ems', enabled: true },
      'sto': { name: '申通快递', code: 'sto', enabled: true },
      'yt': { name: '圆通速递', code: 'yt', enabled: true },
      'zto': { name: '中通快递', code: 'zto', enabled: true },
      'yunda': { name: '韵达速递', code: 'yunda', enabled: true },
      'jd': { name: '京东物流', code: 'jd', enabled: true },
      'db': { name: '德邦快递', code: 'db', enabled: true }
    };

    // 物流状态映射
    this.statusMap = {
      'collected': '已揽收',
      'in_transit': '运输中',
      'out_for_delivery': '派送中',
      'delivered': '已签收',
      'exception': '异常',
      'returned': '已退回'
    };
  }

  /**
   * 创建物流订单
   * @param {Object} orderData 订单数据
   * @param {string} companyCode 物流公司代码
   * @returns {Object} 物流订单信息
   */
  async createLogisticsOrder(orderData, companyCode = 'sf') {
    try {
      const company = this.logisticsCompanies[companyCode];
      if (!company || !company.enabled) {
        throw new Error('不支持的物流公司');
      }

      const trackingNumber = this.generateTrackingNumber(companyCode);
      
      const logisticsOrder = {
        tracking_number: trackingNumber,
        company_code: companyCode,
        company_name: company.name,
        order_id: orderData.id,
        sender: {
          name: '数码商城',
          phone: '400-123-4567',
          address: '广东省深圳市南山区科技园南区'
        },
        receiver: {
          name: orderData.shipping_address.name,
          phone: orderData.shipping_address.phone,
          address: `${orderData.shipping_address.province}${orderData.shipping_address.city}${orderData.shipping_address.district}${orderData.shipping_address.detail}`
        },
        status: 'collected',
        created_at: new Date(),
        estimated_delivery: this.calculateEstimatedDelivery(companyCode)
      };

      // 创建初始物流轨迹
      const initialTrace = {
        time: new Date(),
        status: 'collected',
        description: '商品已从发货仓库揽收',
        location: '深圳市南山区'
      };

      console.log('创建物流订单:', logisticsOrder);
      
      return {
        success: true,
        logistics_info: logisticsOrder,
        tracking_traces: [initialTrace]
      };
    } catch (error) {
      console.error('创建物流订单失败:', error);
      throw error;
    }
  }

  /**
   * 查询物流信息
   * @param {string} trackingNumber 快递单号
   * @param {string} companyCode 物流公司代码
   * @returns {Object} 物流跟踪信息
   */
  async trackLogistics(trackingNumber, companyCode) {
    try {
      const company = this.logisticsCompanies[companyCode];
      if (!company) {
        throw new Error('不支持的物流公司');
      }

      // 模拟物流跟踪数据
      const mockTraces = this.generateMockTraces(trackingNumber, companyCode);
      
      const logisticsInfo = {
        tracking_number: trackingNumber,
        company_code: companyCode,
        company_name: company.name,
        status: mockTraces[0].status,
        current_location: mockTraces[0].location,
        estimated_delivery: this.calculateEstimatedDelivery(companyCode),
        traces: mockTraces,
        updated_at: new Date()
      };

      return {
        success: true,
        logistics_info: logisticsInfo
      };
    } catch (error) {
      console.error('查询物流信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新物流状态
   * @param {string} trackingNumber 快递单号
   * @param {string} status 新状态
   * @param {string} description 状态描述
   * @param {string} location 当前位置
   */
  async updateLogisticsStatus(trackingNumber, status, description, location) {
    try {
      const updateInfo = {
        tracking_number: trackingNumber,
        status: status,
        description: description,
        location: location,
        updated_at: new Date()
      };

      console.log('更新物流状态:', updateInfo);
      
      return {
        success: true,
        update_info: updateInfo
      };
    } catch (error) {
      console.error('更新物流状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取支持的物流公司列表
   */
  getSupportedCompanies() {
    return Object.keys(this.logisticsCompanies)
      .filter(code => this.logisticsCompanies[code].enabled)
      .map(code => ({
        code,
        name: this.logisticsCompanies[code].name,
        enabled: this.logisticsCompanies[code].enabled
      }));
  }

  /**
   * 生成快递单号
   */
  generateTrackingNumber(companyCode) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    
    const prefixes = {
      'sf': 'SF',
      'ems': 'EA',
      'sto': 'STO',
      'yt': 'YT',
      'zto': 'ZTO',
      'yunda': 'YD',
      'jd': 'JD',
      'db': 'DB'
    };

    const prefix = prefixes[companyCode] || 'EX';
    return `${prefix}${timestamp.slice(-8)}${random.toUpperCase()}`;
  }

  /**
   * 计算预计送达时间
   */
  calculateEstimatedDelivery(companyCode) {
    const deliveryDays = {
      'sf': 1, // 顺丰次日达
      'ems': 3, // 邮政3天
      'sto': 2, // 申通2天
      'yt': 2, // 圆通2天
      'zto': 2, // 中通2天
      'yunda': 2, // 韵达2天
      'jd': 1, // 京东次日达
      'db': 2 // 德邦2天
    };

    const days = deliveryDays[companyCode] || 3;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    
    return estimatedDate;
  }

  /**
   * 生成模拟物流轨迹
   */
  generateMockTraces(trackingNumber, companyCode) {
    const now = new Date();
    const traces = [];

    // 根据时间生成不同的物流状态
    const hoursSinceCreated = Math.floor(Math.random() * 48); // 模拟0-48小时前创建

    if (hoursSinceCreated >= 0) {
      traces.push({
        time: new Date(now.getTime() - hoursSinceCreated * 60 * 60 * 1000),
        status: 'collected',
        description: '商品已从发货仓库揽收',
        location: '深圳市南山区'
      });
    }

    if (hoursSinceCreated >= 2) {
      traces.push({
        time: new Date(now.getTime() - (hoursSinceCreated - 2) * 60 * 60 * 1000),
        status: 'in_transit',
        description: '快件已发出',
        location: '深圳转运中心'
      });
    }

    if (hoursSinceCreated >= 12) {
      traces.push({
        time: new Date(now.getTime() - (hoursSinceCreated - 12) * 60 * 60 * 1000),
        status: 'in_transit',
        description: '快件正在运输途中',
        location: '广州转运中心'
      });
    }

    if (hoursSinceCreated >= 24) {
      traces.push({
        time: new Date(now.getTime() - (hoursSinceCreated - 24) * 60 * 60 * 1000),
        status: 'out_for_delivery',
        description: '快件已到达目的地，正在派送中',
        location: '目的地派送点'
      });
    }

    if (hoursSinceCreated >= 36) {
      traces.push({
        time: new Date(now.getTime() - (hoursSinceCreated - 36) * 60 * 60 * 1000),
        status: 'delivered',
        description: '快件已签收，签收人：本人',
        location: '目的地'
      });
    }

    // 按时间倒序排列（最新的在前面）
    return traces.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  /**
   * 获取物流状态中文描述
   */
  getStatusDescription(status) {
    return this.statusMap[status] || '未知状态';
  }

  /**
   * 检查是否已签收
   */
  isDelivered(status) {
    return status === 'delivered';
  }

  /**
   * 检查是否有异常
   */
  hasException(status) {
    return status === 'exception' || status === 'returned';
  }
}

module.exports = new LogisticsService();
