import request from '@/utils/request'

// 导出账单
export const exportBills = (params) => {
  return request.get('/export/bills', { 
    params,
    responseType: 'blob'
  })
}

// 导出账户
export const exportAccounts = () => {
  return request.get('/export/accounts', { 
    responseType: 'blob'
  })
}

// 导出分类
export const exportCategories = () => {
  return request.get('/export/categories', { 
    responseType: 'blob'
  })
}
