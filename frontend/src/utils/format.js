import moment from 'moment'

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export const formatAmount = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return '0.00'
  const num = parseFloat(amount)
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '-'
  return moment(date).format(format)
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期
 * @returns {string}
}
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

/**
 * 获取相对时间描述
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  if (!date) return '-'
  return moment(date).fromNow()
}

/**
 * 获取本月日期范围
 * @returns {{start: string, end: string}}
 */
export const getCurrentMonthRange = () => {
  return {
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().endOf('month').format('YYYY-MM-DD')
  }
}

/**
 * 获取今日日期
 * @returns {string}
 */
export const getToday = () => {
  return moment().format('YYYY-MM-DD')
}
