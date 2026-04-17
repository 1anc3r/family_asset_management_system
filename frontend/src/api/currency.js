import request from '@/utils/request'

// 获取币种列表
export const getCurrencyList = () => {
  return request.get('/currency/list')
}

// 获取所有汇率
export const getExchangeRates = () => {
  return request.get('/currency/rates')
}

// 汇率转换
export const convertCurrency = (params) => {
  return request.get('/currency/convert', { params })
}

// 获取汇率
export const getExchangeRate = (params) => {
  return request.get('/currency/rate', { params })
}
