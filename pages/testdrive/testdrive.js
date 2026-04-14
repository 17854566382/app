// pages/testdrive/testdrive.js
const app = getApp()

Page({
  data: {
    product: null,
    productId: null,
    productName: '',
    productImage: '',
    
    // 表单数据
    formData: {
      user_name: '',
      user_phone: '',
      preferred_date: '',
      preferred_time: '',
      remark: ''
    },
    
    // 时间选项
    timeOptions: [
      { value: '上午 9:00-11:00', label: '上午 9:00-11:00' },
      { value: '下午 14:00-17:00', label: '下午 14:00-17:00' },
      { value: '晚上 18:00-20:00', label: '晚上 18:00-20:00' }
    ],
    timeIndex: -1,
    
    // 最小日期（今天）
    minDate: '',
    
    submitting: false,
    
    // 门店信息
    storeInfo: null
  },

  onLoad(options) {
    // 设置最小日期为今天
    const today = new Date()
    const minDate = today.toISOString().split('T')[0]
    
    // 门店信息
    const storeInfo = app.globalData.storeInfo
    
    this.setData({ minDate, storeInfo })
    
    // 从参数获取商品信息
    if (options.id) {
      this.setData({ productId: options.id })
      this.loadProduct(options.id)
    }
    if (options.name) {
      this.setData({ productName: decodeURIComponent(options.name) })
    }
    if (options.image) {
      this.setData({ productImage: decodeURIComponent(options.image) })
    }
  },

  loadProduct(id) {
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products/' + id,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const product = res.data.data
          this.setData({
            product,
            productName: product.name,
            productImage: product.images && product.images[0] ? 
              (product.images[0].startsWith('http') ? product.images[0] : app.globalData.apiBaseUrl + product.images[0]) : ''
          })
        }
      }
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.preferred_date': e.detail.value
    })
  },

  onTimeChange(e) {
    const index = e.detail.value
    this.setData({
      timeIndex: index,
      'formData.preferred_time': this.data.timeOptions[index].value
    })
  },

  // 验证手机号
  validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone)
  },

  // 提交预约
  handleSubmit() {
    const { formData, productId, productName, productImage } = this.data
    
    // 验证
    if (!formData.user_name.trim()) {
      return wx.showToast({ title: '请输入姓名', icon: 'none' })
    }
    if (!this.validatePhone(formData.user_phone)) {
      return wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
    }
    if (!formData.preferred_date) {
      return wx.showToast({ title: '请选择预约日期', icon: 'none' })
    }
    if (!formData.preferred_time) {
      return wx.showToast({ title: '请选择预约时间', icon: 'none' })
    }
    
    this.setData({ submitting: true })
    
    const data = {
      product_id: productId || null,
      product_name: productName,
      product_image: productImage,
      user_name: formData.user_name,
      user_phone: formData.user_phone,
      preferred_date: formData.preferred_date,
      preferred_time: formData.preferred_time,
      service_address: app.globalData.storeInfo.address,
      service_phone: app.globalData.servicePhone,
      remark: formData.remark
    }
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/test-drives',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showModal({
            title: '预约成功',
            content: '我们已收到您的预约信息，客服将尽快与您联系确认。',
            showCancel: false,
            success: () => {
              wx.navigateBack()
            }
          })
        } else {
          wx.showToast({ title: res.data.message || '预约失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ submitting: false })
      }
    })
  },

  // 拨打客服电话
  callService() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servicePhone
    })
  },

  // 查看门店位置
  goToStore() {
    const store = app.globalData.storeInfo
    wx.openLocation({
      latitude: store.latitude,
      longitude: store.longitude,
      name: store.name,
      address: store.address,
      scale: 18
    })
  }
})
