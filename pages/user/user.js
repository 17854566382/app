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
      version: app.globalData.version
    })
    this.checkLogin()
  },

  onShow() {
    // 每次显示页面时重新检查登录状态和管理员身份
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo || null,
      isLogin: !!userInfo,
      isAdmin: this.checkAdmin()
    })
  },

  checkLogin() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo || null,
      isLogin: !!userInfo,
      isAdmin: this.checkAdmin()
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
          loading: false,
          isAdmin: this.checkAdmin()
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
    console.log('=== 手机号授权回调 ===')
    console.log('e.detail:', JSON.stringify(e.detail))
    
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '已取消授权', icon: 'none' })
      this.setData({ loading: false })
      return
    }

    console.log('授权码 code:', e.detail.code)
    this.setData({ loading: true })

    // 先确保已登录
    const loginPromise = app.isLoggedIn() 
      ? Promise.resolve() 
      : app.wxLogin()

    loginPromise
      .then(() => {
        console.log('登录状态确认，开始绑定手机号...')
        // 登录成功后再绑定手机号
        return app.getPhoneNumber(e.detail.code)
      })
      .then((userInfo) => {
        console.log('绑定成功，返回的 userInfo:', JSON.stringify(userInfo))
        console.log('手机号:', userInfo?.phone)
        
        this.setData({ 
          userInfo, 
          isLogin: true,
          loading: false,
          isAdmin: this.checkAdmin() 
        })
        wx.showToast({ title: '登录成功', icon: 'success' })
      })
      .catch((err) => {
        console.error('登录/绑定失败:', err)
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      })
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
            isLogin: false,
            isAdmin: false
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
    const adminPhones = ['18605482818','17854566382','18753846353'] // 管理员手机号列表
    return userInfo && userInfo.phone && adminPhones.includes(userInfo.phone)
  },

  goToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' })
  },

  goToTestDriveAdmin() {
    wx.navigateTo({ url: '/pages/admin-testdrive/admin-testdrive' })
  },

  goToMaintenanceAdmin() {
    wx.navigateTo({ url: '/pages/admin-maintenance/admin-maintenance' })
  },

  onShareAppMessage() {
    return {
      title: '海宝新能源篷车',
      path: '/pages/index/index'
    }
  }
})
