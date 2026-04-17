import request from '@/utils/request'

// 获取账单列表
export const getBillList = (params) => {
  return request.get('/bill/list', { params })
}

// 获取账单详情
export const getBillDetail = (id) => {
  return request.get(`/bill/${id}`)
}

// 创建账单
export const createBill = (data) => {
  return request.post('/bill/add', data)
}

// 更新账单
export const updateBill = (id, data) => {
  return request.put(`/bill/${id}`, data)
}

// 删除账单
export const deleteBill = (id) => {
  return request.delete(`/bill/${id}`)
}

// 获取今日收支
export const getTodayStats = () => {
  return request.get('/bill/today')
}

// 获取本月收支
export const getMonthStats = (month) => {
  return request.get('/bill/month', { params: { month } })
}
