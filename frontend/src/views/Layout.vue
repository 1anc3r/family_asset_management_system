<template>
  <el-container class="layout-container">
    <!-- 左侧导航 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <!-- Logo -->
      <div class="logo" :class="{ 'collapsed': isCollapse }">
        <el-icon size="28">
          <WalletFilled />
        </el-icon>
        <span v-show="!isCollapse" class="logo-text">家庭资产管理系统</span>
      </div>

      <!-- 菜单 -->
      <el-menu :default-active="activeMenu" :collapse="isCollapse" :collapse-transition="false" class="sidebar-menu"
        router background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 遮罩层 -->
    <div 
      v-if="isMobile && mobileMenuVisible" 
      class="sidebar-mask"
      @click="mobileMenuVisible = false"
    ></div>
    
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  CirclePlusFilled,
  List,
  WalletFilled,
  Grid,
  TrendCharts,
  Setting,
  UserFilled,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const isMobile = ref(false)
const mobileMenuVisible = ref(false)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'HomeFilled' },
  { path: '/bill/add', title: '记一笔', icon: 'CirclePlusFilled' },
  { path: '/bills', title: '账单列表', icon: 'List' },
  { path: '/accounts', title: '资产管理', icon: 'WalletFilled' },
  { path: '/budget', title: '预算管理', icon: 'Aim' },
  { path: '/categories', title: '分类管理', icon: 'Grid' },
  { path: '/statistics', title: '统计分析', icon: 'TrendCharts' },
  { path: '/data-manage', title: '数据管理', icon: 'Setting' }
]

const activeMenu = computed(() => route.path)

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = !mobileMenuVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      })
      break
  }
}

// 响应式处理
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.layout-container {
  min-height: 100vh;
}

.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #304156;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-bottom: 1px solid #1f2d3d;
    padding: 0 15px;
    transition: all 0.3s;
  }

  .logo.collapsed {
    padding: 0;
  }

  .logo-text {
    margin-left: 12px;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }

  .collapse-btn {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfcbd9;
    cursor: pointer;
    border-bottom: 1px solid #1f2d3d;
    transition: background-color 0.3s;
  }

  .collapse-btn:hover {
    background-color: #263445;
    color: #409EFF;
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
  }

  /* 折叠时的菜单样式调整 */
  :deep(.el-menu--collapse) {
    width: 64px;
  }

  :deep(.el-menu--collapse .el-sub-menu__title span) {
    display: none;
  }

  :deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
    display: none;
  }
}

.mobile-sidebar {
  transform: translateX(-100%);
  transition: transform 0.3s;
  
  &.show {
    transform: translateX(0);
  }
}

.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 999;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 15px;
      color: #606266;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .username {
        margin: 0 8px;
        color: #606266;
      }
    }
  }
}

.main-content {
  padding: 15px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }
  
  .main-content {
    margin-left: 0 !important;
    padding: 10px;
  }
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
