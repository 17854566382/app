// pages/admin-maintenance/admin-maintenance.js
const app = getApp()

Page({
  data: {
    appointments: [],
    filteredAppointments: [],
    loading: true,
    statusFilter: 'all',
    statusOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待确认' },
      { value: 'confirmed', label: '已确认' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ],
    selectedAppointment: null,
    showDetail: false,
    showSmsModal: false,
    smsContent: '',
    sendingSms: false,
    stats: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0
    }
  },

  onLoad() {
    this.loadAppointments()
  },

  onShow() {
    this.loadAppointments()
  },

  preventTouchMove() {
    return false
  },

  loadAppointments() {
    this.setData({ loading: true })
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/maintenance',
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          const appointments = res.data.data || []
          appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          
          const stats = {
            total: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length
          }
          
          const filteredAppointments = this.filterByStatus(appointments, this.data.statusFilter)
          
          this.setData({ 
            appointments, 
            filteredAppointments,
            stats,
            loading: false 
          })
        } else {
          this.setData({ loading: false })
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ loading: false })
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  onPullDownRefresh() {
    this.loadAppointments()
    wx.stopPullDownRefresh()
  },

  onStatusChange(e) {
    const status = e.currentTarget.dataset.status
    const filteredAppointments = this.filterByStatus(this.data.appointments, status)
    this.setData({ 
      statusFilter: status,
      filteredAppointments
    })
  },

  filterByStatus(appointments, status) {
    if (status === 'all') return appointments
    return appointments.filter(a => a.status === status)
  },

  getStatusText(status) {
    const map = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return map[status] || status
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    const appointment = this.data.appointments.find(a => a.id === id)
    if (appointment) {
      this.setData({ 
        selectedAppointment: appointment,
        showDetail: true
      })
    }
  },

  closeDetail() {
    this.setData({ showDetail: false, selectedAppointment: null })
  },

  updateStatus(e) {
    const status = e.currentTarget.dataset.status
    const appointment = this.data.selectedAppointment
    if (!appointment) return

    wx.showModal({
      title: '确认操作',
      content: `确定要将此预约标记为"${this.getStatusText(status)}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doUpdateStatus(appointment.id, status)
        }
      }
    })
  },

  doUpdateStatus(id, status) {
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/maintenance/' + id,
      method: 'PUT',
      data: { status },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({ title: '更新成功', icon: 'success' })
          this.loadAppointments()
          this.closeDetail()
        } else {
          wx.showToast({ title: res.data.message || '更新失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  },

  callService() {
    const appointment = this.data.selectedAppointment
    if (appointment && appointment.contact_phone) {
      wx.makePhoneCall({ phoneNumber: appointment.contact_phone })
    }
  },

  openSmsModal() {
    const appointment = this.data.selectedAppointment
    if (!appointment) return
    
    const defaultContent = `您好，${appointment.contact_name}！您预约的${appointment.service_type}服务（${appointment.appointment_date} ${appointment.appointment_time}）已确认，门店地址：山东省泰安市。如有疑问请致电咨询。`
    
    this.setData({
      showSmsModal: true,
      smsContent: defaultContent
    })
  },

  closeSmsModal() {
    this.setData({ showSmsModal: false, smsContent: '' })
  },

  onSmsInput(e) {
    this.setData({ smsContent: e.detail.value })
  },

  sendSms() {
    const appointment = this.data.selectedAppointment
    const { smsContent } = this.data
    
    if (!smsContent.trim()) {
      return wx.showToast({ title: '请输入短信内容', icon: 'none' })
    }
    
    this.setData({ sendingSms: true })
    
    wx.request({
      url: app.globalData.apiBaseUrl + '/api/sms/send',
      method: 'POST',
      data: {
        phone: appointment.contact_phone,
        content: smsContent,
        appointment_id: appointment.id,
        type: 'maintenance'
      },
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({ title: '发送成功', icon: 'success' })
          this.closeSmsModal()
        } else {
          wx.showToast({ title: res.data.message || '发送失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' })
      },
      complete: () => {
        this.setData({ sendingSms: false })
      }
    })
  },

  exportData() {
    const { filteredAppointments } = this.data
    if (filteredAppointments.length === 0) {
      return wx.showToast({ title: '没有数据可导出', icon: 'none' })
    }
    
    const headers = ['联系人', '手机号', '服务类型', '品牌', '预约日期', '预约时间', '状态', '提交时间', '备注']
    const rows = filteredAppointments.map(a => [
      a.contact_name,
      a.contact_phone,
      a.service_type,
      a.brand || '海宝',
      a.appointment_date,
      a.appointment_time,
      this.getStatusText(a.status),
      a.created_at || '',
      a.remark || ''
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    wx.setClipboardData({
      data: csv,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  }
})
