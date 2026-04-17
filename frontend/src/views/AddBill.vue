<template>
  <div class="add-bill-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><CirclePlusFilled /></el-icon>
            记一笔
          </span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="bill-form"
      >
        <!-- 账单类型选择 -->
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" size="large" @change="handleTypeChange">
            <el-radio-button label="expense">
              <el-icon><Bottom /></el-icon> 支出
            </el-radio-button>
            <el-radio-button label="income">
              <el-icon><Top /></el-icon> 收入
            </el-radio-button>
            <el-radio-button label="transfer">
              <el-icon><Switch /></el-icon> 转账
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- 金额 -->
        <el-form-item label="金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0.01"
            :precision="2"
            :step="10"
            size="large"
            class="amount-input"
          />
          <div class="quick-amount">
            <el-tag
              v-for="amount in quickAmounts"
              :key="amount"
              class="quick-amount-tag"
              @click="form.amount = amount"
            >
              ¥{{ amount }}
            </el-tag>
          </div>
        </el-form-item>
        
        <!-- 账户 -->
        <el-form-item :label="form.type === 'transfer' ? '转出账户' : '账户'" prop="account_id">
          <el-select
            v-model="form.account_id"
            placeholder="选择账户"
            size="large"
            style="width: 100%"
          >
            <el-option-group label="资产账户">
              <el-option
                v-for="account in assetAccounts"
                :key="account.id"
                :label="`${account.name} (¥${formatAmount(account.balance)})`"
                :value="account.id"
              />
            </el-option-group>
            <el-option-group v-if="form.type === 'expense'" label="负债账户">
              <el-option
                v-for="account in liabilityAccounts"
                :key="account.id"
                :label="`${account.name} (¥${formatAmount(account.balance)})`"
                :value="account.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        
        <!-- 目标账户（转账时显示） -->
        <el-form-item v-if="form.type === 'transfer'" label="转入账户" prop="to_account_id">
          <el-select
            v-model="form.to_account_id"
            placeholder="选择目标账户"
            size="large"
            style="width: 100%"
          >
            <el-option-group label="资产账户">
              <el-option
                v-for="account in assetAccounts.filter(a => a.id !== form.account_id)"
                :key="account.id"
                :label="`${account.name} (¥${formatAmount(account.balance)})`"
                :value="account.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        
        <!-- 分类（非转账时显示） -->
        <el-form-item v-if="form.type !== 'transfer'" label="分类" prop="category_id">
          <div class="category-list">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: form.category_id === category.id }"
              @click="form.category_id = category.id"
            >
              <el-icon v-if="category.icon"><component :is="category.icon" /></el-icon>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </el-form-item>
        
        <!-- 日期 -->
        <el-form-item label="日期" prop="bill_time">
          <el-date-picker
            v-model="form.bill_time"
            type="datetime"
            placeholder="选择日期时间"
            size="large"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="添加备注（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
          >
            保存
          </el-button>
          <el-button size="large" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createBill } from '@/api/bill'
import { getAccountList } from '@/api/account'
import { getCategoryList } from '@/api/category'
import { formatAmount } from '@/utils/format'
import moment from 'moment'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

// 数据
const accounts = ref([])
const categories = ref([])

// 快捷金额
const quickAmounts = [10, 20, 50, 100, 200, 500]

// 表单
const form = reactive({
  type: 'expense',
  amount: undefined,
  account_id: null,
  to_account_id: null,
  category_id: null,
  bill_time: moment().format('YYYY-MM-DD HH:mm:ss'),
  remark: ''
})

// 验证规则
const rules = {
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
  ],
  account_id: [
    { required: true, message: '请选择账户', trigger: 'change' }
  ],
  to_account_id: [
    { required: true, message: '请选择目标账户', trigger: 'change' }
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  bill_time: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 计算属性
const assetAccounts = computed(() => accounts.value.filter(a => a.type === 'asset'))
const liabilityAccounts = computed(() => accounts.value.filter(a => a.type === 'liability'))

const filteredCategories = computed(() => {
  return categories.value.filter(c => c.type === (form.type === 'expense' ? 'expense' : 'income') && c.status === 1)
})

// 类型切换
const handleTypeChange = () => {
  form.category_id = null
  form.to_account_id = null
}

// 获取账户列表
const fetchAccounts = async () => {
  try {
    const res = await getAccountList()
    if (res.code === 200) {
      accounts.value = res.data.list
    }
  } catch (error) {
    console.error('获取账户失败', error)
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

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  // 转账不需要分类
  if (form.type !== 'transfer' && !form.category_id) {
    ElMessage.warning('请选择分类')
    return
  }
  
  // 转账需要验证账户不能相同
  if (form.type === 'transfer' && form.account_id === form.to_account_id) {
    ElMessage.warning('转出账户和转入账户不能相同')
    return
  }
  
  submitting.value = true
  try {
    const res = await createBill({
      type: form.type,
      amount: form.amount,
      account_id: form.account_id,
      to_account_id: form.to_account_id,
      category_id: form.category_id,
      bill_time: form.bill_time,
      remark: form.remark
    })
    
    if (res.code === 200) {
      ElMessage.success('记账成功')
      handleReset()
      // 可以跳转到账单列表
      // router.push('/bills')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '记账失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  form.type = 'expense'
  form.amount = undefined
  form.account_id = null
  form.to_account_id = null
  form.category_id = null
  form.bill_time = moment().format('YYYY-MM-DD HH:mm:ss')
  form.remark = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchAccounts()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.add-bill-page {
  margin: 0 auto;
  
  .bill-form {
    .amount-input {
      width: 200px;
    }
    
    .quick-amount {
      margin-top: 10px;
      
      .quick-amount-tag {
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        
        &:hover {
          background: #409EFF;
          color: #fff;
        }
      }
    }
    
    .category-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        
        .el-icon {
          font-size: 24px;
          margin-bottom: 5px;
          color: #606266;
        }
        
        span {
          font-size: 12px;
          color: #606266;
        }
        
        &:hover {
          border-color: #409EFF;
          background: #f5f7fa;
        }
        
        &.active {
          border-color: #409EFF;
          background: #ecf5ff;
          
          .el-icon,
          span {
            color: #409EFF;
          }
        }
      }
    }
  }
}
</style>
