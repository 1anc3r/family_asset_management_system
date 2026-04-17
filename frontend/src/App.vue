<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化时检查登录状态
  userStore.checkLogin()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f7fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 全局样式 */
.page-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-card {
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    margin-top: 10px;
  }
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 5px;
  }
}

.amount-income {
  color: #67c23a;
}

.amount-expense {
  color: #f56c6c;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
  
  .el-card {
    margin-bottom: 10px;
  }
}
</style>
