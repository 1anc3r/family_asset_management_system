import request from '@/utils/request'

// 获取账户列表
export const getAccountList = () => {
  return request.get('/account/list')
}

// 获取资产统计
export const getAccountStats = () => {
  return request.get('/account/stats')
}

// 创建账户
export const createAccount = (data) => {
  return request.post('/account/add', data)
}

// 更新账户
export const updateAccount = (id, data) => {
  return request.put(`/account/${id}`, data)
}

// 删除账户
export const deleteAccount = (id) => {
  return request.delete(`/account/${id}`)
}
