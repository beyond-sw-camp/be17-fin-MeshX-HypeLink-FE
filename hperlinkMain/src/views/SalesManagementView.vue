<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getDailySales, getSalesTrend } from '@/api/analytics';
import SalesChart from './sales-management/SalesChart.vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Korean } from 'flatpickr/dist/l10n/ko.js';

const authStore = useAuthStore();

const allSalesData = ref([]);
const isLoading = ref(true);
const chartData = ref({});

const stores = ref([]);
const selectedStore = ref(null);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const dateRange = ref([]);
const sortKey = ref('date');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);

const flatpickrConfig = {
  mode: 'range',
  dateFormat: 'Y-m-d',
  locale: Korean,
};

// --- 데이터 로딩 ---
const loadSalesData = async () => {
  isLoading.value = true;
  try {
    // 일별 매출 데이터 로드
    const startDate = dateRange.value[0] || null;
    const endDate = dateRange.value[1] || null;
    const storeId = selectedStore.value || null;

    const response = await getDailySales(startDate, endDate, storeId);
    allSalesData.value = response.data || [];

    // 매장 목록 추출 (중복 제거)
    const storeSet = new Map();
    allSalesData.value.forEach(sale => {
      if (!storeSet.has(sale.storeId)) {
        storeSet.set(sale.storeId, {
          id: sale.storeId,
          name: sale.storeName
        });
      }
    });
    stores.value = Array.from(storeSet.values());

  } catch (error) {
    console.error('Failed to load sales data:', error);
  } finally {
    isLoading.value = false;
  }
};

// 차트 데이터 로드
const loadChartData = async () => {
  try {
    const response = await getSalesTrend('weekly');
    const trendData = response.data || [];

    // 날짜별로 데이터 변환
    const categories = [];
    const values = [];

    trendData.forEach(item => {
      const date = new Date(item.date);
      const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      categories.push(dayName);
      values.push(item.totalRevenue / 10000); // 만원 단위
    });

    chartData.value = {
      categories: categories.length > 0 ? categories : ['월', '화', '수', '목', '금', '토', '일'],
      values: values.length > 0 ? values : [0, 0, 0, 0, 0, 0, 0]
    };

  } catch (error) {
    console.error('Failed to load chart data:', error);
    chartData.value = {
      categories: ['월', '화', '수', '목', '금', '토', '일'],
      values: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};

onMounted(async () => {
  await loadSalesData();
  await loadChartData();
});

// 날짜 범위 변경 시 데이터 다시 로드
watch(dateRange, () => {
  loadSalesData();
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedSalesData = computed(() => {
  let sales = [...allSalesData.value];

  // 역할에 따른 필터링 (점주는 자신의 매장 매출만)
  if (authStore.isBranchManager) {
    sales = sales.filter(sale => sale.storeName === authStore.user.name);
  }

  // 검색
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    sales = sales.filter(sale =>
      sale.storeName.toLowerCase().includes(term) ||
      sale.date.includes(term)
    );
  }

  // 정렬
  if (sortKey.value) {
    sales.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return sales;
});

// --- 페이지네이션 로직 ---
const paginatedSalesData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedSalesData.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedSalesData.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 조회할 수 있는 다른 매장 목록
const availableStores = computed(() =>
  stores.value.filter(store => store.name !== authStore.user?.name)
);

// 메인 차트 데이터
const mainChart = computed(() => {
  return {
    series: [{ name: '매출', data: chartData.value.values || [] }],
    options: {
      chart: { id: 'main-sales-chart', toolbar: { show: false } },
      xaxis: { categories: chartData.value.categories || [] },
      yaxis: { title: { text: '매출 (만원)' } }
    }
  };
});

// 조회용 차트 데이터
const lookupChart = computed(() => {
  if (!selectedStore.value) return { series: [], options: {} };
  // TODO: 특정 매장의 차트 데이터 로드 필요
  return {
    series: [{ name: '매출', data: chartData.value.values || [] }],
    options: {
      chart: { id: 'lookup-sales-chart', toolbar: { show: false } },
      xaxis: { categories: chartData.value.categories || [] },
      colors: ['#6c757d']
    }
  };
});
</script>

<template>
  <div>
    <!-- 내 매장 매출 (점주) 또는 전체 매출 (관리자) -->
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ authStore.isBranchManager ? '내 매장 매출' : '전체 매출 현황' }}</h5>
          <div class="d-flex align-items-center">
            <div class="me-2">
              <input type="text" class="form-control form-control-sm" placeholder="매장명 검색" v-model="searchTerm">
            </div>
            <div class="me-2" style="width: 240px;">
              <flat-pickr
                v-model="dateRange"
                :config="flatpickrConfig"
                class="form-control form-control-sm"
                placeholder="날짜 범위 선택"
              />
            </div>
          </div>
        </div>
      </template>
      <SalesChart :chartOptions="mainChart.options" :series="mainChart.series" />

      <div v-if="paginatedSalesData.length > 0" class="mt-4">
        <h6>상세 매출 데이터</h6>
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="updateSort('storeName')" class="sortable">매장명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="storeName" /></th>
              <th @click="updateSort('date')" class="sortable">날짜 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="date" /></th>
              <th @click="updateSort('amount')" class="sortable">매출액 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="amount" /></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in paginatedSalesData" :key="sale.id">
              <td>{{ sale.storeName }}</td>
              <td>{{ sale.date }}</td>
              <td>{{ sale.amount.toLocaleString() }}원</td>
            </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 매출 데이터가 없습니다." />
    </BaseCard>

    <!-- 타 매장 매출 조회 (점주 전용) -->
    <div v-if="authStore.isBranchManager" class="mt-4">
      <BaseCard>
        <template #header><h5>타 매장 매출 조회</h5></template>
        <div class="row">
          <div class="col-md-6">
            <label for="store-lookup" class="form-label">매장 선택</label>
            <select id="store-lookup" class="form-select" v-model="selectedStore">
              <option :value="null">-- 조회할 매장 선택 --</option>
              <option v-for="store in availableStores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="selectedStore" class="mt-3">
          <hr>
          <h6>선택된 매장 매출 현황</h6>
          <SalesChart :chartOptions="lookupChart.options" :series="lookupChart.series" />
        </div>
      </BaseCard>
    </div>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: #f8f9fa;
}
</style>
