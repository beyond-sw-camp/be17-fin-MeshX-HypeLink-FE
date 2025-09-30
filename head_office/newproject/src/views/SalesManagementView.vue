<template>
  <div>
    <!-- 내 매장 매출 (점주) 또는 전체 매출 (관리자) -->
    <SalesChart :chartOptions="mainChart.options" :series="mainChart.series" />

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import SalesChart from './sales-management/SalesChart.vue';
import BaseCard from '@/components/BaseCard.vue';

const authStore = useAuthStore();

// --- Mock Data ---
const salesData = {
  'HypeLink 강남점': { series: [{ name: '매출', data: [45, 52, 38, 45, 19, 23, 2] }] },
  'HypeLink 홍대점': { series: [{ name: '매출', data: [87, 57, 74, 99, 75, 38, 62] }] },
  'HypeLink 부산점': { series: [{ name: '매출', data: [35, 41, 62, 42, 13, 18, 29] }] },
  '전체': { series: [{ name: '총 매출', data: [167, 150, 174, 186, 127, 79, 93] }] }
};
const chartCategories = ['월', '화', '수', '목', '금', '토', '일'];
const stores = ref([
  { id: 1, name: 'HypeLink 강남점' }, { id: 2, name: 'HypeLink 홍대점' }, { id: 3, name: 'HypeLink 부산점' },
]);

// --- Component State & Logic ---
const selectedStore = ref(null);

// 역할에 따라 보여줄 메인 차트 데이터
const mainChart = computed(() => {
  let dataKey = '전체';
  if (authStore.isStoreManager) {
    dataKey = authStore.user.name;
  }
  return {
    series: salesData[dataKey].series,
    options: {
      chart: { id: 'main-sales-chart', toolbar: { show: false } },
      xaxis: { categories: chartCategories },
    }
  };
});

// 조회용 차트 데이터
const lookupChart = computed(() => {
  if (!selectedStore.value) return { series: [], options: {} };
  return {
    series: salesData[selectedStore.value].series,
    options: {
      chart: { id: 'lookup-sales-chart', toolbar: { show: false } },
      xaxis: { categories: chartCategories },
      colors: ['#6c757d']
    }
  };
});

// 조회할 수 있는 다른 매장 목록
const availableStores = computed(() => 
  stores.value.filter(store => store.name !== authStore.user?.name)
);

</script>
