<template>
  <div class="statistics-page">
    <!-- 日期筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form inline>
        <el-form-item label="时间范围">
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="lastMonth">上月</el-radio-button>
            <el-radio-button label="quarter">本季度</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="自定义">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 收支概览 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">总收入</span>
            </div>
          </template>
          <div class="overview-value amount-income">
            +¥{{ formatAmount(totalIncome) }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">总支出</span>
            </div>
          </template>
          <div class="overview-value amount-expense">
            -¥{{ formatAmount(totalExpense) }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 支出分类统计 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                支出分类占比
              </span>
            </div>
          </template>
          <div ref="expenseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                月度收支趋势
              </span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 支出分类排行 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><List /></el-icon>
            支出分类排行
          </span>
        </div>
      </template>
      
      <el-table :data="expenseCategoryList" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column label="分类" width="150">
          <template #default="{ row }">
            <div class="category-cell">
              <el-icon v-if="row.category_icon"><component :is="row.category_icon" /></el-icon>
              <span>{{ row.category_name || '未分类' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="150">
          <template #default="{ row }">
            <span class="amount-expense">¥{{ formatAmount(row.total_amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="笔数" width="100">
          <template #default="{ row }">
            {{ row.bill_count }}笔
          </template>
        </el-table-column>
        <el-table-column label="占比">
          <template #default="{ row }">
            <el-progress
              :percentage="getPercentage(row.total_amount, totalExpense)"
              :color="'#f56c6c'"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getCategoryStats, getMonthlyTrend } from '@/api/statistics'
import { formatAmount } from '@/utils/format'
import moment from 'moment'

// 数据
const loading = ref(false)
const timeRange = ref('month')
const dateRange = ref([])
const totalIncome = ref(0)
const totalExpense = ref(0)
const expenseCategoryList = ref([])

// 图表引用
const expenseChartRef = ref(null)
const trendChartRef = ref(null)
let expenseChart = null
let trendChart = null

// 初始化支出分类图表
const initExpenseChart = () => {
  if (!expenseChartRef.value) return
  
  if (expenseCategoryList.value.length === 0) {
    expenseChartRef.value.innerHTML = '<div class="empty-chart">暂无支出数据</div>'
    return
  }
  
  expenseChart = echarts.init(expenseChartRef.value)
  
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
        name: '支出分类',
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
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: expenseCategoryList.value.map(item => ({
          value: parseFloat(item.total_amount),
          name: item.category_name || '未分类'
        }))
      }
    ]
  }
  
  expenseChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = async () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  try {
    const res = await getMonthlyTrend(6)
    if (res.code === 200) {
      const data = res.data.list
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['收入', '支出'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.month),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '收入',
            type: 'bar',
            data: data.map(item => item.income),
            itemStyle: {
              color: '#67c23a'
            }
          },
          {
            name: '支出',
            type: 'bar',
            data: data.map(item => item.expense),
            itemStyle: {
              color: '#f56c6c'
            }
          }
        ]
      }
      
      trendChart.setOption(option)
    }
  } catch (error) {
    console.error('获取趋势数据失败', error)
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {
      type: 'expense',
      start_date: dateRange.value[0],
      end_date: dateRange.value[1]
    }
    
    const res = await getCategoryStats(params)
    if (res.code === 200) {
      expenseCategoryList.value = res.data.list
      totalExpense.value = res.data.total
      
      // 同时获取收入数据
      const incomeRes = await getCategoryStats({
        type: 'income',
        start_date: dateRange.value[0],
        end_date: dateRange.value[1]
      })
      if (incomeRes.code === 200) {
        totalIncome.value = incomeRes.data.total
      }
      
      // 初始化图表
      nextTick(() => {
        initExpenseChart()
      })
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 计算百分比
const getPercentage = (amount, total) => {
  if (!total) return 0
  return Math.round((amount / total) * 100)
}

// 时间范围切换
const handleTimeRangeChange = (val) => {
  const now = moment()
  
  switch (val) {
    case 'month':
      dateRange.value = [
        now.startOf('month').format('YYYY-MM-DD'),
        now.endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'lastMonth':
      const lastMonth = now.subtract(1, 'month')
      dateRange.value = [
        lastMonth.startOf('month').format('YYYY-MM-DD'),
        lastMonth.endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'quarter':
      dateRange.value = [
        now.startOf('quarter').format('YYYY-MM-DD'),
        now.endOf('quarter').format('YYYY-MM-DD')
      ]
      break
    case 'year':
      dateRange.value = [
        now.startOf('year').format('YYYY-MM-DD'),
        now.endOf('year').format('YYYY-MM-DD')
      ]
      break
  }
  
  fetchStatistics()
}

// 自定义日期变化
const handleDateChange = () => {
  timeRange.value = ''
  fetchStatistics()
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  expenseChart && expenseChart.resize()
  trendChart && trendChart.resize()
}

onMounted(() => {
  // 默认本月
  handleTimeRangeChange('month')
  initTrendChart()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.statistics-page {
  .filter-card {
    margin-bottom: 20px;
  }
  
  .section {
    margin-bottom: 20px;
  }
  
  .overview-value {
    font-size: 36px;
    font-weight: 600;
    text-align: center;
    padding: 20px 0;
  }
  
  .chart-card {
    .chart-container {
      height: 350px;
      
      .empty-chart {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
      }
    }
  }
  
  .category-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      font-size: 18px;
      color: #409EFF;
    }
  }
}
</style>
