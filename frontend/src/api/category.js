import request from '@/utils/request'

// 获取分类列表
export const getCategoryList = (type) => {
  return request.get('/category/list', { params: { type } })
}

// 创建分类
export const createCategory = (data) => {
  return request.post('/category/add', data)
}

// 更新分类
export const updateCategory = (id, data) => {
  return request.put(`/category/${id}`, data)
}

// 删除分类
export const deleteCategory = (id) => {
  return request.delete(`/category/${id}`)
}
