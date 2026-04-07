// pages/user/user.js
Page({
  data: {
    userInfo: null,
    memberInfo: {
      level: '黄金会员',
      balance: 500,
      points: 1200,
      coupons: 3
    },
    isLogin: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo || null,
      isLogin: !!userInfo
    })
  },

  // 获取手机号登录
  getPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '需要授权手机号', icon: 'none' })
      return
    }
    // 模拟登录成功
    const userInfo = {
      nickName: '海宝用户',
      avatarUrl: '/images/avatar-default.png',
      phone: '138****8888'
    }
    wx.setStorageSync('userInfo', userInfo)
    this.setData({ userInfo, isLogin: true })
    wx.showToast({ title: '登录成功', icon: 'success' })
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
      phoneNumber: '18605482818'
    })
  },

  goToStore() {
    wx.openLocation({
      latitude: 35.92115304081332,
      longitude: 116.46491899194064,
      name: '海宝新能源',
      address: '山东省泰安市东平县稻香街111号',
      scale: 18
    })
  },

  goToAbout() {
    wx.showToast({ title: '关于我们', icon: 'none' })
  },

  onShareAppMessage() {
    return {
      title: '海宝新能源篷车',
      path: '/pages/index/index'
    }
  }
})
