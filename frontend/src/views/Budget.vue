<template>
  <div class="budget-page">
    <!-- 预算概览 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <div class="budget-summary">
            <div class="summary-label">本月预算</div>
            <div class="summary-value">¥{{ formatAmount(summary.total_budget) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <div class="budget-summary">
            <div class="summary-label">已支出</div>
            <div class="summary-value amount-expense">¥{{ formatAmount(summary.total_used) }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <div class="budget-summary">
            <div class="summary-label">剩余预算</div>
            <div class="summary-value" :class="summary.total_remaining >= 0 ? 'amount-income' : 'amount-expense'">
              ¥{{ formatAmount(summary.total_remaining) }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 总体预算进度 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">总体预算使用情况</span>
          <span class="card-subtitle">{{ currentMonth }}</span>
        </div>
      </template>
      <div class="overall-progress">
        <el-progress
          :percentage="summary.used_percent"
          :status="getProgressStatus(summary.used_percent)"
          :stroke-width="20"
          :format="(p) => `${p}%`"
        />
        <div class="progress-info">
          <span>已用 {{ summary.used_percent }}%</span>
          <span>剩余 ¥{{ formatAmount(summary.total_remaining) }}</span>
        </div>
      </div>
    </el-card>
    
    <!-- 分类预算 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Wallet /></el-icon>
            分类预算
          </span>
          <div class="header-actions">
            <el-select v-model="selectedMonth" size="small" @change="handleMonthChange">
              <el-option
                v-for="m in monthOptions"
                :key="m.value"
                :label="m.label"
                :value="m.value"
              />
            </el-select>
            <el-button type="primary" size="small" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加预算
            </el-button>
            <el-button size="small" @click="handleCopyFromLastMonth">
              <el-icon><CopyDocument /></el-icon>复制上月
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="budgetList.length === 0" class="empty-data">
        <el-empty description="暂无预算设置">
          <el-button type="primary" @click="handleAdd">添加预算</el-button>
        </el-empty>
      </div>
      
      <div v-else class="budget-list">
        <div
          v-for="budget in budgetList"
          :key="budget.id"
          class="budget-item"
          :class="{ 'is-over': budget.is_over, 'is-alert': budget.is_alert && !budget.is_over }"
        >
          <div class="budget-info">
            <div class="budget-name">
              <el-icon v-if="budget.category_icon"><component :is="budget.category_icon" /></el-icon>
              <span>{{ budget.category_name || '总预算' }}</span>
            </div>
            <div class="budget-amount">
              <span class="used">¥{{ formatAmount(budget.used_amount) }}</span>
              <span class="divider">/</span>
              <span class="total">¥{{ formatAmount(budget.amount) }}</span>
            </div>
          </div>
          
          <div class="budget-progress">
            <el-progress
              :percentage="Math.min(budget.used_percent, 100)"
              :status="getProgressStatus(budget.used_percent)"
              :stroke-width="10"
            />
            <div class="progress-text">
              <span v-if="budget.is_over" class="over-text">已超支 ¥{{ formatAmount(Math.abs(budget.remaining)) }}</span>
              <span v-else>剩余 ¥{{ formatAmount(budget.remaining) }}</span>
            </div>
          </div>
          
          <div class="budget-actions">
            <el-button type="primary" link @click="handleEdit(budget)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="handleDelete(budget)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑预算' : '添加预算'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="预算类型">
          <el-radio-group v-model="form.category_type" :disabled="isEdit">
            <el-radio-button label="total">总预算</el-radio-button>
            <el-radio-button label="category">分类预算</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="form.category_type === 'category'" label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="选择支出分类" style="width: 100%">
            <el-option
              v-for="cat in expenseCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预算金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="1"
            :precision="2"
            :step="100"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="预算月份" prop="year_month">
          <el-date-picker
            v-model="form.year_month"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="预警阈值">
          <el-slider v-model="form.alert_threshold" :max="100" show-stops :step="10" />
          <div class="threshold-text">当支出达到预算的 {{ form.alert_threshold }}% 时预警</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getBudgetList,
  getBudgetExecution,
  createBudget,
  updateBudget,
  deleteBudget,
  copyFromLastMonth
} from '@/api/budget'
import { getCategoryList } from '@/api/category'
import { formatAmount } from '@/utils/format'
import moment from 'moment'

// 数据
const loading = ref(false)
const budgetList = ref([])
const categories = ref([])
const selectedMonth = ref(moment().format('YYYY-MM'))
const summary = reactive({
  total_budget: 0,
  total_used: 0,
  total_remaining: 0,
  used_percent: 0
})

// 月份选项
const monthOptions = computed(() => {
  const options = []
  for (let i = 0; i < 12; i++) {
    const m = moment().subtract(i, 'months')
    options.push({
      value: m.format('YYYY-MM'),
      label: m.format('YYYY年MM月')
    })
  }
  return options
})

const currentMonth = computed(() => moment(selectedMonth.value).format('YYYY年MM月'))

// 支出分类
const expenseCategories = computed(() => 
  categories.value.filter(c => c.type === 'expense' && c.status === 1)
)

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  category_type: 'total',
  category_id: null,
  amount: 1000,
  year_month: moment().format('YYYY-MM'),
  alert_threshold: 80
})

const rules = {
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change', validator: (rule, value, callback) => {
      if (form.category_type === 'category' && !value) {
        callback(new Error('请选择分类'))
      } else {
        callback()
      }
    }}
  ],
  amount: [
    { required: true, message: '请输入预算金额', trigger: 'blur' }
  ],
  year_month: [
    { required: true, message: '请选择月份', trigger: 'change' }
  ]
}

// 获取预算执行数据
const fetchBudgetExecution = async () => {
  loading.value = true
  try {
    const res = await getBudgetExecution({ year_month: selectedMonth.value })
    if (res.code === 200) {
      budgetList.value = res.data.list
      Object.assign(summary, res.data.summary)
    }
  } catch (error) {
    console.error('获取预算失败', error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.list
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

// 获取进度状态
const getProgressStatus = (percent) => {
  if (percent >= 100) return 'exception'
  if (percent >= 80) return 'warning'
  return 'success'
}

// 月份切换
const handleMonthChange = () => {
  fetchBudgetExecution()
}

// 添加预算
const handleAdd = () => {
  isEdit.value = false
  form.id = null
  form.category_type = 'total'
  form.category_id = null
  form.amount = 1000
  form.year_month = selectedMonth.value
  form.alert_threshold = 80
  dialogVisible.value = true
}

// 编辑预算
const handleEdit = (budget) => {
  isEdit.value = true
  form.id = budget.id
  form.category_type = budget.category_id ? 'category' : 'total'
  form.category_id = budget.category_id
  form.amount = parseFloat(budget.amount)
  form.year_month = budget.year_month
  form.alert_threshold = budget.alert_threshold
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    const data = {
      category_id: form.category_type === 'category' ? form.category_id : null,
      amount: form.amount,
      year_month: form.year_month,
      alert_threshold: form.alert_threshold
    }
    
    if (isEdit.value) {
      const res = await updateBudget(form.id, data)
      if (res.code === 200) {
        ElMessage.success('更新成功')
      }
    } else {
      const res = await createBudget(data)
      if (res.code === 200) {
        ElMessage.success('创建成功')
      }
    }
    dialogVisible.value = false
    fetchBudgetExecution()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 删除预算
const handleDelete = (budget) => {
  ElMessageBox.confirm(`确定要删除「${budget.category_name || '总预算'}」的预算吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBudget(budget.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchBudgetExecution()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '删除失败')
    }
  })
}

// 复制上月预算
const handleCopyFromLastMonth = async () => {
  try {
    const res = await copyFromLastMonth()
    if (res.code === 200) {
      ElMessage.success(res.msg)
      fetchBudgetExecution()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '复制失败')
  }
}

onMounted(() => {
  fetchBudgetExecution()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.budget-page {
  .section {
    margin-bottom: 20px;
  }
  
  .budget-summary {
    text-align: center;
    padding: 10px;
    
    .summary-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }
    
    .summary-value {
      font-size: 28px;
      font-weight: 600;
    }
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
    
    .card-subtitle {
      font-size: 14px;
      color: #909399;
    }
    
    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .overall-progress {
    padding: 20px;
    
    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      color: #606266;
    }
  }
  
  .budget-list {
    .budget-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #ebeef5;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.is-alert {
        background: #fdf6ec;
      }
      
      &.is-over {
        background: #fef0f0;
      }
      
      .budget-info {
        width: 200px;
        
        .budget-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #303133;
          margin-bottom: 5px;
          
          .el-icon {
            color: #409EFF;
          }
        }
        
        .budget-amount {
          font-size: 13px;
          
          .used {
            color: #f56c6c;
            font-weight: 500;
          }
          
          .divider {
            margin: 0 5px;
            color: #909399;
          }
          
          .total {
            color: #606266;
          }
        }
      }
      
      .budget-progress {
        flex: 1;
        margin: 0 20px;
        
        .progress-text {
          margin-top: 5px;
          font-size: 12px;
          color: #606266;
          
          .over-text {
            color: #f56c6c;
          }
        }
      }
      
      .budget-actions {
        display: flex;
        gap: 5px;
      }
    }
  }
  
  .threshold-text {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}
</style>
