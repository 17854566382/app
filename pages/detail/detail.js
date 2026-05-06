// pages/detail/detail.js
const app = getApp()

Page({
  data: {
    product: null,
    selectedColor: null,
    currentImages: [],
    swiperCurrent: 0,
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
          const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null
          
          // 获取默认颜色的图片
          const defaultImages = that.getImagesForColor(product, defaultColor)
          
          that.setData({
            product: product,
            selectedColor: defaultColor,
            currentImages: defaultImages,
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

  // 解析图片URL：处理不同来源的图片路径
  resolveImageUrl(img) {
    if (!img) return ''
    // 完整URL（http/https开头）
    if (img.startsWith('http://') || img.startsWith('https://')) return img
    // 服务器上传的文件路径
    if (img.startsWith('/api/uploads/')) return app.globalData.apiBaseUrl + img
    // 小程序本地资源路径（如 /images/xxx.png）
    if (img.startsWith('/images/')) return img
    // 其他以/开头的路径尝试拼接API地址
    if (img.startsWith('/')) return app.globalData.apiBaseUrl + img
    // 无效路径（wxfile:// 等临时路径）返回空
    return ''
  },

  // 根据颜色获取对应的图片
  getImagesForColor(product, color) {
    let images = []
    // 优先从 colorGroups 获取该颜色的专属图片
    if (product.colorGroups && product.colorGroups.length > 0 && color) {
      const group = product.colorGroups.find(g => g.colorName === color.name)
      if (group && group.images && group.images.length > 0) {
        images = group.images
      }
    }
    // 降级到 product.images
    if (images.length === 0) {
      images = product.images || []
    }
    // 解析所有图片URL，过滤掉无效的
    return images.map(img => this.resolveImageUrl(img)).filter(img => img)
  },

  selectColor(e) {
    const index = e.currentTarget.dataset.index
    const color = this.data.product.colors[index]
    const images = this.getImagesForColor(this.data.product, color)
    
    this.setData({ 
      selectedColor: color,
      currentImages: images,
      swiperCurrent: 0 // 切换颜色时重置到第一张
    })
  },

  onSwiperChange(e) {
    this.setData({ swiperCurrent: e.detail.current })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
  },

  goToStore() {
    if (this.data.product) {
      const store = app.globalData.storeInfo
      wx.openLocation({
        latitude: store.latitude,
        longitude: store.longitude,
        name: store.name,
        address: store.address,
        scale: 18
      })
    }
  },

  // 预约试驾
  goToTestDrive() {
    const product = this.data.product
    if (!product) return
    
    wx.navigateTo({
      url: `/pages/testdrive/testdrive?id=${product.id}`
    })
  },

  onShareAppMessage() {
    const product = this.data.product
    return {
      title: product ? product.name + ' - 海宝新能源' : '海宝新能源',
      path: '/pages/index/index',
      imageUrl: this.data.currentImages[0] || '/images/banner-h2zm.jpg'
    }
  }
})
