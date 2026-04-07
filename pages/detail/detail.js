// pages/detail/detail.js
const { getProductById } = require('../../utils/products')

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
    }
  },

  loadProduct(id) {
    const product = getProductById(id)
    if (product) {
      this.setData({
        product: product,
        selectedColor: product.colors ? product.colors[0] : null,
        loading: false
      })
    } else {
      this.setData({ loading: false })
      wx.showToast({ title: '产品不存在', icon: 'none' })
    }
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
