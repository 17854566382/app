// pages/maintenance/maintenance.js - 保养预约
const app = getApp()

Page({
  data: {
    formData: {
      brand: '海宝',
      service_type: '洗车',
      user_name: '',
      user_phone: '',
      appointment_date: '',
      appointment_time: '',
      remark: ''
    },

    // 服务类型选项
    serviceTypes: [
      { value: '洗车', icon: '🚿', name: '洗车', desc: '整车清洗护理' },
      { value: '换齿轮油', icon: '⚙️', name: '换齿轮油', desc: '齿轮油更换保养' },
      { value: '换雨刷器', icon: '🌧️', name: '换雨刷器', desc: '雨刷器更换' }
    ],

    timeOptions: [
      { value: '上午 9:00-11:00', label: '上午 9:00-11:00' },
      { value: '下午 14:00-17:00', label: '下午 14:00-17:00' },
      { value: '晚上 18:00-20:00', label: '晚上 18:00-20:00' }
    ],
    timeIndex: -1,

    minDate: '',

    submitting: false,

    storeInfo: null
  },

  onLoad() {
    const today = new Date()
    this.setData({ minDate: today.toISOString().split('T')[0] })
    // 自动填充姓名和手机号
    const userInfo = wx.getStorageSync('userInfo') || {}
    if (userInfo.phone) {
      this.setData({ 'formData.user_phone': userInfo.phone })
    }
    // 门店信息
    this.setData({ storeInfo: app.globalData.storeInfo })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`formData.${field}`]: e.detail.value })
  },

  selectServiceType(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ 'formData.service_type': value })
  },

  onDateChange(e) {
    this.setData({ 'formData.appointment_date': e.detail.value })
  },

  onTimeChange(e) {
    const index = e.detail.value
    this.setData({
      timeIndex: index,
      'formData.appointment_time': this.data.timeOptions[index].value
    })
  },

  validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone)
  },

  handleSubmit() {
    const { formData } = this.data

    if (!formData.user_name.trim()) {
      return wx.showToast({ title: '请输入姓名', icon: 'none' })
    }
    if (!this.validatePhone(formData.user_phone)) {
      return wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
    }
    if (!formData.appointment_date) {
      return wx.showToast({ title: '请选择预约日期', icon: 'none' })
    }
    if (!formData.appointment_time) {
      return wx.showToast({ title: '请选择预约时间', icon: 'none' })
    }

    this.setData({ submitting: true })

    const data = {
      brand: '海宝',
      service_type: formData.service_type,
      contact_name: formData.user_name,
      contact_phone: formData.user_phone,
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      service_address: app.globalData.storeInfo.address,
      service_phone: app.globalData.servicePhone,
      remark: formData.remark
    }

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/maintenance',
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showModal({
            title: '预约成功',
            content: '我们已收到您的预约信息，门店将尽快与您联系确认。',
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

  callService() {
    wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
  },

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
