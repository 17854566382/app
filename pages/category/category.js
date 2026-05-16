// pages/category/category.js
const app = getApp()

Page({
  data: {
    categories: [
      { id: 0, name: '全部', icon: '' },
      { id: 1, name: '四轮车', icon: '' },
      { id: 2, name: '三轮车', icon: '' },
      { id: 3, name: '两轮车', icon: '' }
    ],
    currentCategory: 0,
    allProducts: [],
    products: [],
    loading: false,
    error: null
  },

  onLoad() {
    this.loadProducts()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadProducts()
  },

  loadProducts() {
    const that = this
    this.setData({ loading: true, error: null })

    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products',
      method: 'GET',
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 0) {
          const allProducts = res.data.data.map(p => {
            const img = p.images && p.images[0]
            let image = '/images/banner-h2zm.jpg'
            if (img) {
              if (img.startsWith('/api/uploads/')) {
                image = app.globalData.apiBaseUrl + img
              } else {
                image = img
              }
            }
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              desc: p.description,
              price: p.priceText || p.price,
              tag: p.tag,
              image: image
            }
          })
          that.setData({
            allProducts,
            products: allProducts,
            loading: false
          })
        } else {
          that.setData({ error: '加载失败', loading: false })
        }
      },
      fail(err) {
        console.error('API failed:', err)
        that.setData({ error: '网络错误', loading: false })
        wx.showToast({ title: '网络异常', icon: 'none' })
      }
    })
  },

  selectCategory(e) {
    const index = e.currentTarget.dataset.index
    const catName = this.data.categories[index].name

    // 本地过滤
    const filtered = index === 0
      ? this.data.allProducts
      : this.data.allProducts.filter(p => p.category === catName)

    this.setData({
      currentCategory: index,
      products: filtered
    })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: app.globalData.servicePhone })
  },

  onSearch(e) {
    const keyword = (e.detail && e.detail.value) ? e.detail.value.trim() : ''
    if (!keyword) {
      this.selectCategory({ currentTarget: { dataset: { index: this.data.currentCategory } } })
      return
    }
    const filtered = this.data.allProducts.filter(p =>
      p.name.includes(keyword) || (p.desc && p.desc.includes(keyword))
    )
    this.setData({ products: filtered })
  },

  onRefresh() {
    this.loadProducts()
    wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 })
    wx.stopPullDownRefresh()
  }
})
