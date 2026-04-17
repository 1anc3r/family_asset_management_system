import request from '@/utils/request'

// 获取分类统计
export const getCategoryStats = (params) => {
  return request.get('/statistics/category', { params })
}

// 获取月度趋势
export const getMonthlyTrend = (months = 12) => {
  return request.get('/statistics/monthly', { params: { months } })
}

// 获取账户统计
export const getAccountStats = (params) => {
  return request.get('/statistics/account', { params })
}
