// pages/index/index.js
Page({
  data: {
    banners: [
      { id: 1, image: '/images/banner-h2zm.png' },
      { id: 2, image: '/images/banner-zdla.png' },
      { id: 3, image: '/images/banner-png.png' },
      { id: 4, image: '/images/banner-ctrt.png' }
    ],
    hotProducts: [
      { 
        id: 1, 
        name: '百灵经典款', 
        desc: '续航80公里，适合日常通勤',
        price: '3,200',
        tag: '热销',
        image: '/images/banner-h2zm.png'
      },
      { 
        id: 2, 
        name: '考拉豪华款', 
        desc: '续航100公里，大屏显示',
        price: '4,500',
        tag: '新品',
        image: '/images/banner-zdla.png'
      },
      { 
        id: 3, 
        name: '卡皮巴拉旗舰款', 
        desc: '续航120公里，智能防盗',
        price: '6,000',
        tag: '推荐',
        image: '/images/banner-png.png'
      },
      { 
        id: 4, 
        name: '雨燕经济款', 
        desc: '续航60公里，性价比高',
        price: '2,800',
        tag: '实惠',
        image: '/images/banner-ctrt.png'
      }
    ]
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    // 数据已在本地定义，无需从后端加载
  },

  goToCategory() {
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  goToOrders() {
    wx.switchTab({
      url: '/pages/order/order'
    })
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

  goToStore() {
    wx.openLocation({
      latitude:35.92115304081332,
      longitude:  116.46491899194064,
      name: '海宝新能源',
      address: '山东省泰安市东平县稻香街111号',
      scale: 18
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '海宝新能源篷车 - 优质电动车专卖',
      path: '/pages/index/index',
      imageUrl: '/images/banner-h2zm.png'
    }
  }
})
