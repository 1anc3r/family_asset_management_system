import request from '@/utils/request'

// 创建备份
export const createBackup = (data) => {
  return request.post('/backup/create', data, {
    responseType: 'blob'
  })
}

// 获取备份记录
export const getBackupLogs = () => {
  return request.get('/backup/logs')
}

// 恢复数据
export const restoreData = (formData) => {
  return request.post('/backup/restore', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除备份记录
export const deleteBackupLog = (id) => {
  return request.delete(`/backup/logs/${id}`)
}
