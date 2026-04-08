// pages/index/index.js
const app = getApp()

Page({
  data: {
    banners: [
      { id: 1, image: '/images/banner-h2zm.png' },
      { id: 2, image: '/images/banner-zdla.png' },
      { id: 3, image: '/images/banner-png.png' },
      { id: 4, image: '/images/banner-ctrt.png' }
    ],
    hotProducts: [],
    loading: false,
    error: null
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 每次显示页面时刷新数据
    // this.loadData()
  },

  loadData() {
    const that = this
    this.setData({ loading: true, error: null })

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products',
      method: 'GET',
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 0) {
          const products = res.data.data.slice(0, 4).map(p => ({
            id: p.id,
            name: p.name,
            desc: p.description,
            price: p.priceText || p.price,
            tag: p.tag,
            image: p.images[0] || '/images/banner-h2zm.png'
          }))
          that.setData({ hotProducts: products, loading: false })
        } else {
          that.setData({ error: '加载失败', loading: false })
        }
      },
      fail(err) {
        console.error('API request failed:', err)
        that.setData({ error: '网络错误，请检查网络', loading: false })
        wx.showToast({ title: '网络异常', icon: 'none' })
      }
    })
  },

  goToCategory() {
    wx.switchTab({ url: '/pages/category/category' })
  },

  goToOrders() {
    wx.switchTab({ url: '/pages/order/order' })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '18605482818' })
  },

  goToStore() {
    wx.openLocation({
      latitude: 35.921153,
      longitude: 116.464919,
      name: '海宝新能源',
      address: '山东省泰安市东平县稻香街111号',
      scale: 18
    })
  },

  onShareAppMessage() {
    return {
      title: '海宝新能源篷车 - 优质电动车专卖',
      path: '/pages/index/index',
      imageUrl: '/images/banner-h2zm.png'
    }
  },

  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
