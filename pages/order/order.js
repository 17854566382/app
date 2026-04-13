// pages/order/order.js
Page({
  data: {
    orders: [],
    loading: false,
    isLogin: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const token = wx.getStorageSync('token')
    const isLogin = !!token
    this.setData({ isLogin })
    if (isLogin) {
      this.loadOrders()
    }
  },

  goToLogin() {
    wx.switchTab({ url: '/pages/user/user' })
  },

  loadOrders() {
    const app = getApp()
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({ loading: false })
      return
    }
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/orders',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            orders: res.data.data,
            loading: false
          })
        }
      },
      fail: () => {
        this.setData({ loading: false })
      }
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail?id=${id}`
    })
  },

  cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: getApp().globalData.apiBaseUrl + '/api/orders/' + id + '/cancel',
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (result) => {
              if (result.data.success) {
                wx.showToast({ title: '取消成功' })
                this.loadOrders()
              }
            }
          })
        }
      }
    })
  },

  payOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.request({
      url: getApp().globalData.apiBaseUrl + '/api/orders/' + id + '/pay',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          wx.requestPayment({
            ...res.data.data.paymentParams,
            success: () => {
              wx.showToast({ title: '支付成功' })
              this.loadOrders()
            },
            fail: () => {
              wx.showToast({ title: '支付取消', icon: 'none' })
            }
          })
        }
      }
    })
  },

  contactService() {
    wx.makePhoneCall({
      phoneNumber: getApp().globalData.servicePhone
    })
  },

  confirmReceive(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: getApp().globalData.apiBaseUrl + '/api/orders/' + id + '/receive',
            method: 'POST',
            header: {
              'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (result) => {
              if (result.data.success) {
                wx.showToast({ title: '确认成功' })
                this.loadOrders()
              }
            }
          })
        }
      }
    })
  },

  goToCategory() {
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  onPullDownRefresh() {
    this.loadOrders()
    wx.stopPullDownRefresh()
  }
})
