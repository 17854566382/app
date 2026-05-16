// app.js
App({
  globalData: {
    userInfo: null,
    version: '1.0.0',
    // API 基础地址（HTTPS 域名）
    apiBaseUrl: 'https://dphaibao.com',
    // 备用地址（HTTP IP，备灾）
    apiBaseUrlDev: 'http://81.70.40.152:3002',
    // 客服电话
    servicePhone: '18605482818',
    // 门店信息
    storeInfo: {
      name: '海宝新能源',
      address: '山东省泰安市东平县稻香街111号',
      latitude: 35.92115304081332,
      longitude: 116.46491899194064
    }
  },

  onLaunch() {
    console.log('海宝新能源小程序启动')
    // 检查登录状态
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token && userInfo) {
      this.globalData.userInfo = userInfo
      // 验证 token 是否有效
      this.validateToken(token)
    }
  },

  // 验证 token 有效性
  validateToken(token) {
    wx.request({
      url: this.globalData.apiBaseUrl + '/api/user/validate',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          // token 有效，更新用户信息
          this.globalData.userInfo = res.data.data
        } else {
          // token 无效，清除本地存储
          this.logout()
        }
      },
      fail: () => {
        // 网络错误，保留本地登录状态
        console.log('验证 token 网络错误')
      }
    })
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      // 1. 获取微信登录凭证 code
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 2. 发送 code 到后端换取 token
            wx.request({
              url: this.globalData.apiBaseUrl + '/api/auth/wx-login',
              method: 'POST',
              data: {
                code: loginRes.code
              },
              success: (res) => {
                if (res.data && res.data.code === 0) {
                  const { token, userInfo } = res.data.data
                  // 保存 token 和用户信息
                  wx.setStorageSync('token', token)
                  wx.setStorageSync('userInfo', userInfo)
                  this.globalData.userInfo = userInfo
                  resolve(userInfo)
                } else {
                  reject(new Error(res.data.message || '登录失败'))
                }
              },
              fail: (err) => {
                console.error('登录请求失败:', err)
                reject(new Error('网络错误，请稍后重试'))
              }
            })
          } else {
            reject(new Error('获取登录凭证失败: ' + loginRes.errMsg))
          }
        },
        fail: (err) => {
          reject(new Error('微信登录失败: ' + err.errMsg))
        }
      })
    })
  },

  // 获取用户手机号（需用户授权）
  getPhoneNumber(code) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      console.log('=== app.getPhoneNumber ===')
      console.log('发送到后端的 code:', code)
      console.log('当前 token:', token)
      
      if (!token) {
        reject(new Error('请先登录'))
        return
      }
      
      wx.request({
        url: this.globalData.apiBaseUrl + '/api/auth/bind-phone',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + token
        },
        data: {
          code: code  // 微信手机号授权码
        },
        success: (res) => {
          console.log('后端返回完整数据:', JSON.stringify(res.data))
          if (res.data && res.data.code === 0) {
            const userInfo = res.data.data
            console.log('解析后的 userInfo:', JSON.stringify(userInfo))
            console.log('手机号字段:', userInfo?.phone)
            wx.setStorageSync('userInfo', userInfo)
            this.globalData.userInfo = userInfo
            resolve(userInfo)
          } else {
            console.error('后端返回错误:', res.data)
            reject(new Error(res.data.message || '绑定手机号失败'))
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          reject(new Error('网络错误'))
        }
      })
    })
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 登出
  logout() {
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!this.globalData.userInfo && !!wx.getStorageSync('token')
  }
})
