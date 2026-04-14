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
        // 统一使用 code 判断
        if (res.data && res.data.code === 0) {
          this.setData({
            orders: res.data.data || [],
            loading: false
          })
        } else {
          this.setData({ loading: false })
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
              if (result.data && result.data.code === 0) {
                wx.showToast({ title: '取消成功', icon: 'success' })
                this.loadOrders()
              } else {
                wx.showToast({ title: result.data.message || '取消失败', icon: 'none' })
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
        if (res.data && res.data.code === 0 && res.data.data && res.data.data.paymentParams) {
          wx.requestPayment({
            ...res.data.data.paymentParams,
            success: () => {
              wx.showToast({ title: '支付成功', icon: 'success' })
              this.loadOrders()
            },
            fail: () => {
              wx.showToast({ title: '支付取消', icon: 'none' })
            }
          })
        } else {
          wx.showToast({ title: res.data.message || '支付失败', icon: 'none' })
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
              if (result.data && result.data.code === 0) {
                wx.showToast({ title: '确认成功', icon: 'success' })
                this.loadOrders()
              } else {
                wx.showToast({ title: result.data.message || '确认失败', icon: 'none' })
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
