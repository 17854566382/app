// pages/admin/admin.js
const app = getApp()

Page({
  data: {
    showCategoryPicker: false,
    categoryNames: ['篷车', '三轮车', '两轮车'],
    categories: [
      { id: 1, name: '篷车' },
      { id: 2, name: '三轮车' },
      { id: 3, name: '两轮车' }
    ],
    categoryIndex: 0,
    tagOptions: ['热销', '新品', '推荐', '实惠', ''],
    presetColors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' },
      { name: '天空蓝', value: '#4A90D9' },
      { name: '工程灰', value: '#6B7280' },
      { name: '墨玉绿', value: '#1A6B3C' },
      { name: '香槟金', value: '#D4A574' },
      { name: '深空灰', value: '#4A4A4A' },
      { name: '宝石蓝', value: '#1E40AF' },
      { name: '玫瑰金', value: '#B76E79' },
      { name: '军绿色', value: '#4A5D23' },
      { name: '橙黄色', value: '#F59E0B' }
    ],
    showColorPicker: false,
    pickingColorIndex: 0,
    formData: {
      name: '',
      category: '',
      price: '',
      description: '',
      tag: '',
      // 按颜色分组的图片
      colorGroups: [
        {
          colorName: '中国红',
          colorValue: '#C0362C',
          images: []
        }
      ],
      colors: [
        { name: '中国红', value: '#C0362C' },
        { name: '典雅黑', value: '#2C2C2C' },
        { name: '珍珠白', value: '#F0EEE8' }
      ],
      specs: [
        { label: '续航里程', value: '' },
        { label: '最高时速', value: '' },
        { label: '电池容量', value: '' }
      ],
      features: ['']
    },
    products: [],
    editingId: null,
    submitting: false
  },

  onLoad() {
    this.loadProducts()
  },

  loadProducts() {
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/products',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          // 处理图片 URL
          const products = res.data.data.map(p => {
            const img = p.images && p.images[0]
            let displayImage = '/images/banner-h2zm.jpg'
            if (img) {
              if (img.startsWith('/api/uploads/')) {
                displayImage = app.globalData.apiBaseUrl + img
              } else  {
                displayImage = img
              }
            }
            return { ...p, displayImage }
          })
          this.setData({ products })
        }
      }
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      categoryIndex: index,
      'formData.category': this.data.categories[index].name
    })
  },

  toggleCategoryPicker() {
    this.setData({ showCategoryPicker: true })
  },

  closeCategoryPicker() {
    this.setData({ showCategoryPicker: false })
  },

  onSelectCategory(e) {
    const name = e.currentTarget.dataset.name
    this.setData({
      'formData.category': name,
      showCategoryPicker: false
    })
  },

  selectTag(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({
      'formData.tag': this.data.formData.tag === tag ? '' : tag
    })
  },

  // 点击颜色色块打开颜色选择面板
  pickGroupColor(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      showColorPicker: true,
      pickingColorIndex: index
    })
  },

  closeColorPicker() {
    this.setData({ showColorPicker: false })
  },

  selectPresetColor(e) {
    const index = e.currentTarget.dataset.index
    const color = this.data.presetColors[index]
    this.setData({
      [`formData.colorGroups[${this.data.pickingColorIndex}].colorName`]: color.name,
      [`formData.colorGroups[${this.data.pickingColorIndex}].colorValue`]: color.value,
      showColorPicker: false
    })
  },

  // 添加颜色组
  addColorGroup() {
    const groups = this.data.formData.colorGroups
    this.setData({
      'formData.colorGroups': [...groups, {
        colorName: '',
        colorValue: '#000000',
        images: []
      }]
    })
  },

  onColorGroupInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({
      [`formData.colorGroups[${index}].${field}`]: e.detail.value
    })
  },

  removeColorGroup(e) {
    const index = e.currentTarget.dataset.index
    const groups = this.data.formData.colorGroups
    groups.splice(index, 1)
    this.setData({ 'formData.colorGroups': groups })
  },

  // 为颜色组选择图片
  chooseGroupImage(e) {
    const groupIndex = e.currentTarget.dataset.group
    const group = this.data.formData.colorGroups[groupIndex]
    const remaining = 6 - group.images.length

    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        const groups = this.data.formData.colorGroups
        groups[groupIndex].images = [...groups[groupIndex].images, ...newImages]
        this.setData({ 'formData.colorGroups': groups })
      }
    })
  },

  removeGroupImage(e) {
    const { group, img } = e.currentTarget.dataset
    const groups = this.data.formData.colorGroups
    groups[group].images.splice(img, 1)
    this.setData({ 'formData.colorGroups': groups })
  },

  // 旧版图片上传（保留兼容）
  chooseImage() {
    wx.chooseMedia({
      count: 5 - this.data.formData.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          'formData.images': [...this.data.formData.images, ...newImages]
        })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.formData.images
    images.splice(index, 1)
    this.setData({ 'formData.images': images })
  },

  addColor() {
    this.setData({
      'formData.colors': [...this.data.formData.colors, { name: '', value: '#000000' }]
    })
  },

  onColorInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({
      [`formData.colors[${index}].${field}`]: e.detail.value
    })
  },

  removeColor(e) {
    const index = e.currentTarget.dataset.index
    const colors = this.data.formData.colors
    colors.splice(index, 1)
    this.setData({ 'formData.colors': colors })
  },

  pickColor(e) {
    const index = e.currentTarget.dataset.index
    wx.showActionSheet({
      itemList: ['红色', '黑色', '白色', '蓝色', '灰色', '绿色'],
      success: (res) => {
        const colorMap = {
          0: { name: '中国红', value: '#C0362C' },
          1: { name: '典雅黑', value: '#2C2C2C' },
          2: { name: '珍珠白', value: '#F0EEE8' },
          3: { name: '天空蓝', value: '#4A90D9' },
          4: { name: '工程灰', value: '#6B7280' },
          5: { name: '墨玉绿', value: '#1A6B3C' }
        }
        const c = colorMap[res.tapIndex]
        this.setData({
          [`formData.colors[${index}]`]: c
        })
      }
    })
  },

  addSpec() {
    this.setData({
      'formData.specs': [...this.data.formData.specs, { label: '', value: '' }]
    })
  },

  onSpecInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({
      [`formData.specs[${index}].${field}`]: e.detail.value
    })
  },

  removeSpec(e) {
    const index = e.currentTarget.dataset.index
    const specs = this.data.formData.specs
    specs.splice(index, 1)
    this.setData({ 'formData.specs': specs })
  },

  addFeature() {
    this.setData({
      'formData.features': [...this.data.formData.features, '']
    })
  },

  onFeatureInput(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      [`formData.features[${index}]`]: e.detail.value
    })
  },

  removeFeature(e) {
    const index = e.currentTarget.dataset.index
    const features = this.data.formData.features
    features.splice(index, 1)
    this.setData({ 'formData.features': features })
  },

  handleSubmit() {
    const { formData, editingId } = this.data
    
    // 调试：打印当前数据
    console.log('formData:', JSON.stringify(formData, null, 2))
    console.log('colorGroups:', formData.colorGroups)
    
    // 验证必填项
    if (!formData.name.trim()) {
      return wx.showToast({ title: '请输入商品名称', icon: 'none' })
    }
    if (!formData.category) {
      return wx.showToast({ title: '请选择分类', icon: 'none' })
    }
    if (!formData.price) {
      return wx.showToast({ title: '请输入价格', icon: 'none' })
    }
    // 验证颜色组（只要有一个颜色名+至少一张图）
    const hasValidGroup = formData.colorGroups.some(g => g.colorName && g.images.length > 0)
    if (!hasValidGroup) {
      return wx.showToast({ title: '请添加颜色并上传图片', icon: 'none' })
    }

    this.setData({ submitting: true })

    // 上传所有颜色组的图片
    this.uploadAllImages().then(uploadedGroups => {
      // 提取颜色列表
      const colors = uploadedGroups.map(g => ({
        name: g.colorName,
        value: g.colorValue
      }))
      
      // 找到第一个有图片的颜色组作为封面
      const firstGroupWithImage = uploadedGroups.find(g => g.images && g.images.length > 0)
      const coverImage = firstGroupWithImage ? firstGroupWithImage.images[0] : ''
      
      const data = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description,
        tag: formData.tag,
        images: [coverImage], // 封面图
        colorGroups: uploadedGroups, // 按颜色分组的图片
        colors: colors,
        specs: formData.specs.filter(s => s.label && s.value),
        features: formData.features.filter(f => f),
        service_address: app.globalData.storeInfo.address,
        service_latitude: app.globalData.storeInfo.latitude,
        service_longitude: app.globalData.storeInfo.longitude,
        service_phone: app.globalData.servicePhone
      }

      const url = editingId
        ? app.globalData.apiBaseUrl + '/api/products/' + editingId
        : app.globalData.apiBaseUrl + '/api/products'

      wx.request({
        url: url,
        method: editingId ? 'PUT' : 'POST',
        data: data,
        success: (res) => {
          if (res.data && res.data.code === 0) {
            wx.showToast({ title: editingId ? '修改成功' : '添加成功', icon: 'success' })
            this.resetForm()
            this.loadProducts()
          } else {
            wx.showToast({ title: res.data.message || '操作失败', icon: 'none' })
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' })
        },
        complete: () => {
          this.setData({ submitting: false })
        }
      })
    })
  },

  // 上传所有颜色组的图片
  uploadAllImages() {
    const groups = this.data.formData.colorGroups
    return Promise.all(groups.map(async group => {
      const uploadedImages = await this.uploadImages(group.images)
      return {
        colorName: group.colorName,
        colorValue: group.colorValue,
        images: uploadedImages
      }
    }))
  },

  uploadImages(images) {
    if (!images || images.length === 0) {
      return Promise.resolve([])
    }

    const tempImages = images.filter(img => 
      img.startsWith('wxfile://') || 
      img.startsWith('http://tmp') || 
      img.startsWith('https://tmp') ||
      img.startsWith('C:\\') ||
      img.startsWith('/tmp')
    )
    const remoteImages = images.filter(img => !tempImages.includes(img))

    if (tempImages.length === 0) {
      return Promise.resolve(remoteImages)
    }

    return Promise.all(tempImages.map(img => this.uploadSingleImage(img)))
      .then(uploaded => [...remoteImages, ...uploaded.filter(u => u !== null)])
  },

  uploadSingleImage(filePath) {
    return new Promise((resolve) => {
      wx.uploadFile({
        url: app.globalData.apiBaseUrl + '/api/upload',
        filePath: filePath,
        name: 'file',
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0 && data.url) {
              resolve(data.url)
            } else {
              console.error('上传失败:', data.message || data.error)
              resolve(null)  // 上传失败返回null，不存临时路径
            }
          } catch (e) {
            console.error('解析上传响应失败:', e)
            resolve(null)
          }
        },
        fail: (err) => {
          console.error('上传请求失败:', err)
          resolve(null)  // 网络失败返回null，不存临时路径
        }
      })
    })
  },

  editProduct(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(p => p.id === id)
    if (!product) return

    // 恢复颜色组数据
    const colorGroups = product.colorGroups && product.colorGroups.length > 0
      ? product.colorGroups
      : product.colors && product.colors.length > 0
        ? product.colors.map(c => ({
            colorName: c.name,
            colorValue: c.value,
            images: product.images || []
          }))
        : [{ colorName: '默认', colorValue: '#CCCCCC', images: product.images || [] }]

    this.setData({
      editingId: id,
      formData: {
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description || '',
        tag: product.tag || '',
        colorGroups: colorGroups,
        colors: product.colors || [],
        specs: product.specs && product.specs.length ? product.specs : [],
        features: product.features && product.features.length ? product.features : ['']
      },
      categoryIndex: this.data.categories.findIndex(c => c.name === product.category)
    })
  },

  deleteProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: app.globalData.apiBaseUrl + '/api/products/' + id,
            method: 'DELETE',
            success: (res) => {
              if (res.data && res.data.code === 0) {
                wx.showToast({ title: '删除成功', icon: 'success' })
                this.loadProducts()
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' })
              }
            }
          })
        }
      }
    })
  },

  cancelEdit() {
    this.resetForm()
  },

  resetForm() {
    this.setData({
      editingId: null,
      categoryIndex: 0,
      formData: {
        name: '',
        category: '',
        price: '',
        description: '',
        tag: '',
        colorGroups: [
          {
            colorName: '中国红',
            colorValue: '#C0362C',
            images: []
          }
        ],
        colors: [
          { name: '中国红', value: '#C0362C' },
          { name: '典雅黑', value: '#2C2C2C' },
          { name: '珍珠白', value: '#F0EEE8' }
        ],
        specs: [
          { label: '续航里程', value: '' },
          { label: '最高时速', value: '' },
          { label: '电池容量', value: '' }
        ],
        features: ['']
      }
    })
  }
})
