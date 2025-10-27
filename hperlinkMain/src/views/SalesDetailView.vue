<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import {
  getSalesOverview,
  getSalesTrend,
  getTopStores,
  getCategoryPerformance,
  getSalesHeatmap
} from '@/api/analytics';

const isLoading = ref(true);
const selectedPeriod = ref('weekly');
const selectedView = ref('daily');

const periods = [
  { value: 'daily', label: '오늘' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'custom', label: '커스텀' }
];

// 필터
const filters = ref({
  startDate: '',
  endDate: '',
  storeIds: [],
  categories: []
});

// 비교 데이터
const comparisonData = ref({
  lastMonthRevenue: 0,
  lastYearRevenue: 0,
  monthOverMonthGrowth: 0,
  yearOverYearGrowth: 0
});

// API에서 가져올 데이터
const salesKPIs = ref({
  totalRevenue: { value: 0, change: 0, label: '총 매출액' },
  netRevenue: { value: 0, change: 0, label: '순 매출액' },
  totalTransactions: { value: 0, change: 0, label: '거래 건수' },
  averageOrderValue: { value: 0, change: 0, label: '평균 객단가' },
  totalDiscount: { value: 0, change: 0, label: '할인 금액' },
  discountRate: { value: 0, change: 0, label: '할인율' }
});

// 매출 추이 차트 (대형)
const salesTrendOptions = ref({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: true },
    zoom: { enabled: true }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#0d6efd', '#6c757d'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.2
    }
  },
  xaxis: {
    categories: ['월', '화', '수', '목', '금', '토', '일'],
    title: { text: '요일' }
  },
  yaxis: {
    title: { text: '매출액 (만원)' },
    labels: {
      formatter: (value) => value.toFixed(0)
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (value) => '₩' + value.toFixed(0) + '만원'
    }
  }
});

const salesTrendSeries = ref([]);

// 매장별 매출 전체 데이터
const allStoresData = ref([]);

const storeSortKey = ref('revenue');
const storeSortOrder = ref('desc');

const sortStores = (key) => {
  if (storeSortKey.value === key) {
    storeSortOrder.value = storeSortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    storeSortKey.value = key;
    storeSortOrder.value = 'desc';
  }
};

// 카테고리별 매출 + 트렌드
const categoryChartOptions = ref({
  chart: {
    type: 'donut',
    height: 350
  },
  labels: ['상의', '하의', '아우터', '악세서리', '신발'],
  colors: ['#0d6efd', '#198754', '#ffc107', '#0dcaf0', '#6c757d'],
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toFixed(1) + '%'
  }
});

const categoryChartSeries = ref([]);

// 시간대별 매출 히트맵
const timeHeatmapOptions = ref({
  chart: {
    type: 'heatmap',
    height: 300,
    toolbar: { show: false }
  },
  dataLabels: { enabled: false },
  colors: ['#0d6efd'],
  xaxis: {
    categories: ['06-09시', '09-12시', '12-15시', '15-18시', '18-21시', '21-24시']
  },
  yaxis: {
    categories: ['일', '월', '화', '수', '목', '금', '토']
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          { from: 0, to: 500, name: '낮음', color: '#e3f2fd' },
          { from: 501, to: 1000, name: '보통', color: '#90caf9' },
          { from: 1001, to: 1500, name: '높음', color: '#42a5f5' },
          { from: 1501, to: 2500, name: '매우 높음', color: '#0d6efd' }
        ]
      }
    }
  }
});

const timeHeatmapSeries = ref([]);

const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `₩${(value / 100000000).toFixed(1)}억`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

// 데이터 로드 함수
const loadData = async () => {
  isLoading.value = true;
  try {
    // 1. 매출 현황 (KPI) - 필터 적용
    const salesOverviewResponse = await getSalesOverview(selectedPeriod.value, filters.value);
    if (salesOverviewResponse?.data) {
      const overview = salesOverviewResponse.data;

      // 비교 데이터 저장
      comparisonData.value = {
        lastMonthRevenue: overview.lastMonthRevenue || 0,
        lastYearRevenue: overview.lastYearRevenue || 0,
        monthOverMonthGrowth: overview.monthOverMonthGrowth || 0,
        yearOverYearGrowth: overview.yearOverYearGrowth || 0
      };
      salesKPIs.value = {
        totalRevenue: {
          value: overview.totalRevenue || 0,
          change: overview.revenueGrowth || 0,
          label: '총 매출액'
        },
        netRevenue: {
          value: overview.netRevenue || overview.totalRevenue || 0,
          change: overview.revenueGrowth || 0,
          label: '순 매출액'
        },
        totalTransactions: {
          value: overview.totalTransactions || 0,
          change: overview.transactionGrowth || 0,
          label: '거래 건수'
        },
        averageOrderValue: {
          value: overview.averageOrderValue || 0,
          change: overview.avgOrderGrowth || 0,
          label: '평균 객단가'
        },
        totalDiscount: {
          value: overview.totalDiscount || 0,
          change: overview.discountGrowth || 0,
          label: '할인 금액'
        },
        discountRate: {
          value: overview.discountRate || 0,
          change: overview.discountRateGrowth || 0,
          label: '할인율'
        }
      };
    }

    // 2. 매출 추이
    const trendResponse = await getSalesTrend(selectedPeriod.value);
    if (trendResponse?.data && Array.isArray(trendResponse.data)) {
      const categories = trendResponse.data.map(item => item.date || item.period || '');
      const currentData = trendResponse.data.map(item => (item.revenue || 0) / 10000); // 만원 단위

      salesTrendOptions.value.xaxis.categories = categories;
      salesTrendSeries.value = [
        {
          name: selectedPeriod.value === 'daily' ? '오늘' : selectedPeriod.value === 'weekly' ? '이번 주' : '이번 달',
          data: currentData
        }
      ];
    }

    // 3. 매장별 매출
    const storesResponse = await getTopStores(selectedPeriod.value, 20);
    if (storesResponse?.data && Array.isArray(storesResponse.data)) {
      allStoresData.value = storesResponse.data.map(store => ({
        id: store.storeId || store.memberId,
        storeNumber: store.storeCode || store.memberCode || '',
        storeName: store.storeName || store.memberName || '알 수 없음',
        revenue: store.totalRevenue || 0,
        transactions: store.totalOrders || store.transactionCount || 0,
        growth: store.growthRate || 0,
        avgOrderValue: store.averageOrderValue || 0
      }));
    }

    // 4. 카테고리별 성과
    const categoryResponse = await getCategoryPerformance(selectedPeriod.value);
    if (categoryResponse?.data && Array.isArray(categoryResponse.data)) {
      const labels = categoryResponse.data.map(cat => cat.categoryName || '기타');
      const revenues = categoryResponse.data.map(cat => cat.totalRevenue || 0);

      categoryChartOptions.value.labels = labels;
      categoryChartSeries.value = revenues;
    }

    // 5. 시간대별 매출 히트맵
    const heatmapResponse = await getSalesHeatmap(selectedPeriod.value);
    if (heatmapResponse?.data && Array.isArray(heatmapResponse.data)) {
      // 백엔드 데이터 구조에 맞게 변환
      timeHeatmapSeries.value = heatmapResponse.data.map(item => ({
        name: item.dayOfWeek || item.label,
        data: item.hourlyData || []
      }));
    }

  } catch (error) {
    console.error('Failed to load sales data:', error);
  } finally {
    isLoading.value = false;
  }
};

// period 변경 시 데이터 다시 로드
watch(selectedPeriod, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="sales-detail-view">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/analytics">통합 대시보드</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">매출 상세 분석</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0">💰 매출 상세 분석</h2>
          <div class="btn-group" role="group">
            <button
              v-for="period in periods"
              :key="period.value"
              type="button"
              class="btn"
              :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 섹션 -->
    <div class="row mb-3" v-if="selectedPeriod === 'custom'">
      <div class="col-12">
        <BaseCard>
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">시작일</label>
              <input type="date" class="form-control" v-model="filters.startDate" @change="loadData" />
            </div>
            <div class="col-md-3">
              <label class="form-label">종료일</label>
              <input type="date" class="form-control" v-model="filters.endDate" @change="loadData" />
            </div>
            <div class="col-md-3">
              <label class="form-label">카테고리</label>
              <select class="form-select" v-model="filters.categories" multiple @change="loadData">
                <option value="상의">상의</option>
                <option value="하의">하의</option>
                <option value="아우터">아우터</option>
                <option value="가방">가방</option>
                <option value="악세서리">악세서리</option>
              </select>
            </div>
            <div class="col-md-3 d-flex align-items-end">
              <button class="btn btn-secondary w-100" @click="filters = { startDate: '', endDate: '', storeIds: [], categories: [] }; loadData()">
                초기화
              </button>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- 비교 데이터 섹션 -->
      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📊 전월 대비</h6>
            </template>
            <div class="comparison-content">
              <div class="comparison-item">
                <span class="label">전월 매출:</span>
                <span class="value">{{ formatCurrency(comparisonData.lastMonthRevenue) }}</span>
              </div>
              <div class="comparison-item">
                <span class="label">증감률:</span>
                <span class="value" :class="comparisonData.monthOverMonthGrowth >= 0 ? 'text-success' : 'text-danger'">
                  {{ comparisonData.monthOverMonthGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(comparisonData.monthOverMonthGrowth).toFixed(1) }}%
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="col-md-6 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📈 전년 대비</h6>
            </template>
            <div class="comparison-content">
              <div class="comparison-item">
                <span class="label">전년 매출:</span>
                <span class="value">{{ formatCurrency(comparisonData.lastYearRevenue) }}</span>
              </div>
              <div class="comparison-item">
                <span class="label">증감률:</span>
                <span class="value" :class="comparisonData.yearOverYearGrowth >= 0 ? 'text-success' : 'text-danger'">
                  {{ comparisonData.yearOverYearGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(comparisonData.yearOverYearGrowth).toFixed(1) }}%
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- KPI Cards (6개) -->
      <div class="row mb-4">
        <div class="col-xl-2 col-lg-4 col-md-6 mb-3" v-for="(kpi, key) in salesKPIs" :key="key">
          <BaseCard class="kpi-card h-100">
            <div class="kpi-content">
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-value">
                {{ key.includes('Rate') ? kpi.value + '%' : formatCurrency(kpi.value) }}
              </div>
              <div class="kpi-change" :class="kpi.change > 0 ? 'positive' : 'negative'">
                <span>{{ kpi.change > 0 ? '↑' : '↓' }}</span>
                {{ Math.abs(kpi.change) }}%
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Sales Trend Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">📈 매출 추이</h5>
                <div class="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    class="btn"
                    :class="selectedView === 'daily' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectedView = 'daily'"
                  >
                    일별
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="selectedView === 'weekly' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectedView = 'weekly'"
                  >
                    주별
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="selectedView === 'monthly' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectedView = 'monthly'"
                  >
                    월별
                  </button>
                </div>
              </div>
            </template>
            <VueApexCharts
              type="area"
              height="400"
              :options="salesTrendOptions"
              :series="salesTrendSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Store Sales Table -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">🏪 매장별 매출 상세</h5>
            </template>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th style="width: 80px">순위</th>
                    <th @click="sortStores('storeName')" class="sortable">매장명</th>
                    <th @click="sortStores('revenue')" class="sortable text-end">매출액</th>
                    <th @click="sortStores('transactions')" class="sortable text-end">거래 건수</th>
                    <th @click="sortStores('avgOrderValue')" class="sortable text-end">평균 객단가</th>
                    <th @click="sortStores('growth')" class="sortable text-end">성장률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(store, index) in allStoresData" :key="store.id">
                    <td class="text-center">
                      <span class="rank-badge" :class="{ 'top-three': index < 3 }">
                        {{ index + 1 }}
                      </span>
                    </td>
                    <td>
                      <div class="store-info">
                        <div class="store-name">{{ store.storeName }}</div>
                        <div class="store-number">{{ store.storeNumber }}</div>
                      </div>
                    </td>
                    <td class="text-end fw-bold">{{ formatCurrency(store.revenue) }}</td>
                    <td class="text-end">{{ store.transactions }}건</td>
                    <td class="text-end">{{ formatCurrency(store.avgOrderValue) }}</td>
                    <td class="text-end">
                      <span class="growth-badge" :class="store.growth > 0 ? 'positive' : 'negative'">
                        {{ store.growth > 0 ? '↑' : '↓' }} {{ Math.abs(store.growth) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Category & Time Analysis -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-3">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">📊 카테고리별 매출</h5>
            </template>
            <VueApexCharts
              type="donut"
              height="350"
              :options="categoryChartOptions"
              :series="categoryChartSeries"
            />
          </BaseCard>
        </div>
        <div class="col-lg-6 mb-3">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">⏰ 시간대별 매출 히트맵</h5>
            </template>
            <VueApexCharts
              type="heatmap"
              height="350"
              :options="timeHeatmapOptions"
              :series="timeHeatmapSeries"
            />
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sales-detail-view {
  padding: 20px 0;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin: 0;
}

.breadcrumb-item a {
  color: #0d6efd;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.kpi-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.kpi-content {
  padding: 1rem;
  text-align: center;
}

.kpi-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #212529;
  margin-bottom: 0.5rem;
}

.kpi-change {
  font-size: 0.9rem;
  font-weight: 600;
}

.kpi-change.positive {
  color: #198754;
}

.kpi-change.negative {
  color: #dc3545;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #f8f9fa;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
}

.rank-badge.top-three {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.store-info {
  display: flex;
  flex-direction: column;
}

.store-name {
  font-weight: 600;
  color: #212529;
}

.store-number {
  font-size: 0.85rem;
  color: #6c757d;
}

.growth-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.growth-badge.positive {
  background-color: #d1e7dd;
  color: #0f5132;
}

.growth-badge.negative {
  background-color: #f8d7da;
  color: #842029;
}

.comparison-content {
  padding: 1rem;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.comparison-item:last-child {
  border-bottom: none;
}

.comparison-item .label {
  font-weight: 500;
  color: #6c757d;
}

.comparison-item .value {
  font-weight: 700;
  font-size: 1.1rem;
}
</style>
