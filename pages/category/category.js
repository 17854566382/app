// pages/category/category.js
const { getProducts, getProductsByCategory } = require('../../utils/products')

Page({
  data: {
    categories: [
      { id: 0, name: '全部', icon: '🏠' },
      { id: 1, name: '篷车', icon: '🛵' },
      { id: 2, name: '三轮车', icon: '🚗' },
      { id: 3, name: '两轮车', icon: '🏍️' },
      { id: 4, name: '配件', icon: '🔧' }
    ],
    currentCategory: 'all',
    products: [],
    loading: false
  },

  onLoad() {
    this.loadProducts()
  },

  loadProducts() {
    // 使用本地数据
    const products = getProducts()
    this.setData({
      products: products,
      loading: false
    })
  },

  selectCategory(e) {
    const index = e.currentTarget.dataset.index
    const categoryName = this.data.categories[index].name
    
    this.setData({ currentCategory: index })
    
    // 根据分类筛选商品（本地数据）
    const products = getProductsByCategory(categoryName)
    this.setData({ products })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  },

  callService() {
    wx.makePhoneCall({
      phoneNumber: '18605482818'
    })
  },

  onSearch(e) {
    const keyword = e.detail.value.trim()
    if (!keyword) {
      this.loadProducts()
      return
    }
    const app = getApp()
    wx.request({
      url: app.globalData.apiBaseUrl + '/mp/products?keyword=' + encodeURIComponent(keyword),
      success: (res) => {
        if (res.data.success) {
          const apiBase = 'http://81.70.40.152:3002'
          this.setData({
            products: res.data.data.map(p => ({
              ...p,
              image: apiBase + p.images[0]
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
