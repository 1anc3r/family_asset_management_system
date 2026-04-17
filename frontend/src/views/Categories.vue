<template>
  <div class="categories-page">
    <!-- 支出分类 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Bottom /></el-icon>
            支出分类
          </span>
          <el-button type="primary" @click="handleAdd('expense')">
            <el-icon><Plus /></el-icon>添加分类
          </el-button>
        </div>
      </template>
      
      <div class="category-grid">
        <div
          v-for="category in expenseCategories"
          :key="category.id"
          class="category-item"
          :class="{ disabled: category.status === 0 }"
        >
          <div class="category-icon">
            <el-icon v-if="category.icon"><component :is="category.icon" /></el-icon>
            <el-icon v-else><Goods /></el-icon>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-actions">
            <el-switch
              v-model="category.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(category, val)"
            />
            <el-button type="primary" link @click="handleEdit(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="handleDelete(category)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <el-empty v-if="expenseCategories.length === 0" description="暂无支出分类" />
    </el-card>
    
    <!-- 收入分类 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Top /></el-icon>
            收入分类
          </span>
          <el-button type="success" @click="handleAdd('income')">
            <el-icon><Plus /></el-icon>添加分类
          </el-button>
        </div>
      </template>
      
      <div class="category-grid">
        <div
          v-for="category in incomeCategories"
          :key="category.id"
          class="category-item"
          :class="{ disabled: category.status === 0 }"
        >
          <div class="category-icon income">
            <el-icon v-if="category.icon"><component :is="category.icon" /></el-icon>
            <el-icon v-else><Money /></el-icon>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-actions">
            <el-switch
              v-model="category.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(category, val)"
            />
            <el-button type="primary" link @click="handleEdit(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link @click="handleDelete(category)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <el-empty v-if="incomeCategories.length === 0" description="暂无收入分类" />
    </el-card>
    
    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" :disabled="isEdit">
            <el-radio-button label="expense">支出</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：餐饮、工资" />
        </el-form-item>
        
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标名称（可选）" />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
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
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

// 数据
const loading = ref(false)
const categories = ref([])

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  type: 'expense',
  name: '',
  icon: '',
  sort: 0
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// 计算属性
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))
const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.list
    }
  } catch (error) {
    console.error('获取分类失败', error)
  } finally {
    loading.value = false
  }
}

// 添加分类
const handleAdd = (type) => {
  isEdit.value = false
  form.id = null
  form.type = type
  form.name = ''
  form.icon = ''
  form.sort = 0
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (category) => {
  isEdit.value = true
  form.id = category.id
  form.type = category.type
  form.name = category.name
  form.icon = category.icon || ''
  form.sort = category.sort || 0
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitting.value = true
  try {
    if (isEdit.value) {
      const res = await updateCategory(form.id, {
        name: form.name,
        icon: form.icon,
        sort: form.sort
      })
      if (res.code === 200) {
        ElMessage.success('更新成功')
      }
    } else {
      const res = await createCategory({
        name: form.name,
        type: form.type,
        icon: form.icon,
        sort: form.sort
      })
      if (res.code === 200) {
        ElMessage.success('创建成功')
      }
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 删除分类
const handleDelete = (category) => {
  ElMessageBox.confirm(`确定要删除分类「${category.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCategory(category.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategories()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '删除失败')
    }
  })
}

// 切换状态
const handleStatusChange = async (category, status) => {
  try {
    const res = await updateCategory(category.id, { status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '已启用' : '已禁用')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    category.status = status === 1 ? 0 : 1
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.categories-page {
  .section {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;
      
      &:hover {
        background: #ecf5ff;
      }
      
      &.disabled {
        opacity: 0.5;
      }
      
      .category-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #fef0f0;
        color: #f56c6c;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        
        .el-icon {
          font-size: 24px;
        }
        
        &.income {
          background: #f0f9eb;
          color: #67c23a;
        }
      }
      
      .category-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 10px;
      }
      
      .category-actions {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }
}
</style>
