<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getLowStockItems } from '@/api/analytics';

const isLoading = ref(true);
const selectedStockLevel = ref('all');
const selectedCategory = ref('all');

// 페이징 관련 변수
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(0);
const totalItems = ref(0);

// Inventory KPIs
const inventoryKPIs = ref({
  totalSKUs: { label: '총 SKU 수', value: 1856, change: 12, unit: '개' },
  lowStock: { label: '재고 부족', value: 47, change: -8, unit: '개', alert: true },
  outOfStock: { label: '재고 소진', value: 12, change: -3, unit: '개', alert: true },
  avgTurnover: { label: '평균 회전율', value: 4.2, change: 0.5, unit: '회/월' },
  inventoryValue: { label: '총 재고 가치', value: 487500000, change: 3.2, unit: '원' },
  reorderNeeded: { label: '발주 필요', value: 35, change: -5, unit: '개', alert: true }
});

// Stock Level Filters
const stockLevels = ref([
  { value: 'all', label: '전체' },
  { value: 'critical', label: '긴급 (재고 소진)' },
  { value: 'low', label: '부족 (10개 이하)' },
  { value: 'medium', label: '보통 (11-50개)' },
  { value: 'sufficient', label: '충분 (51개 이상)' }
]);

// Categories
const categories = ref([
  { value: 'all', label: '전체' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'outer', label: '아우터' },
  { value: 'accessory', label: '악세서리' },
  { value: 'bag', label: '가방' }
]);

// API에서 가져올 Low Stock Items Data
const lowStockItems = ref([]);

// Inventory Turnover by Category
const turnoverByCategoryOptions = ref({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      dataLabels: { position: 'top' }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}회/월`,
    offsetX: 30,
    style: { fontSize: '12px', colors: ['#304758'] }
  },
  xaxis: {
    categories: ['악세서리', '상의', '아우터', '하의', '가방'],
    title: { text: '재고 회전율 (회/월)' }
  },
  colors: ['#667eea'],
  title: {
    text: '카테고리별 재고 회전율',
    align: 'left'
  }
});

const turnoverByCategorySeries = ref([]);

// Stock Level Distribution (Donut)
const stockDistributionOptions = ref({
  chart: {
    type: 'donut',
    height: 320
  },
  labels: ['충분', '보통', '부족', '긴급'],
  colors: ['#28a745', '#ffc107', '#fd7e14', '#dc3545'],
  legend: {
    position: 'bottom'
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: '총 SKU',
            formatter: () => '1,856개'
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`
  },
  title: {
    text: '재고 수준 분포',
    align: 'left'
  }
});

const stockDistributionSeries = ref([]);

// Inventory Aging Analysis
const inventoryAgingOptions = ref({
  chart: {
    type: 'bar',
    height: 320,
    stacked: true,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false
    }
  },
  xaxis: {
    categories: ['상의', '하의', '아우터', '가방', '악세서리']
  },
  yaxis: {
    title: { text: '재고 수량 (개)' }
  },
  legend: {
    position: 'top'
  },
  fill: {
    opacity: 1
  },
  colors: ['#28a745', '#ffc107', '#fd7e14', '#dc3545'],
  title: {
    text: '재고 연령 분석 (카테고리별)',
    align: 'left'
  }
});

const inventoryAgingSeries = ref([]);

// Store-wise Inventory Comparison
const storeInventoryOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['강남점', '홍대점', '신촌점', '분당점', '송파점', '판교점', '잠실점', '건대점']
  },
  yaxis: {
    title: { text: '재고 수량 (개)' }
  },
  fill: {
    opacity: 1
  },
  colors: ['#667eea', '#f6ad55'],
  legend: {
    position: 'top'
  },
  title: {
    text: '매장별 재고 현황',
    align: 'left'
  }
});

const storeInventorySeries = ref([]);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

const getUrgencyClass = (urgency) => {
  const classes = {
    critical: 'badge bg-danger',
    high: 'badge bg-warning',
    medium: 'badge bg-info'
  };
  return classes[urgency] || 'badge bg-secondary';
};

const getUrgencyText = (urgency) => {
  const texts = {
    critical: '긴급',
    high: '높음',
    medium: '보통'
  };
  return texts[urgency] || '알 수 없음';
};

const getCategoryBadgeClass = (category) => {
  const classes = {
    '상의': 'badge bg-primary',
    '하의': 'badge bg-warning',
    '아우터': 'badge bg-danger',
    '가방': 'badge bg-info',
    '악세서리': 'badge bg-secondary'
  };
  return classes[category] || 'badge bg-secondary';
};

const createReorderRequest = (item) => {
  alert(`발주 요청: ${item.name} - ${item.reorderQty}개`);
};

const createBulkReorder = () => {
  const criticalItems = lowStockItems.value.filter(item => item.urgency === 'critical');
  alert(`일괄 발주 요청: ${criticalItems.length}개 품목`);
};

// 데이터 로드 함수
const loadData = async (page = 1) => {
  isLoading.value = true;
  try {
    // 재고 부족 품목 가져오기 (threshold: 20, page, size)
    const inventoryResponse = await getLowStockItems(20, page - 1, itemsPerPage.value);
    if (inventoryResponse?.data) {
      const pageData = inventoryResponse.data;

      // 페이지 데이터인 경우
      if (pageData.content && Array.isArray(pageData.content)) {
        lowStockItems.value = pageData.content.map(item => ({
          productId: item.productId || item.itemId || '',
          name: item.productName || item.itemName || '알 수 없음',
          category: item.categoryName || item.category || '기타',
          store: item.storeName || item.store || '정보 없음',
          currentStock: item.currentStock || item.stock || 0,
          minStock: item.minimumStock || item.minStock || 20,
          reorderQty: item.reorderQuantity || item.reorderQty || 50,
          urgency: item.urgency || (item.currentStock <= 3 ? 'critical' : item.currentStock <= 10 ? 'high' : 'medium'),
          daysUntilOut: item.daysUntilOut || Math.floor(item.currentStock / 2)
        }));

        totalPages.value = pageData.totalPages || 0;
        totalItems.value = pageData.totalElements || 0;
        currentPage.value = page;

        // KPI 업데이트 (전체 아이템 수 기준)
        inventoryKPIs.value.lowStock.value = totalItems.value;
        inventoryKPIs.value.outOfStock.value = lowStockItems.value.filter(item => item.urgency === 'critical').length;
        inventoryKPIs.value.reorderNeeded.value = lowStockItems.value.filter(item => item.currentStock < item.minStock).length;
      }
    }
  } catch (error) {
    console.error('Failed to load inventory data:', error);
  } finally {
    isLoading.value = false;
  }
};

// 페이지네이션에서 보여줄 페이지 번호들 계산
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="inventory-detail">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/analytics">통합 대시보드</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">재고 상세 분석</li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">📦 재고 상세 분석</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-danger" @click="createBulkReorder">
          <i class="bi bi-exclamation-triangle"></i> 긴급 일괄 발주
        </button>
        <button class="btn btn-primary">
          <i class="bi bi-download"></i> 리포트 다운로드
        </button>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- Inventory KPIs -->
      <div class="row mb-4">
        <div class="col-xl-2 col-md-4 col-sm-6 mb-3" v-for="(kpi, key) in inventoryKPIs" :key="key">
          <BaseCard class="kpi-card h-100" :class="{ 'alert-card': kpi.alert }">
            <div class="kpi-content">
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-value">
                <span v-if="key === 'inventoryValue'">{{ formatCurrency(kpi.value) }}</span>
                <span v-else>{{ formatNumber(kpi.value) }}{{ kpi.unit }}</span>
              </div>
              <div class="kpi-change" :class="kpi.change > 0 ? 'positive' : 'negative'">
                <span>{{ kpi.change > 0 ? '▲' : '▼' }}</span>
                <span>{{ Math.abs(kpi.change) }}{{ key === 'inventoryValue' || key === 'avgTurnover' ? '%' : kpi.unit }}</span>
                <span class="period">vs 지난주</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Charts Row 1: Turnover & Distribution -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="bar"
              height="320"
              :options="turnoverByCategoryOptions"
              :series="turnoverByCategorySeries"
            />
          </BaseCard>
        </div>
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="donut"
              height="320"
              :options="stockDistributionOptions"
              :series="stockDistributionSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Charts Row 2: Aging & Store Comparison -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="bar"
              height="320"
              :options="inventoryAgingOptions"
              :series="inventoryAgingSeries"
            />
          </BaseCard>
        </div>
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="bar"
              height="350"
              :options="storeInventoryOptions"
              :series="storeInventorySeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Low Stock Items Table -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 class="mb-0">⚠️ 재고 부족 품목 ({{ totalItems }}개)</h6>
                <div class="d-flex gap-2">
                  <select class="form-select form-select-sm" v-model="selectedStockLevel" style="width: 180px;">
                    <option v-for="level in stockLevels" :key="level.value" :value="level.value">
                      {{ level.label }}
                    </option>
                  </select>
                  <select class="form-select form-select-sm" v-model="selectedCategory" style="width: 150px;">
                    <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                      {{ cat.label }}
                    </option>
                  </select>
                  <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-file-excel"></i> 엑셀
                  </button>
                </div>
              </div>
            </template>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>긴급도</th>
                    <th>상품 코드</th>
                    <th>상품명</th>
                    <th>카테고리</th>
                    <th>매장</th>
                    <th>현재 재고</th>
                    <th>최소 재고</th>
                    <th>권장 발주량</th>
                    <th>소진 예상</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in lowStockItems" :key="item.productId"
                      :class="{ 'table-danger': item.urgency === 'critical' }">
                    <td>
                      <span :class="getUrgencyClass(item.urgency)">
                        {{ getUrgencyText(item.urgency) }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ item.productId }}</td>
                    <td class="fw-bold">{{ item.name }}</td>
                    <td>
                      <span :class="getCategoryBadgeClass(item.category)">
                        {{ item.category }}
                      </span>
                    </td>
                    <td>{{ item.store }}</td>
                    <td>
                      <span class="badge bg-danger">{{ item.currentStock }}개</span>
                    </td>
                    <td>{{ item.minStock }}개</td>
                    <td class="fw-bold text-primary">{{ item.reorderQty }}개</td>
                    <td>
                      <span class="badge" :class="item.daysUntilOut <= 2 ? 'bg-danger' : 'bg-warning'">
                        {{ item.daysUntilOut }}일 후
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-primary" @click="createReorderRequest(item)">
                        발주 요청
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 페이지네이션 -->
            <nav v-if="totalPages >= 1" class="mt-3">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="loadData(currentPage - 1)" :disabled="currentPage === 1">이전</button>
                </li>
                <li class="page-item" v-if="visiblePages[0] > 1">
                  <button class="page-link" @click="loadData(1)">1</button>
                </li>
                <li class="page-item disabled" v-if="visiblePages[0] > 2">
                  <span class="page-link">...</span>
                </li>
                <li class="page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
                  <button class="page-link" @click="loadData(page)">{{ page }}</button>
                </li>
                <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < totalPages - 1">
                  <span class="page-link">...</span>
                </li>
                <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < totalPages">
                  <button class="page-link" @click="loadData(totalPages)">{{ totalPages }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="loadData(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
                </li>
              </ul>
            </nav>
          </BaseCard>
        </div>
      </div>

      <!-- Reorder Recommendations -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">💡 발주 권장 사항</h6>
            </template>
            <div class="recommendation-list">
              <div class="recommendation-item critical">
                <div class="recommendation-icon">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-title">긴급 발주 필요</div>
                  <div class="recommendation-desc">
                    7개 품목이 2일 이내 재고 소진 예상. 즉시 발주를 진행하세요.
                  </div>
                </div>
                <div class="recommendation-action">
                  <button class="btn btn-danger btn-sm" @click="createBulkReorder">
                    일괄 발주
                  </button>
                </div>
              </div>

              <div class="recommendation-item warning">
                <div class="recommendation-icon">
                  <i class="bi bi-exclamation-circle-fill"></i>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-title">재고 모니터링 필요</div>
                  <div class="recommendation-desc">
                    12개 품목의 재고가 최소 수준 미만. 5일 이내 발주 권장.
                  </div>
                </div>
                <div class="recommendation-action">
                  <button class="btn btn-warning btn-sm">
                    상세 보기
                  </button>
                </div>
              </div>

              <div class="recommendation-item info">
                <div class="recommendation-icon">
                  <i class="bi bi-info-circle-fill"></i>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-title">재고 회전율 개선</div>
                  <div class="recommendation-desc">
                    악세서리 카테고리의 회전율이 높습니다 (5.2회/월). 재고 수준 상향 조정을 검토하세요.
                  </div>
                </div>
                <div class="recommendation-action">
                  <button class="btn btn-info btn-sm">
                    분석 보기
                  </button>
                </div>
              </div>

              <div class="recommendation-item success">
                <div class="recommendation-icon">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-title">재고 관리 양호</div>
                  <div class="recommendation-desc">
                    전체 SKU의 62.4%가 충분한 재고 수준을 유지하고 있습니다.
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
.inventory-detail {
  padding: 20px 0;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb-item a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.kpi-card {
  border-left: 4px solid #667eea;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card.alert-card {
  border-left-color: #dc3545;
  background-color: #fff5f5;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.kpi-content {
  padding: 0.5rem 0;
}

.kpi-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5rem;
}

.kpi-change {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kpi-change.positive {
  color: #28a745;
}

.kpi-change.negative {
  color: #dc3545;
}

.kpi-change .period {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 400;
  margin-left: 0.25rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  font-size: 0.9rem;
  vertical-align: middle;
}

.table-danger {
  background-color: #f8d7da;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.recommendation-item.critical {
  background-color: #fee;
  border-left-color: #dc3545;
}

.recommendation-item.warning {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.recommendation-item.info {
  background-color: #e7f3ff;
  border-left-color: #0dcaf0;
}

.recommendation-item.success {
  background-color: #d1e7dd;
  border-left-color: #28a745;
}

.recommendation-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.recommendation-item.critical .recommendation-icon {
  color: #dc3545;
}

.recommendation-item.warning .recommendation-icon {
  color: #ffc107;
}

.recommendation-item.info .recommendation-icon {
  color: #0dcaf0;
}

.recommendation-item.success .recommendation-icon {
  color: #28a745;
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.recommendation-desc {
  font-size: 0.9rem;
  color: #6c757d;
}

.recommendation-action {
  flex-shrink: 0;
}
</style>
