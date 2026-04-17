import request from '@/utils/request'

// 获取仪表盘数据
export const getDashboard = () => {
  return request.get('/dashboard')
}

// 获取资产分布
export const getAssetDistribution = () => {
  return request.get('/dashboard/asset-distribution')
}
