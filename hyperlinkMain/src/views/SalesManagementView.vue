<script setup>
import {onMounted, ref, watch} from 'vue'
import {getDailySalesGrouped} from '@/api/analytics'
import {useRoute} from 'vue-router'
import {usePosManagementStore} from '@/stores/store'
import {storeToRefs} from 'pinia'
import LineChart from '@/views/analytics/charts/LineChart.vue'
import {format, subDays} from 'date-fns'
import BaseSpinner from '@/components/BaseSpinner.vue'
import BaseEmptyState from '@/components/BaseEmptyState.vue'
import SortIcon from '@/components/SortIcon.vue'

const route = useRoute()
const managementStore = usePosManagementStore()
const {selectedStoreId, selectableStores} = storeToRefs(managementStore)

const salesData = ref([])
const salesChartData = ref(null)
const loading = ref(true)
const error = ref(null)
const openDate = ref(null) // 현재 열려있는 아코디언 날짜

const today = new Date()
const defaultStartDate = format(subDays(today, 6), 'yyyy-MM-dd')
const defaultEndDate = format(today, 'yyyy-MM-dd')

const filters = ref({
  startDate: defaultStartDate,
  endDate: defaultEndDate,
})

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const salesRes = await getDailySalesGrouped(filters.value.startDate, filters.value.endDate,
        selectedStoreId.value)

    if (salesRes.data) {
      salesData.value = salesRes.data
      // 기본적으로 첫 번째 날짜를 열어둠
      if (salesData.value.length > 0) {
        openDate.value = salesData.value[0].date
      } else {
        openDate.value = null
      }
    } else {
      salesData.value = []
      openDate.value = null
      console.warn('No daily grouped sales data received from API')
    }

    if (salesRes.data && salesRes.data.length > 0) {
      // 날짜 역순으로 정렬 (오래된 날짜부터 최신 날짜로)
      const reversedData = [...salesRes.data].reverse()
      salesChartData.value = {
        labels: reversedData.map(d => d.date),
        datasets: [
          {
            label: '일별 매출',
            data: reversedData.map(d => d.totalAmount),
            borderColor: '#42A5F5',
            tension: 0.4,
            fill: false,
          },
        ],
      }
    } else {
      salesChartData.value = null
    }

  } catch (err) {
    console.error('Error fetching sales data:', err)
    error.value = '데이터를 불러오는 중 오류가 발생했습니다.'
    salesData.value = []
    salesChartData.value = null
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchData()
}

const resetFilters = () => {
  filters.value.startDate = defaultStartDate
  filters.value.endDate = defaultEndDate
  selectedStoreId.value = null
  fetchData()
}

const toggleDate = (date) => {
  openDate.value = openDate.value === date ? null : date
}

onMounted(() => {
  managementStore.fetchData() // 매장 목록 로드
  const storeIdFromQuery = route.query.storeId
  if (storeIdFromQuery) {
    selectedStoreId.value = Number(storeIdFromQuery)
  }
  fetchData()
})

watch(selectedStoreId, (newStoreId, oldStoreId) => {
  if (newStoreId !== oldStoreId) {
    fetchData()
  }
})

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString()
}
</script>

<template>
  <div class="sales-management-view">
    <h1 class="main-title">일별 매출 관리</h1>

    <div class="filter-section card">
      <div class="filter-inputs">
        <div class="form-group">
          <label for="store-select">가맹점 선택</label>
          <select id="store-select" v-model="selectedStoreId" class="form-control">
            <option :value="null">전체 가맹점</option>
            <option v-for="store in selectableStores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="startDate">시작일</label>
          <input type="date" id="startDate" v-model="filters.startDate" class="form-control">
        </div>
        <div class="form-group">
          <label for="endDate">종료일</label>
          <input type="date" id="endDate" v-model="filters.endDate" class="form-control">
        </div>
      </div>
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">적용</button>
        <button @click="resetFilters" class="btn btn-secondary">초기화</button>
      </div>
    </div>

    <div class="chart-section card">
      <h2 class="chart-title">최근 7일 매출 추이 <span
          v-if="managementStore.selectedStore">- {{ managementStore.selectedStore.name }}</span></h2>
      <div v-if="loading" class="loading-spinner">
        <BaseSpinner/>
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="salesChartData">
        <LineChart :chart-data="salesChartData"/>
      </div>
      <div v-else class="no-data">
        차트 데이터를 불러올 수 없습니다.
      </div>
    </div>

    <div class="sales-data-section card">
      <h2 class="section-title">매출 데이터</h2>
      <div v-if="loading" class="loading-spinner">
        <BaseSpinner/>
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="salesData.length > 0" class="accordion">
        <div v-for="group in salesData" :key="group.date" class="accordion-item">
          <div class="accordion-header" @click="toggleDate(group.date)">
            <div class="header-content">
              <span class="date">{{ group.date }}</span>
              <span class="total-amount">총 매출: {{ formatCurrency(group.totalAmount) }}원</span>
              <span class="store-count">매장 수: {{ group.storeCount }}</span>
            </div>
            <SortIcon :is-asc="openDate === group.date" class="accordion-icon"/>
          </div>
          <div v-if="openDate === group.date" class="accordion-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                <tr>
                  <th>가맹점명</th>
                  <th>가맹점 번호</th>
                  <th class="text-end">매출액</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="store in group.stores" :key="store.storeId">
                  <td>{{ store.storeName }}</td>
                  <td>{{ store.storeNumber }}</td>
                  <td class="text-end">{{ formatCurrency(store.amount) }}원</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <BaseEmptyState message="선택한 기간에 해당하는 매출 데이터가 없습니다."/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sales-management-view {
  padding: 2rem;
  background-color: #f4f6f9;
}

.main-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-inputs {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #555;
}

.form-control {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-primary {
  background-color: #4a69bd;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3b539a;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.chart-title, .section-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.loading-spinner, .error-message, .no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: #777;
}

/* Accordion Styles */
.accordion-item {
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background-color: #f1f3f5;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  font-weight: 500;
}

.date {
  font-size: 1.1rem;
  color: #333;
}

.total-amount {
  color: #4a69bd;
}

.store-count {
  color: #6c757d;
}

.accordion-icon {
  transition: transform 0.3s ease;
}

.accordion-body {
  padding: 0;
  background-color: #fff;
}

.table-sm th, .table-sm td {
  padding: 0.5rem 1rem;
}

.text-end {
  text-align: right;
}
</style>
