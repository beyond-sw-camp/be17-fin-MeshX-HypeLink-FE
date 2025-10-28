<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import {
  getOrderOverview,
  getOrderTrend,
  getTopStores
} from '@/api/analytics';

const isLoading = ref(true);
const selectedPeriod = ref('weekly');

const periods = [
  { value: 'daily', label: '오늘' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'custom', label: '커스텀' }
];

// API에서 가져올 데이터
const orderKPIs = ref({
  totalOrders: { value: 0, change: 0, label: '총 주문 건수' },
  pendingOrders: { value: 0, change: 0, label: '미처리 주문', alert: true },
  completedOrders: { value: 0, change: 0, label: '완료된 주문' },
  avgProcessingTime: { value: 0, change: 0, label: '평균 처리 시간 (일)', positive: true },
  completionRate: { value: 0, change: 0, label: '주문 완료율 (%)' },
  cancellationRate: { value: 0, change: 0, label: '주문 취소율 (%)', positive: true }
});

// 주문 추이 차트
const orderTrendOptions = ref({
  chart: {
    type: 'bar',
    height: 400,
    stacked: true,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%'
    }
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  colors: ['#198754', '#ffc107', '#dc3545'],
  xaxis: {
    categories: ['월', '화', '수', '목', '금', '토', '일']
  },
  yaxis: {
    title: { text: '주문 건수' }
  },
  fill: { opacity: 1 },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  tooltip: {
    y: {
      formatter: (val) => val + ' 건'
    }
  }
});

const orderTrendSeries = ref([]);

// 발주 사유별 분석 - Mock 데이터 유지 (백엔드 API 없음)
const reasonChartOptions = ref({
  chart: {
    type: 'pie',
    height: 350
  },
  labels: ['재고 부족', '신규 상품', '긴급 요청', '이벤트용', '교체 발주', '기타'],
  colors: ['#dc3545', '#0d6efd', '#ffc107', '#198754', '#6c757d', '#0dcaf0'],
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toFixed(1) + '%'
  }
});

const reasonChartSeries = ref([45, 20, 15, 10, 7, 3]);

// 매장별 발주 현황
const storeOrdersData = ref([]);

// 실시간 미처리 주문 목록
const pendingOrdersData = ref([
  { id: 1, orderId: 'PO-2024-001', store: '강남점', product: '베이직 티셔츠', quantity: 50, amount: 1500000, requestedAt: '2시간 전', status: 'REQUESTED', sla: 'normal' },
  { id: 2, orderId: 'PO-2024-002', store: '홍대점', product: '슬림 진', quantity: 30, amount: 1500000, requestedAt: '5시간 전', status: 'REQUESTED', sla: 'normal' },
  { id: 3, orderId: 'PO-2024-003', store: '신촌점', product: '후드 집업', quantity: 25, amount: 2000000, requestedAt: '26시간 전', status: 'REQUESTED', sla: 'warning' },
  { id: 4, orderId: 'PO-2024-004', store: '명동점', product: '크로스백', quantity: 40, amount: 1600000, requestedAt: '1시간 전', status: 'REQUESTED', sla: 'normal' },
  { id: 5, orderId: 'PO-2024-005', store: '부산점', product: '코튼 팬츠', quantity: 35, amount: 1750000, requestedAt: '30시간 전', status: 'REQUESTED', sla: 'danger' }
]);

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

const getSLAClass = (sla) => {
  const classes = {
    normal: 'badge bg-success',
    warning: 'badge bg-warning',
    danger: 'badge bg-danger'
  };
  return classes[sla] || 'badge bg-secondary';
};

const getSLAText = (sla) => {
  const texts = {
    normal: '정상',
    warning: '주의',
    danger: 'SLA 위반'
  };
  return texts[sla] || '알 수 없음';
};

// 데이터 로드 함수
const loadData = async () => {
  isLoading.value = true;
  try {
    // 1. 주문 현황 (KPI)
    const orderOverviewResponse = await getOrderOverview(selectedPeriod.value);
    if (orderOverviewResponse?.data) {
      const overview = orderOverviewResponse.data;
      orderKPIs.value = {
        totalOrders: {
          value: overview.totalOrders || 0,
          change: overview.orderGrowth || 0,
          label: '총 주문 건수'
        },
        pendingOrders: {
          value: overview.pendingOrders || 0,
          change: overview.pendingGrowth || 0,
          label: '미처리 주문',
          alert: true
        },
        completedOrders: {
          value: overview.completedOrders || 0,
          change: overview.completedGrowth || 0,
          label: '완료된 주문'
        },
        avgProcessingTime: {
          value: overview.avgProcessingTime || 0,
          change: overview.processingTimeChange || 0,
          label: '평균 처리 시간 (일)',
          positive: true
        },
        completionRate: {
          value: overview.completionRate || 0,
          change: overview.completionRateChange || 0,
          label: '주문 완료율 (%)'
        },
        cancellationRate: {
          value: overview.cancellationRate || 0,
          change: overview.cancellationRateChange || 0,
          label: '주문 취소율 (%)',
          positive: true
        }
      };
    }

    // 2. 주문 추이
    const trendResponse = await getOrderTrend(selectedPeriod.value);
    if (trendResponse?.data && Array.isArray(trendResponse.data)) {
      const categories = trendResponse.data.map(item => item.date || item.period || '');
      const completedData = trendResponse.data.map(item => item.completedOrders || 0);
      const pendingData = trendResponse.data.map(item => item.pendingOrders || 0);
      const cancelledData = trendResponse.data.map(item => item.cancelledOrders || 0);

      orderTrendOptions.value.xaxis.categories = categories;
      orderTrendSeries.value = [
        { name: '수령 완료', data: completedData },
        { name: '발주 대기', data: pendingData },
        { name: '취소', data: cancelledData }
      ];
    }

    // 3. 매장별 발주 현황
    const storesResponse = await getTopStores(selectedPeriod.value, 10);
    if (storesResponse?.data && Array.isArray(storesResponse.data)) {
      storeOrdersData.value = storesResponse.data.map(store => ({
        id: store.storeId || store.memberId,
        storeNumber: store.storeCode || store.memberCode || '',
        storeName: store.storeName || store.memberName || '알 수 없음',
        orders: store.totalOrders || 0,
        amount: store.totalRevenue || 0,
        frequency: store.orderFrequency || '주 2회',
        cancelRate: store.cancellationRate || 0
      }));
    }

  } catch (error) {
    console.error('Failed to load orders data:', error);
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
  <div class="orders-detail-view">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/analytics">통합 대시보드</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">주문 상세 분석</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0">📦 주문 관리 상세 분석</h2>
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

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- KPI Cards (6개) -->
      <div class="row mb-4">
        <div class="col-xl-2 col-lg-4 col-md-6 mb-3" v-for="(kpi, key) in orderKPIs" :key="key">
          <BaseCard class="kpi-card h-100" :class="{ 'alert-card': kpi.alert }">
            <div class="kpi-content">
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-value" :class="{ 'alert-value': kpi.alert }">
                {{ kpi.value }}{{ kpi.label.includes('%') ? '%' : kpi.label.includes('일') ? '일' : '건' }}
              </div>
              <div class="kpi-change" :class="kpi.positive ? (kpi.change < 0 ? 'positive' : 'negative') : (kpi.change > 0 ? 'positive' : 'negative')">
                <span>{{ kpi.change > 0 ? '↑' : '↓' }}</span>
                {{ Math.abs(kpi.change) }}{{ kpi.label.includes('%') ? '%p' : kpi.label.includes('일') ? '일' : '%' }}
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Order Trend Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">📈 주문 추이 (상태별)</h5>
            </template>
            <VueApexCharts
              type="bar"
              height="400"
              :options="orderTrendOptions"
              :series="orderTrendSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Store Orders & Reason Analysis -->
      <div class="row mb-4">
        <div class="col-lg-8 mb-3">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">🏪 매장별 발주 현황</h5>
            </template>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>매장명</th>
                    <th class="text-end">주문 건수</th>
                    <th class="text-end">주문 금액</th>
                    <th>발주 빈도</th>
                    <th class="text-end">취소율</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(store, index) in storeOrdersData" :key="store.id">
                    <td>
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
                    <td class="text-end fw-bold">{{ store.orders }}건</td>
                    <td class="text-end">{{ formatCurrency(store.amount) }}</td>
                    <td>{{ store.frequency }}</td>
                    <td class="text-end">
                      <span class="cancel-rate" :class="{ 'high': store.cancelRate > 4 }">
                        {{ store.cancelRate }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>

        <div class="col-lg-4 mb-3">
          <BaseCard>
            <template #header>
              <h5 class="mb-0">📊 발주 사유별 분석</h5>
            </template>
            <VueApexCharts
              type="pie"
              height="400"
              :options="reasonChartOptions"
              :series="reasonChartSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Real-time Pending Orders -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">⚡ 실시간 미처리 주문 목록</h5>
                <span class="badge bg-danger">{{ pendingOrdersData.length }}건 처리 필요</span>
              </div>
            </template>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th style="width: 80px">SLA</th>
                    <th>주문 번호</th>
                    <th>매장</th>
                    <th>상품명</th>
                    <th class="text-end">수량</th>
                    <th class="text-end">금액</th>
                    <th>요청 시각</th>
                    <th style="width: 100px">액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in pendingOrdersData" :key="order.id" :class="{ 'table-danger': order.sla === 'danger' }">
                    <td>
                      <span :class="getSLAClass(order.sla)">
                        {{ getSLAText(order.sla) }}
                      </span>
                    </td>
                    <td class="fw-bold">{{ order.orderId }}</td>
                    <td>{{ order.store }}</td>
                    <td>{{ order.product }}</td>
                    <td class="text-end">{{ order.quantity }}개</td>
                    <td class="text-end">{{ formatCurrency(order.amount) }}</td>
                    <td>{{ order.requestedAt }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary w-100">
                        처리
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-detail-view {
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

.kpi-card.alert-card {
  border-left: 4px solid #ffc107;
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

.kpi-value.alert-value {
  color: #ffc107;
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

.cancel-rate {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.cancel-rate.high {
  background-color: #f8d7da;
  color: #842029;
}

.table-danger {
  background-color: #f8d7da;
}
</style>
