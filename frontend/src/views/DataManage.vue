<template>
  <div class="data-manage-page">
    <!-- 数据导入导出 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Download /></el-icon>
            数据导入导出
          </span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="export-section">
            <h4>导出数据</h4>
            <p class="desc">将您的数据导出为CSV格式文件，方便备份和分析</p>
            
            <div class="export-items">
              <div class="export-item">
                <div class="export-info">
                  <el-icon><List /></el-icon>
                  <span>账单记录</span>
                </div>
                <el-button type="primary" size="small" @click="exportBillsData">
                  <el-icon><Download /></el-icon>导出
                </el-button>
              </div>
              
              <div class="export-item">
                <div class="export-info">
                  <el-icon><Wallet /></el-icon>
                  <span>账户信息</span>
                </div>
                <el-button type="primary" size="small" @click="exportAccountsData">
                  <el-icon><Download /></el-icon>导出
                </el-button>
              </div>
              
              <div class="export-item">
                <div class="export-info">
                  <el-icon><Grid /></el-icon>
                  <span>分类信息</span>
                </div>
                <el-button type="primary" size="small" @click="exportCategoriesData">
                  <el-icon><Download /></el-icon>导出
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <div class="import-section">
            <h4>导入数据</h4>
            <p class="desc">从备份文件恢复数据（JSON格式）</p>
            
            <el-upload
              class="upload-area"
              drag
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".json"
            >
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  请上传JSON格式的备份文件
                </div>
              </template>
            </el-upload>
            
            <el-button
              v-if="selectedFile"
              type="warning"
              style="margin-top: 15px; width: 100%"
              :loading="restoring"
              @click="handleRestore"
            >
              <el-icon><RefreshLeft /></el-icon>
              恢复数据（{{ selectedFile.name }}）
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 数据备份恢复 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Collection /></el-icon>
            数据备份
          </span>
          <el-button type="primary" @click="handleCreateBackup">
            <el-icon><Plus /></el-icon>创建备份
          </el-button>
        </div>
      </template>
      
      <div v-if="backupLogs.length === 0" class="empty-data">
        <el-empty description="暂无备份记录" />
      </div>
      
      <el-table v-else :data="backupLogs" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column label="文件名" prop="file_name" min-width="200" />
        <el-table-column label="数据条数" width="100">
          <template #default="{ row }">
            {{ row.data_count }} 条
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column label="备份类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.backup_type === 'auto' ? 'success' : 'primary'" size="small">
              {{ row.backup_type === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150" />
        <el-table-column label="备份时间" width="150">
          <template #default="{ row }">
            {{ formatDateTime(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDeleteBackup(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 币种设置 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Money /></el-icon>
            币种设置
          </span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <div class="currency-section">
            <h4>支持币种</h4>
            <el-table :data="currencyList" stripe size="small">
              <el-table-column label="币种代码" prop="code" width="100" />
              <el-table-column label="币种名称" prop="name" />
            </el-table>
          </div>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <div class="exchange-section">
            <h4>汇率查询</h4>
            <el-form inline>
              <el-form-item label="金额">
                <el-input-number v-model="exchangeForm.amount" :min="1" :precision="2" />
              </el-form-item>
              <el-form-item label="从">
                <el-select v-model="exchangeForm.from" style="width: 100px">
                  <el-option
                    v-for="c in currencyList"
                    :key="c.code"
                    :label="c.code"
                    :value="c.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="到">
                <el-select v-model="exchangeForm.to" style="width: 100px">
                  <el-option
                    v-for="c in currencyList"
                    :key="c.code"
                    :label="c.code"
                    :value="c.code"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleConvert">转换</el-button>
              </el-form-item>
            </el-form>
            
            <div v-if="exchangeResult" class="exchange-result">
              <div class="result-amount">
                {{ exchangeForm.amount }} {{ exchangeForm.from }}
                <el-icon><Right /></el-icon>
                <span class="converted">{{ formatAmount(exchangeResult.converted_amount) }} {{ exchangeResult.target_currency }}</span>
              </div>
              <div class="result-rate">
                汇率: 1 {{ exchangeForm.from }} = {{ formatAmount(exchangeResult.rate) }} {{ exchangeForm.to }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  exportBills,
  exportAccounts,
  exportCategories
} from '@/api/export'
import {
  createBackup,
  getBackupLogs,
  restoreData,
  deleteBackupLog
} from '@/api/backup'
import {
  getCurrencyList,
  convertCurrency
} from '@/api/currency'
import { formatAmount, formatDateTime } from '@/utils/format'

// 备份记录
const backupLogs = ref([])
const selectedFile = ref(null)
const restoring = ref(false)

// 币种
const currencyList = ref([])
const exchangeForm = reactive({
  amount: 100,
  from: 'CNY',
  to: 'USD'
})
const exchangeResult = ref(null)

// 获取备份记录
const fetchBackupLogs = async () => {
  try {
    const res = await getBackupLogs()
    if (res.code === 200) {
      backupLogs.value = res.data.list
    }
  } catch (error) {
    console.error('获取备份记录失败', error)
  }
}

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList()
    if (res.code === 200) {
      currencyList.value = res.data.list
    }
  } catch (error) {
    console.error('获取币种列表失败', error)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 下载文件
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// 导出账单
const exportBillsData = async () => {
  try {
    const blob = await exportBills()
    downloadFile(blob, `bills_${new Date().getTime()}.csv`)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 导出账户
const exportAccountsData = async () => {
  try {
    const blob = await exportAccounts()
    downloadFile(blob, `accounts_${new Date().getTime()}.csv`)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 导出分类
const exportCategoriesData = async () => {
  try {
    const blob = await exportCategories()
    downloadFile(blob, `categories_${new Date().getTime()}.csv`)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 创建备份
const handleCreateBackup = async () => {
  try {
    const blob = await createBackup({ remark: '手动备份' })
    downloadFile(blob, `backup_${new Date().getTime()}.json`)
    ElMessage.success('备份创建成功')
    fetchBackupLogs()
  } catch (error) {
    ElMessage.error('备份创建失败')
  }
}

// 文件选择
const handleFileChange = (file) => {
  if (file.raw.type !== 'application/json' && !file.name.endsWith('.json')) {
    ElMessage.error('请选择JSON格式的备份文件')
    return
  }
  selectedFile.value = file.raw
}

// 恢复数据
const handleRestore = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择备份文件')
    return
  }
  
  ElMessageBox.confirm(
    '恢复数据将覆盖现有数据，请确保已备份当前数据。确定要继续吗？',
    '警告',
    {
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    restoring.value = true
    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      
      const res = await restoreData(formData)
      if (res.code === 200) {
        ElMessage.success('数据恢复成功')
        selectedFile.value = null
        fetchBackupLogs()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '恢复失败')
    } finally {
      restoring.value = false
    }
  })
}

// 删除备份记录
const handleDeleteBackup = (row) => {
  ElMessageBox.confirm('确定要删除这条备份记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBackupLog(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchBackupLogs()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 汇率转换
const handleConvert = async () => {
  try {
    const res = await convertCurrency({
      amount: exchangeForm.amount,
      from: exchangeForm.from,
      to: exchangeForm.to
    })
    if (res.code === 200) {
      exchangeResult.value = res.data
    }
  } catch (error) {
    ElMessage.error('汇率转换失败')
  }
}

onMounted(() => {
  fetchBackupLogs()
  fetchCurrencyList()
})
</script>

<style scoped lang="scss">
.data-manage-page {
  .section {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .export-section,
  .import-section {
    h4 {
      margin-bottom: 10px;
      color: #303133;
    }
    
    .desc {
      font-size: 13px;
      color: #909399;
      margin-bottom: 15px;
    }
  }
  
  .export-items {
    .export-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 10px;
      
      .export-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .el-icon {
          font-size: 20px;
          color: #409EFF;
        }
      }
    }
  }
  
  .upload-area {
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 150px;
    }
    
    .upload-icon {
      font-size: 48px;
      color: #409EFF;
      margin-bottom: 10px;
    }
  }
  
  .currency-section,
  .exchange-section {
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
  
  .exchange-result {
    margin-top: 20px;
    padding: 20px;
    background: #f0f9eb;
    border-radius: 8px;
    text-align: center;
    
    .result-amount {
      font-size: 18px;
      color: #606266;
      margin-bottom: 10px;
      
      .el-icon {
        margin: 0 10px;
        vertical-align: middle;
      }
      
      .converted {
        font-size: 24px;
        font-weight: 600;
        color: #67c23a;
      }
    }
    
    .result-rate {
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
