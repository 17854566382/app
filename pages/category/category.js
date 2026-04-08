// pages/category/category.js
const app = getApp()

Page({
  data: {
    categories: [
      { id: 0, name: '全部', icon: '' },
      { id: 1, name: '篷车', icon: '' },
      { id: 2, name: '三轮车', icon: '' },
      { id: 3, name: '两轮车', icon: '' }
    ],
    currentCategory: 'all',
    products: [],
    loading: false,
    error: null
  },

  onLoad() {
    this.loadProducts()
  },

  loadProducts(category) {
    const that = this
    const cat = category !== undefined ? category : this.data.currentCategory
    this.setData({ loading: true, error: null })

    const url = cat === 'all' || cat === 0
      ? app.globalData.apiBaseUrl + '/api/products'
      : app.globalData.apiBaseUrl + '/api/products/category/' + encodeURIComponent(cat)

    wx.request({
      url: url,
      method: 'GET',
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 0) {
          that.setData({
            products: res.data.data.map(p => ({
              id: p.id,
              name: p.name,
              desc: p.description,
              price: p.priceText || p.price,
              tag: p.tag,
              image: p.images[0] || '/images/banner-h2zm.png'
            })),
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
    // '全部' -> 'all'
    const cat = index === 0 ? 'all' : catName
    this.setData({ currentCategory: index })
    this.loadProducts(cat)
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '18605482818' })
  },

  onSearch(e) {
    const keyword = (e.detail && e.detail.value) ? e.detail.value.trim() : ''
    if (!keyword) {
      this.loadProducts()
      return
    }
    // Use /api/products and filter locally (no search endpoint yet)
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const filtered = res.data.data.filter(p =>
            p.name.includes(keyword) || p.description.includes(keyword)
          )
          this.setData({
            products: filtered.map(p => ({
              id: p.id,
              name: p.name,
              desc: p.description,
              price: p.priceText || p.price,
              tag: p.tag,
              image: p.images[0] || '/images/banner-h2zm.png'
            }))
          })
        }
      }
    })
  },

  onRefresh() {
    this.loadProducts()
    wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 })
    wx.stopPullDownRefresh()
  }
})
