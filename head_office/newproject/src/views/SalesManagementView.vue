<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
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

const stores = ref([
  { id: 1, name: 'HypeLink 강남점' }, { id: 2, name: 'HypeLink 홍대점' }, { id: 3, name: 'HypeLink 부산점' }, { id: 4, name: 'HypeLink 제주점' },
]);

const selectedStore = ref(null);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const dateRange = ref([]);
const sortKey = ref('date');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

const flatpickrConfig = {
  mode: 'range',
  dateFormat: 'Y-m-d',
  locale: Korean,
};

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    allSalesData.value = [
      { id: 1, storeName: 'HypeLink 강남점', date: '2025-09-29', amount: 1200000 },
      { id: 2, storeName: 'HypeLink 홍대점', date: '2025-09-29', amount: 850000 },
      { id: 3, storeName: 'HypeLink 강남점', date: '2025-09-28', amount: 1500000 },
      { id: 4, storeName: 'HypeLink 부산점', date: '2025-09-28', amount: 900000 },
      { id: 5, storeName: 'HypeLink 강남점', date: '2025-09-27', amount: 1100000 },
      { id: 6, storeName: 'HypeLink 홍대점', date: '2025-09-27', amount: 700000 },
      { id: 7, storeName: 'HypeLink 강남점', date: '2025-08-15', amount: 2100000 },
      { id: 8, storeName: 'HypeLink 홍대점', date: '2025-08-15', amount: 1700000 },
    ];
    isLoading.value = false;
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedSalesData = computed(() => {
  let sales = [...allSalesData.value];

  // 역할에 따른 필터링 (점주는 자신의 매장 매출만)
  if (authStore.isStoreManager) {
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

  // 날짜 범위 필터링
  if (dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    sales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(start) && saleDate <= new Date(end);
    });
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

// 차트에 필요한 가공된 매출 데이터 (임시)
const salesData = {
  '전체': {
    series: [{ name: '전체 매출', data: [1050, 1230, 1180, 1350, 1400, 1520, 1480] }]
  },
  'HypeLink 강남점': {
    series: [{ name: '강남점 매출', data: [380, 420, 400, 450, 470, 510, 490] }]
  },
  'HypeLink 홍대점': {
    series: [{ name: '홍대점 매출', data: [255, 280, 270, 300, 310, 340, 330] }]
  },
  'HypeLink 부산점': {
    series: [{ name: '부산점 매출', data: [270, 300, 290, 320, 330, 360, 350] }]
  },
   'HypeLink 제주점': {
    series: [{ name: '제주점 매출', data: [145, 130, 120, 180, 190, 210, 210] }]
  }
};

// 역할에 따라 보여줄 메인 차트 데이터
const mainChart = computed(() => {
  let dataKey = '전체';
  if (authStore.isStoreManager) {
    dataKey = authStore.user.name;
  }
  const sales = salesData[dataKey] || salesData['전체'];
  return {
    series: sales.series,
    options: {
      chart: { id: 'main-sales-chart', toolbar: { show: false } },
      xaxis: { categories: ['월', '화', '수', '목', '금', '토', '일'] },
      yaxis: { title: { text: '매출 (만원)' } }
    }
  };
});

// 조회용 차트 데이터
const lookupChart = computed(() => {
  if (!selectedStore.value) return { series: [], options: {} };
  const sales = salesData[selectedStore.value] || { series: [] };
  return {
    series: sales.series,
    options: {
      chart: { id: 'lookup-sales-chart', toolbar: { show: false } },
      xaxis: { categories: ['월', '화', '수', '목', '금', '토', '일'] },
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
          <h5 class="mb-0">{{ authStore.isStoreManager ? '내 매장 매출' : '전체 매출 현황' }}</h5>
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
    <div v-if="authStore.isStoreManager" class="mt-4">
      <BaseCard>
        <template #header><h5>타 매장 매출 조회</h5></template>
        <div class="row">
          <div class="col-md-6">
            <label for="store-lookup" class="form-label">매장 선택</label>
            <select id="store-lookup" class="form-select" v-model="selectedStore">
              <option :value="null">-- 조회할 매장 선택 --</option>
              <option v-for="store in availableStores" :key="store.id" :value="store.name">
                {{ store.name }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="selectedStore" class="mt-3">
          <hr>
          <h6>'{{ selectedStore }}' 매출 현황</h6>
          <SalesChart :chartOptions="lookupChart.options" :series="lookupChart.series" />
        </div>
      </BaseCard>
    </div>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
