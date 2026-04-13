// 默认服务信息（门店、电话）
const DEFAULT_SERVICE = {
  address: '山东省泰安市东平县稻香街111号',
  latitude: 35.92115304081332,
  longitude: 116.46491899194064,
  phone: '18605482818'
}

// 本地产品数据
const products = [
  {
    id: 1,
    name: '百灵经典款',
    category: '篷车',
    desc: '续航80公里，适合日常通勤',
    price: 3200,
    priceText: '3,200',
    tag: '热销',
    images: ['/images/banner-h2zm.jpg'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' },
      { name: '天空蓝', value: '#4A90D9' }
    ],
    specs: [
      { label: '续航里程', value: '80公里' },
      { label: '最高时速', value: '45km/h' },
      { label: '电池容量', value: '60V20Ah' },
      { label: '载重', value: '150kg' }
    ],
    features: ['智能防盗', 'LED大灯', 'USB充电', '前后碟刹']
  },
  {
    id: 2,
    name: '考拉豪华款',
    category: '篷车',
    desc: '续航100公里，大屏显示',
    price: 4500,
    priceText: '4,500',
    tag: '新品',
    images: ['/images/banner-zdla.png'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' },
      { name: '极光紫', value: '#8B5CF6' }
    ],
    specs: [
      { label: '续航里程', value: '100公里' },
      { label: '最高时速', value: '50km/h' },
      { label: '电池容量', value: '72V20Ah' },
      { label: '载重', value: '200kg' }
    ],
    features: ['智能防盗', 'LED大灯', 'USB充电', '前后碟刹', '大屏仪表']
  },
  {
    id: 3,
    name: '卡皮巴拉旗舰款',
    category: '篷车',
    desc: '续航120公里，智能防盗',
    price: 6000,
    priceText: '6,000',
    tag: '推荐',
    images: ['/images/banner-png.jpg'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' },
      { name: '墨玉绿', value: '#1A6B3C' }
    ],
    specs: [
      { label: '续航里程', value: '120公里' },
      { label: '最高时速', value: '55km/h' },
      { label: '电池容量', value: '72V32Ah' },
      { label: '载重', value: '250kg' }
    ],
    features: ['智能防盗', 'LED大灯', 'USB充电', '前后碟刹', 'GPS定位', '手机APP']
  },
  {
    id: 4,
    name: '雨燕经济款',
    category: '篷车',
    desc: '续航60公里，性价比高',
    price: 2800,
    priceText: '2,800',
    tag: '实惠',
    images: ['/images/banner-ctrt.jpg'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' }
    ],
    specs: [
      { label: '续航里程', value: '60公里' },
      { label: '最高时速', value: '40km/h' },
      { label: '电池容量', value: '48V12Ah' },
      { label: '载重', value: '120kg' }
    ],
    features: ['智能防盗', 'LED大灯', 'USB充电']
  },
  {
    id: 5,
    name: '金鹏三轮车',
    category: '三轮车',
    desc: '货运载重王，超大空间',
    price: 5500,
    priceText: '5,500',
    tag: '推荐',
    images: ['/images/banner-h2zm.png'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '工程灰', value: '#6B7280' }
    ],
    specs: [
      { label: '续航里程', value: '80公里' },
      { label: '最高时速', value: '35km/h' },
      { label: '电池容量', value: '60V45Ah' },
      { label: '载重', value: '500kg' }
    ],
    features: ['加厚货箱', '液压减震', '前后碟刹', '倒车雷达']
  },
  {
    id: 6,
    name: '小羚羊两轮车',
    category: '两轮车',
    desc: '轻便灵活，城市代步首选',
    price: 1800,
    priceText: '1,800',
    tag: '实惠',
    images: ['/images/banner-zdla.png'],
    colors: [
      { name: '中国红', value: '#C0362C' },
      { name: '典雅黑', value: '#2C2C2C' },
      { name: '珍珠白', value: '#F0EEE8' },
      { name: '柠檬黄', value: '#F5C518' }
    ],
    specs: [
      { label: '续航里程', value: '50公里' },
      { label: '最高时速', value: '25km/h' },
      { label: '电池容量', value: '48V12Ah' },
      { label: '载重', value: '100kg' }
    ],
    features: ['轻便车架', 'LED大灯', '前筐置物']
  }
].map(p => ({ ...p, service: DEFAULT_SERVICE }))

// 获取所有产品
function getProducts() {
  return products
}

// 根据分类获取产品
function getProductsByCategory(category) {
  if (!category || category === '全部') {
    return products
  }
  return products.filter(p => p.category === category)
}

// 根据ID获取产品
function getProductById(id) {
  return products.find(p => p.id === parseInt(id))
}

module.exports = {
  products,
  getProducts,
  getProductsByCategory,
  getProductById,
  DEFAULT_SERVICE
}
