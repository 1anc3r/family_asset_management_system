import request from '@/utils/request'

// 用户注册
export const register = (data) => {
  return request.post('/user/register', data)
}

// 用户登录
export const login = (data) => {
  return request.post('/user/login', data)
}

// 获取用户信息
export const getProfile = () => {
  return request.get('/user/profile')
}

// 更新用户信息
export const updateProfile = (data) => {
  return request.put('/user/profile', data)
}

// 修改密码
export const changePassword = (data) => {
  return request.put('/user/password', data)
}
