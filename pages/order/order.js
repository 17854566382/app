// pages/order/order.js — 我的预约
const app = getApp()

Page({
  data: {
    currentTab: 'testdrive', // testdrive | maintenance
    testdriveList: [],
    maintenanceList: [],
    loading: false,
    isLogin: false,
    hasPhone: false,
    userInfo: null
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    const phone = userInfo && userInfo.phone ? userInfo.phone : ''
    this.setData({ 
      userInfo: userInfo || null, 
      isLogin: !!userInfo,
      hasPhone: !!phone
    })
    if (phone) {
      this.loadList()
    }
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
  },

  // 获取当前用户手机号
  getPhone() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo')
    return userInfo && userInfo.phone ? userInfo.phone : ''
  },

  // 加载列表
  loadList() {
    const phone = this.getPhone()
    if (!phone) return
    this.setData({ loading: true })

    // 同时加载试驾和保养预约
    let loaded = 0
    const checkDone = () => {
      loaded++
      if (loaded >= 2) {
        this.setData({ loading: false })
      }
    }

    // 加载试驾预约
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/test-drives?phone=' + encodeURIComponent(phone),
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const list = res.data.data || []
          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          this.setData({ testdriveList: list })
        }
        checkDone()
      },
      fail: () => { checkDone() }
    })

    // 加载保养预约
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/maintenance?phone=' + encodeURIComponent(phone),
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const list = res.data.data || []
          list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          this.setData({ maintenanceList: list })
        }
        checkDone()
      },
      fail: () => { checkDone() }
    })
  },

  // 取消试驾预约
  cancelTestdrive(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确定要取消该试驾预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: app.globalData.apiBaseUrl + '/api/test-drives/' + id + '/cancel',
            method: 'POST',
            success: (res2) => {
              if (res2.data && res2.data.code === 0) {
                wx.showToast({ title: '已取消', icon: 'success' })
                this.loadList()
              } else {
                wx.showToast({ title: res2.data.message || '取消失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 取消保养预约
  cancelMaintenance(e) {
    const id = e.currentTarget.dataset.id

    wx.showModal({
      title: '提示',
      content: '确定要取消该保养预约吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: app.globalData.apiBaseUrl + '/api/maintenance/' + id + '/cancel',
            method: 'POST',
            success: (res2) => {
              if (res2.data && res2.data.code === 0) {
                wx.showToast({ title: '已取消', icon: 'success' })
                this.loadList()
              } else {
                wx.showToast({ title: res2.data.message || '取消失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        }
      }
    })
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  },

  // 跳转预约页
  goTestdrive() {
    wx.navigateTo({ url: '/pages/testdrive/testdrive' })
  },

  goMaintenance() {
    wx.navigateTo({ url: '/pages/maintenance/maintenance' })
  },

  // 去登录
  goLogin() {
    wx.switchTab({ url: '/pages/user/user' })
  },

  // 试驾状态文字
  getTestdriveStatusText(status) {
    const map = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return map[status] || status
  },

  // 保养状态文字
  getMaintenanceStatusText(status) {
    const map = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return map[status] || status
  },

  // 服务类型文字
  getServiceText(type) {
    const map = {
      '洗车': '洗车',
      '换齿轮油': '换齿轮油',
      '换雨刷器': '换雨刷器',
      'car_wash': '洗车',
      'gear_oil': '换齿轮油',
      'wiper': '换雨刷器'
    }
    return map[type] || type
  },

  onPullDownRefresh() {
    this.loadList()
    wx.stopPullDownRefresh()
  }
})
