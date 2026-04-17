<template>
  <div class="dashboard-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">净资产</div>
            <div class="stat-value" :class="netWorth >= 0 ? 'amount-income' : 'amount-expense'">
              ¥{{ formatAmount(netWorth) }}
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总资产</div>
            <div class="stat-value amount-income">¥{{ formatAmount(totalAsset) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c;">
            <el-icon><CreditCard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总负债</div>
            <div class="stat-value amount-expense">¥{{ formatAmount(totalLiability) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">本月结余</div>
            <div class="stat-value" :class="monthBalance >= 0 ? 'amount-income' : 'amount-expense'">
              ¥{{ formatAmount(monthBalance) }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 今日收支和本月收支 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Sunrise /></el-icon>
                今日收支
              </span>
              <span class="card-date">{{ today }}</span>
            </div>
          </template>
          <div class="day-stats">
            <div class="day-stat-item">
              <div class="day-stat-label">收入</div>
              <div class="day-stat-value amount-income">+¥{{ formatAmount(todayStats.income) }}</div>
            </div>
            <el-divider direction="vertical" />
            <div class="day-stat-item">
              <div class="day-stat-label">支出</div>
              <div class="day-stat-value amount-expense">-¥{{ formatAmount(todayStats.expense) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Calendar /></el-icon>
                本月收支
              </span>
              <span class="card-date">{{ currentMonth }}</span>
            </div>
          </template>
          <div class="day-stats">
            <div class="day-stat-item">
              <div class="day-stat-label">收入</div>
              <div class="day-stat-value amount-income">+¥{{ formatAmount(monthStats.income) }}</div>
            </div>
            <el-divider direction="vertical" />
            <div class="day-stat-item">
              <div class="day-stat-label">支出</div>
              <div class="day-stat-value amount-expense">-¥{{ formatAmount(monthStats.expense) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 资产分布和近期账单 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                资产分布
              </span>
            </div>
          </template>
          <div ref="assetChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="bill-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><List /></el-icon>
                近期账单
              </span>
              <el-link type="primary" @click="$router.push('/bills')">查看全部</el-link>
            </div>
          </template>
          <div v-if="recentBills.length === 0" class="empty-data">
            <el-empty description="暂无账单记录" />
          </div>
          <div v-else class="bill-list">
            <div 
              v-for="bill in recentBills" 
              :key="bill.id" 
              class="bill-item"
              @click="viewBillDetail(bill)"
            >
              <div class="bill-icon" :class="bill.type">
                <el-icon v-if="bill.type === 'income'"><Top /></el-icon>
                <el-icon v-else-if="bill.type === 'expense'"><Bottom /></el-icon>
                <el-icon v-else><Switch /></el-icon>
              </div>
              <div class="bill-info">
                <div class="bill-title">
                  {{ bill.category_name || '未分类' }}
                  <span v-if="bill.remark" class="bill-remark">({{ bill.remark }})</span>
                </div>
                <div class="bill-meta">
                  {{ bill.account_name }} · {{ formatDateTime(bill.bill_time) }}
                </div>
              </div>
              <div class="bill-amount" :class="bill.type">
                <span v-if="bill.type === 'income'">+</span>
                <span v-else-if="bill.type === 'expense'">-</span>
                ¥{{ formatAmount(bill.amount) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 账户列表 -->
    <el-row class="section">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><WalletFilled /></el-icon>
                我的账户
              </span>
              <el-link type="primary" @click="$router.push('/accounts')">管理账户</el-link>
            </div>
          </template>
          <el-row :gutter="15">
            <el-col 
              v-for="account in accounts.slice(0, 6)" 
              :key="account.id" 
              :xs="24" 
              :sm="12" 
              :md="8" 
              :lg="6"
            >
              <div class="account-item" :class="account.type">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-balance" :class="account.type">
                  ¥{{ formatAmount(account.balance) }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getDashboard } from '@/api/dashboard'
import { formatAmount, formatDateTime } from '@/utils/format'
import moment from 'moment'

const router = useRouter()

// 数据
const loading = ref(false)
const totalAsset = ref(0)
const totalLiability = ref(0)
const todayStats = ref({ income: 0, expense: 0 })
const monthStats = ref({ income: 0, expense: 0 })
const recentBills = ref([])
const accounts = ref([])
const assetChartRef = ref(null)

// 计算属性
const netWorth = computed(() => totalAsset.value - totalLiability.value)
const monthBalance = computed(() => monthStats.value.income - monthStats.value.expense)
const today = computed(() => moment().format('YYYY年MM月DD日'))
const currentMonth = computed(() => moment().format('YYYY年MM月'))

// 初始化资产分布图表
let assetChart = null

const initAssetChart = () => {
  if (!assetChartRef.value) return
  
  const assetAccounts = accounts.value.filter(a => a.type === 'asset' && a.balance > 0)
  
  if (assetAccounts.length === 0) {
    assetChartRef.value.innerHTML = '<div class="empty-chart">暂无资产数据</div>'
    return
  }
  
  assetChart = echarts.init(assetChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '资产分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: assetAccounts.map(a => ({
          value: parseFloat(a.balance),
          name: a.name
        }))
      }
    ]
  }
  
  assetChart.setOption(option)
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await getDashboard()
    if (res.code === 200) {
      const data = res.data
      totalAsset.value = data.assets.totalAsset
      totalLiability.value = data.assets.totalLiability
      todayStats.value = data.today
      monthStats.value = data.month
      recentBills.value = data.recentBills
      accounts.value = data.accounts
      
      // 初始化图表
      nextTick(() => {
        initAssetChart()
      })
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查看账单详情
const viewBillDetail = (bill) => {
  // 可以打开详情弹窗或跳转详情页
  console.log('查看账单详情:', bill)
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  assetChart && assetChart.resize()
}

onMounted(() => {
  fetchDashboardData()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  .stat-cards {
    margin-bottom: 20px;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 10px;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      .el-icon {
        font-size: 32px;
        color: #fff;
      }
    }
    
    .stat-info {
      flex: 1;
      
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
  
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
      color: #303133;
    }
    
    .card-date {
      font-size: 14px;
      color: #909399;
    }
  }
  
  .day-stats {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px 0;
    
    .day-stat-item {
      text-align: center;
      flex: 1;
      
      .day-stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }
      
      .day-stat-value {
        font-size: 28px;
        font-weight: 600;
      }
    }
  }
  
  .chart-card {
    .chart-container {
      height: 300px;
      
      .empty-chart {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
      }
    }
  }
  
  .bill-card {
    .bill-list {
      .bill-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
          background: #f5f7fa;
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        .bill-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          
          &.income {
            background: #f0f9eb;
            color: #67c23a;
          }
          
          &.expense {
            background: #fef0f0;
            color: #f56c6c;
          }
          
          &.transfer {
            background: #f4f4f5;
            color: #909399;
          }
          
          .el-icon {
            font-size: 20px;
          }
        }
        
        .bill-info {
          flex: 1;
          
          .bill-title {
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
            
            .bill-remark {
              color: #909399;
              font-size: 12px;
            }
          }
          
          .bill-meta {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .bill-amount {
          font-size: 16px;
          font-weight: 600;
          
          &.income {
            color: #67c23a;
          }
          
          &.expense {
            color: #f56c6c;
          }
          
          &.transfer {
            color: #909399;
          }
        }
      }
    }
  }
  
  .account-item {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    
    &.asset {
      border-left: 4px solid #67c23a;
    }
    
    &.liability {
      border-left: 4px solid #f56c6c;
    }
    
    .account-name {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }
    
    .account-balance {
      font-size: 18px;
      font-weight: 600;
      
      &.asset {
        color: #67c23a;
      }
      
      &.liability {
        color: #f56c6c;
      }
    }
  }
}
</style>
