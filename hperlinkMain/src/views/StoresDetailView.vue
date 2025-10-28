<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getAllStores } from '@/api/analytics';

const isLoading = ref(true);
const selectedStore = ref(null);
const selectedPeriod = ref('weekly');

// API에서 가져올 전체 매장 리스트
const allStores = ref([]);

// 선택된 매장 상세 차트 데이터
const storeRevenueChart = computed(() => ({
  options: {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#0d6efd'],
    xaxis: {
      categories: ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주']
    },
    yaxis: {
      title: { text: '매출액 (만원)' }
    },
    tooltip: {
      y: {
        formatter: (val) => '₩' + val + '만원'
      }
    }
  },
  series: [
    {
      name: '주간 매출',
      data: [1420, 1580, 1350, 1690, 1820, 2050, 1880, 1980]
    }
  ]
}));

const storeTopProducts = computed(() => {
  if (!selectedStore.value) return [];
  return [
    { name: '베이직 티셔츠', sales: 85, revenue: 2550000 },
    { name: '슬림 진', sales: 62, revenue: 3100000 },
    { name: '후드 집업', sales: 48, revenue: 3840000 },
    { name: '크로스백', sales: 35, revenue: 1400000 },
    { name: '코튼 팬츠', sales: 28, revenue: 1400000 }
  ];
});

const storeInventoryStatus = computed(() => {
  if (!selectedStore.value) return [];
  return [
    { product: '베이직 티셔츠', stock: 45, status: 'normal' },
    { product: '슬림 진', stock: 8, status: 'low' },
    { product: '후드 집업', stock: 3, status: 'critical' },
    { product: '크로스백', stock: 32, status: 'normal' },
    { product: '코튼 팬츠', stock: 5, status: 'low' }
  ];
});

const selectStore = (store) => {
  selectedStore.value = store;
};

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

const getStockBadgeClass = (status) => {
  const classes = {
    normal: 'badge bg-success',
    low: 'badge bg-warning',
    critical: 'badge bg-danger'
  };
  return classes[status] || 'badge bg-secondary';
};

const getStockText = (status) => {
  const texts = {
    normal: '정상',
    low: '부족',
    critical: '긴급'
  };
  return texts[status] || '알 수 없음';
};

// 데이터 로드 함수
const loadData = async () => {
  isLoading.value = true;
  try {
    // 매장 전체 리스트 가져오기
    const storesResponse = await getAllStores(0, 50, selectedPeriod.value);
    if (storesResponse?.data?.content && Array.isArray(storesResponse.data.content)) {
      allStores.value = storesResponse.data.content.map(store => ({
        id: store.storeId || store.memberId,
        storeNumber: store.storeCode || store.memberCode || '',
        storeName: store.storeName || store.memberName || '알 수 없음',
        revenue: store.totalRevenue || 0,
        orders: store.totalOrders || 0,
        transactions: store.transactionCount || store.totalOrders || 0,
        avgOrderValue: store.averageOrderValue || 0,
        growth: store.growthRate || 0,
        rating: store.rating || 4.5,
        manager: store.manager || store.ownerName || '정보 없음',
        phone: store.phone || store.contactNumber || '정보 없음',
        address: store.address || store.location || '정보 없음'
      }));

      // 첫 번째 매장 자동 선택
      if (allStores.value.length > 0) {
        selectedStore.value = allStores.value[0];
      }
    }
  } catch (error) {
    console.error('Failed to load stores data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="stores-detail-view">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/analytics">통합 대시보드</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">매장별 상세 분석</li>
      </ol>
    </nav>

    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-0">🏪 매장별 성과 분석</h2>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- Store Cards Grid -->
      <div class="row mb-4">
        <div class="col-12">
          <h5 class="mb-3">전체 매장 목록</h5>
        </div>
        <div
          class="col-xl-3 col-lg-4 col-md-6 mb-3"
          v-for="store in allStores"
          :key="store.id"
        >
          <BaseCard
            class="store-card"
            :class="{ 'selected': selectedStore?.id === store.id }"
            @click="selectStore(store)"
          >
            <div class="store-card-content">
              <div class="store-card-header">
                <div class="store-title">
                  <h6 class="mb-0">{{ store.storeName }}</h6>
                  <small class="text-muted">{{ store.storeNumber }}</small>
                </div>
                <div class="store-rating">
                  <span class="rating-star">⭐</span>
                  <span class="rating-value">{{ store.rating }}</span>
                </div>
              </div>
              <div class="store-metrics">
                <div class="metric-item">
                  <span class="metric-label">매출</span>
                  <span class="metric-value">{{ formatCurrency(store.revenue) }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">거래</span>
                  <span class="metric-value">{{ store.transactions }}건</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">성장률</span>
                  <span class="metric-value" :class="store.growth > 0 ? 'text-success' : 'text-danger'">
                    {{ store.growth > 0 ? '+' : '' }}{{ store.growth }}%
                  </span>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Selected Store Detail -->
      <div v-if="selectedStore" class="row mb-4">
        <div class="col-12">
          <h5 class="mb-3">{{ selectedStore.storeName }} 상세 분석</h5>
        </div>

        <!-- Store Info Card -->
        <div class="col-lg-3 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📋 매장 정보</h6>
            </template>
            <div class="store-detail-info">
              <div class="info-item">
                <span class="info-label">매장 코드</span>
                <span class="info-value">{{ selectedStore.storeNumber }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">점주</span>
                <span class="info-value">{{ selectedStore.manager }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">연락처</span>
                <span class="info-value">{{ selectedStore.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">주소</span>
                <span class="info-value">{{ selectedStore.address }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">평점</span>
                <span class="info-value">⭐ {{ selectedStore.rating }}</span>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Revenue Trend -->
        <div class="col-lg-9 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📈 매출 추이 (최근 8주)</h6>
            </template>
            <VueApexCharts
              type="line"
              height="300"
              :options="storeRevenueChart.options"
              :series="storeRevenueChart.series"
            />
          </BaseCard>
        </div>

        <!-- Top Products & Inventory -->
        <div class="col-lg-6 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">🏆 인기 상품 TOP 5</h6>
            </template>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>상품명</th>
                    <th class="text-end">판매량</th>
                    <th class="text-end">매출액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(product, index) in storeTopProducts" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ product.name }}</td>
                    <td class="text-end">{{ product.sales }}개</td>
                    <td class="text-end">{{ formatCurrency(product.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>

        <div class="col-lg-6 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📦 재고 현황</h6>
            </template>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>상품명</th>
                    <th class="text-center">재고</th>
                    <th class="text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in storeInventoryStatus" :key="index">
                    <td>{{ item.product }}</td>
                    <td class="text-center fw-bold">{{ item.stock }}개</td>
                    <td class="text-center">
                      <span :class="getStockBadgeClass(item.status)">
                        {{ getStockText(item.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>

        <!-- Performance Comparison -->
        <div class="col-12 mb-3">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">📊 성과 비교 (평균 대비)</h6>
            </template>
            <div class="row g-3 p-3">
              <div class="col-md-3">
                <div class="comparison-card">
                  <div class="comparison-label">매출액</div>
                  <div class="comparison-value">{{ formatCurrency(selectedStore.revenue) }}</div>
                  <div class="comparison-diff" :class="selectedStore.growth > 0 ? 'positive' : 'negative'">
                    평균 대비 {{ selectedStore.growth > 0 ? '+' : '' }}{{ selectedStore.growth }}%
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="comparison-card">
                  <div class="comparison-label">거래 건수</div>
                  <div class="comparison-value">{{ selectedStore.transactions }}건</div>
                  <div class="comparison-diff positive">
                    평균 대비 +{{ ((selectedStore.transactions - 123) / 123 * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="comparison-card">
                  <div class="comparison-label">평균 객단가</div>
                  <div class="comparison-value">{{ formatCurrency(selectedStore.avgOrderValue) }}</div>
                  <div class="comparison-diff" :class="selectedStore.avgOrderValue > 82000 ? 'positive' : 'negative'">
                    평균 대비 {{ selectedStore.avgOrderValue > 82000 ? '+' : '' }}{{ ((selectedStore.avgOrderValue - 82000) / 82000 * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="comparison-card">
                  <div class="comparison-label">발주 건수</div>
                  <div class="comparison-value">{{ selectedStore.orders }}건</div>
                  <div class="comparison-diff positive">
                    평균 대비 +{{ ((selectedStore.orders - 38) / 38 * 100).toFixed(1) }}%
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stores-detail-view {
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

.store-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.store-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.store-card.selected {
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.store-card-content {
  padding: 1rem;
}

.store-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.store-title h6 {
  font-weight: 700;
  color: #212529;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-star {
  font-size: 1rem;
}

.rating-value {
  font-weight: 600;
  color: #212529;
}

.store-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.metric-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: #212529;
}

.store-detail-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  font-size: 0.95rem;
  color: #212529;
  font-weight: 600;
}

.comparison-card {
  background-color: #f8f9fa;
  padding: 1.25rem;
  border-radius: 0.5rem;
  text-align: center;
}

.comparison-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.comparison-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
}

.comparison-diff {
  font-size: 0.85rem;
  font-weight: 600;
}

.comparison-diff.positive {
  color: #198754;
}

.comparison-diff.negative {
  color: #dc3545;
}
</style>
