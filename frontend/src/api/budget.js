import request from '@/utils/request'

// 获取预算列表
export const getBudgetList = (params) => {
  return request.get('/budget/list', { params })
}

// 获取预算执行情况
export const getBudgetExecution = (params) => {
  return request.get('/budget/execution', { params })
}

// 创建预算
export const createBudget = (data) => {
  return request.post('/budget/add', data)
}

// 更新预算
export const updateBudget = (id, data) => {
  return request.put(`/budget/${id}`, data)
}

// 删除预算
export const deleteBudget = (id) => {
  return request.delete(`/budget/${id}`)
}

// 复制上月预算
export const copyFromLastMonth = () => {
  return request.post('/budget/copy-from-last-month')
}
