// pages/detail/detail.js
const app = getApp()

Page({
  data: {
    product: null,
    selectedColor: null,
    loading: true
  },

  onLoad(options) {
    const id = options.id
    if (id) {
      this.loadProduct(id)
    } else {
      this.setData({ loading: false })
    }
  },

  loadProduct(id) {
    const that = this
    this.setData({ loading: true })

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products/' + id,
      method: 'GET',
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 0) {
          const product = res.data.data
          that.setData({
            product: product,
            selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : null,
            loading: false
          })
        } else {
          that.setData({ loading: false })
          wx.showToast({ title: '产品不存在', icon: 'none' })
        }
      },
      fail(err) {
        console.error('API failed:', err)
        that.setData({ loading: false })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  selectColor(e) {
    const index = e.currentTarget.dataset.index
    const color = this.data.product.colors[index]
    this.setData({ selectedColor: color })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '18605482818' })
  },

  goToStore() {
    if (this.data.product && this.data.product.service) {
      const s = this.data.product.service
      wx.openLocation({
        latitude: s.latitude,
        longitude: s.longitude,
        name: s.address,
        address: s.address,
        scale: 18
      })
    }
  },

  onShareAppMessage() {
    const product = this.data.product
    return {
      title: product ? product.name + ' - 海宝新能源' : '海宝新能源',
      path: '/pages/index/index',
      imageUrl: product ? product.images[0] : ''
    }
  }
})
