// pages/user/user.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    memberInfo: {
      level: '黄金会员',
      balance: 500,
      points: 1200,
      coupons: 3
    },
    isLogin: false,
    loading: false,
    version: '',
    isAdmin: false
  },

  onLoad() {
    this.setData({ 
      version: app.globalData.version,
      isAdmin: this.checkAdmin()
    })
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo || null,
      isLogin: !!userInfo
    })
  },

  // 微信登录
  handleLogin() {
    this.setData({ loading: true })
    
    app.wxLogin()
      .then((userInfo) => {
        this.setData({ 
          userInfo, 
          isLogin: true, 
          loading: false 
        })
        wx.showToast({ title: '登录成功', icon: 'success' })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      })
  },

  // 获取手机号（用户点击按钮授权）
  getPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '需要授权手机号', icon: 'none' })
      return
    }

    // 先确保已登录
    if (!app.isLoggedIn()) {
      // 先进行微信登录
      app.wxLogin()
        .then(() => {
          // 登录成功后再绑定手机号
          return app.getPhoneNumber(e.detail.code)
        })
        .then((userInfo) => {
          this.setData({ userInfo })
          wx.showToast({ title: '绑定成功', icon: 'success' })
        })
        .catch((err) => {
          wx.showToast({ title: err.message || '绑定失败', icon: 'none' })
        })
    } else {
      // 已登录，直接绑定手机号
      app.getPhoneNumber(e.detail.code)
        .then((userInfo) => {
          this.setData({ userInfo })
          wx.showToast({ title: '绑定成功', icon: 'success' })
        })
        .catch((err) => {
          wx.showToast({ title: err.message || '绑定失败', icon: 'none' })
        })
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          this.setData({ 
            userInfo: null, 
            isLogin: false 
          })
          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/order/order'
    })
  },

  goToMemberCard() {
    wx.showToast({ title: '会员卡功能开发中', icon: 'none' })
  },

  callPhone() {
    wx.makePhoneCall({
      phoneNumber: app.globalData.servicePhone
    })
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
  },

  goToAbout() {
    wx.showToast({ title: '关于我们', icon: 'none' })
  },

  checkAdmin() {
    // 简单判断：已登录且手机号匹配管理员
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    const adminPhones = ['18605482818'] // 管理员手机号列表
    return userInfo && userInfo.phone && adminPhones.includes(userInfo.phone)
  },

  goToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  onShareAppMessage() {
    return {
      title: '海宝新能源篷车',
      path: '/pages/index/index'
    }
  }
})
