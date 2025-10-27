<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import {
  getAllProducts,
  getTopProducts,
  getCategoryPerformance
} from '@/api/analytics';

const isLoading = ref(true);
const selectedPeriod = ref('weekly');
const selectedCategory = ref('all');

// Product KPIs (API에서 가져올 데이터)
const productKPIs = ref({
  totalProducts: { label: '총 상품 수', value: 0, change: 0, unit: '개' },
  activeSKUs: { label: '활성 SKU', value: 0, change: 0, unit: '개' },
  avgRevenuePerSKU: { label: 'SKU당 평균 매출', value: 0, change: 0, unit: '원' },
  inventoryTurnover: { label: '재고 회전율', value: 0, change: 0, unit: '회/월' },
  newProducts: { label: '신상품 (30일)', value: 0, change: 0, unit: '개' },
  discontinuedRate: { label: '단종률', value: 0, change: 0, unit: '%' }
});

// Category list
const categories = ref([
  { value: 'all', label: '전체' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'outer', label: '아우터' },
  { value: 'accessory', label: '악세서리' },
  { value: 'bag', label: '가방' }
]);

// API에서 가져올 Top 20 Products Data
const topProductsData = ref([]);

// API에서 가져올 Category Performance Data
const categoryPerformanceData = ref([]);

// Product Performance Trend (8 weeks)
const productTrendOptions = ref({
  chart: {
    type: 'line',
    height: 350,
    toolbar: { show: true }
  },
  stroke: {
    width: [3, 3, 3],
    curve: 'smooth'
  },
  xaxis: {
    categories: ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차', '7주차', '8주차']
  },
  yaxis: {
    title: { text: '판매량 (개)' }
  },
  colors: ['#667eea', '#f6ad55', '#fc8181'],
  legend: {
    position: 'top'
  },
  title: {
    text: '상위 3개 제품 판매 추이',
    align: 'left'
  }
});

const productTrendSeries = ref([]);

// Category Distribution (Donut Chart)
const categoryChartOptions = ref({
  chart: {
    type: 'donut',
    height: 320
  },
  labels: ['상의', '하의', '아우터', '가방', '악세서리'],
  colors: ['#667eea', '#f6ad55', '#fc8181', '#4fd1c5', '#9f7aea'],
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
            label: '총 매출',
            formatter: () => '₩195.9M'
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`
  }
});

const categoryChartSeries = ref([]);

// Size Distribution Heatmap
const sizeHeatmapOptions = ref({
  chart: {
    type: 'heatmap',
    height: 280,
    toolbar: { show: false }
  },
  dataLabels: {
    enabled: true
  },
  colors: ['#667eea'],
  title: {
    text: '사이즈별 판매 분포',
    align: 'left',
    style: { fontSize: '14px', fontWeight: '600' }
  },
  xaxis: {
    categories: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: 0, to: 50, color: '#e0e7ff', name: 'low' },
          { from: 51, to: 100, color: '#c7d2fe', name: 'medium' },
          { from: 101, to: 150, color: '#a5b4fc', name: 'high' },
          { from: 151, to: 200, color: '#667eea', name: 'very high' }
        ]
      }
    }
  }
});

const sizeHeatmapSeries = ref([]);

// Color Distribution Heatmap
const colorHeatmapOptions = ref({
  chart: {
    type: 'heatmap',
    height: 280,
    toolbar: { show: false }
  },
  dataLabels: {
    enabled: true
  },
  colors: ['#fc8181'],
  title: {
    text: '색상별 판매 분포',
    align: 'left',
    style: { fontSize: '14px', fontWeight: '600' }
  },
  xaxis: {
    categories: ['블랙', '화이트', '그레이', '네이비', '베이지', '기타']
  },
  plotOptions: {
    heatmap: {
      colorScale: {
        ranges: [
          { from: 0, to: 50, color: '#fee2e2', name: 'low' },
          { from: 51, to: 100, color: '#fecaca', name: 'medium' },
          { from: 101, to: 150, color: '#fca5a5', name: 'high' },
          { from: 151, to: 200, color: '#fc8181', name: 'very high' }
        ]
      }
    }
  }
});

const colorHeatmapSeries = ref([]);

// Product Performance Matrix (Scatter Chart)
const performanceMatrixOptions = ref({
  chart: {
    type: 'scatter',
    height: 350,
    zoom: { enabled: true, type: 'xy' },
    toolbar: { show: true }
  },
  xaxis: {
    title: { text: '판매량 (개)' },
    tickAmount: 10
  },
  yaxis: {
    title: { text: '재고 회전율 (회/월)' },
    tickAmount: 7
  },
  title: {
    text: '상품 성과 매트릭스 (판매량 vs 재고 회전율)',
    align: 'left'
  },
  colors: ['#667eea', '#f6ad55', '#fc8181', '#4fd1c5', '#9f7aea'],
  legend: {
    position: 'top'
  }
});

const performanceMatrixSeries = ref([]);

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

const getStockLevelClass = (level) => {
  const classes = {
    high: 'badge bg-success',
    medium: 'badge bg-warning',
    low: 'badge bg-danger'
  };
  return classes[level] || 'badge bg-secondary';
};

const getStockLevelText = (level) => {
  const texts = {
    high: '충분',
    medium: '보통',
    low: '부족'
  };
  return texts[level] || '알 수 없음';
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

// 데이터 로드 함수
const loadData = async () => {
  isLoading.value = true;
  try {
    // 1. 상품 TOP 20 가져오기
    const productsResponse = await getTopProducts(selectedPeriod.value, 20);
    if (productsResponse?.data && Array.isArray(productsResponse.data)) {
      topProductsData.value = productsResponse.data.map((product, index) => ({
        rank: index + 1,
        productId: product.productId || product.itemId || '',
        name: product.productName || product.itemName || '알 수 없음',
        category: product.categoryName || product.category || '기타',
        totalSales: product.totalRevenue || 0,
        quantity: product.totalQuantity || product.quantity || 0,
        avgPrice: product.averagePrice || 0,
        stockLevel: product.stockLevel || 'medium',
        growth: product.growthRate || 0
      }));

      // KPI 계산 (가져온 상품 데이터로부터)
      if (topProductsData.value.length > 0) {
        const totalProducts = topProductsData.value.length;
        const totalRevenue = topProductsData.value.reduce((sum, p) => sum + p.totalSales, 0);
        const totalQuantity = topProductsData.value.reduce((sum, p) => sum + p.quantity, 0);
        const avgRevenuePerSKU = totalProducts > 0 ? totalRevenue / totalProducts : 0;

        productKPIs.value.totalProducts.value = totalProducts;
        productKPIs.value.activeSKUs.value = totalProducts;
        productKPIs.value.avgRevenuePerSKU.value = avgRevenuePerSKU;
      }
    }

    // 2. 카테고리별 성과
    const categoryResponse = await getCategoryPerformance(selectedPeriod.value);
    if (categoryResponse?.data && Array.isArray(categoryResponse.data)) {
      categoryPerformanceData.value = categoryResponse.data.map(cat => ({
        category: cat.categoryName || '기타',
        revenue: cat.totalRevenue || 0,
        quantity: cat.totalQuantity || cat.quantity || 0,
        avgPrice: cat.averagePrice || 0,
        growth: cat.growthRate || 0,
        margin: cat.profitMargin || 0
      }));

      // 카테고리 차트 데이터 업데이트
      const labels = categoryPerformanceData.value.map(cat => cat.category);
      const revenues = categoryPerformanceData.value.map(cat => cat.revenue / 1000000); // 백만원 단위

      categoryChartOptions.value.labels = labels;
      categoryChartSeries.value = revenues;

      // Performance Matrix 데이터 생성 (카테고리별로 묶어서)
      performanceMatrixSeries.value = categoryPerformanceData.value.map(cat => {
        // 해당 카테고리의 상품들을 필터링
        const categoryProducts = topProductsData.value.filter(p => p.category === cat.category);
        // [판매량, 회전율] 형태로 변환 (여기서는 간단히 성장률을 회전율로 사용)
        const data = categoryProducts.map(p => [p.quantity, Math.abs(p.growth) / 10]);

        return {
          name: cat.category,
          data: data
        };
      });
    }

  } catch (error) {
    console.error('Failed to load products data:', error);
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
  <div class="products-detail">
    <!-- Breadcrumb Navigation -->
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/analytics">통합 대시보드</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">상품 상세 분석</li>
      </ol>
    </nav>

    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">🛍️ 상품 상세 분석</h2>
      <div class="d-flex gap-2">
        <select class="form-select" v-model="selectedCategory" style="width: 150px;">
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <button class="btn btn-primary">
          <i class="bi bi-download"></i> 리포트 다운로드
        </button>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- Product KPIs -->
      <div class="row mb-4">
        <div class="col-xl-2 col-md-4 col-sm-6 mb-3" v-for="(kpi, key) in productKPIs" :key="key">
          <BaseCard class="kpi-card h-100">
            <div class="kpi-content">
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-value">
                <span v-if="key === 'avgRevenuePerSKU'">{{ formatCurrency(kpi.value) }}</span>
                <span v-else>{{ formatNumber(kpi.value) }}{{ kpi.unit }}</span>
              </div>
              <div class="kpi-change" :class="kpi.change > 0 ? 'positive' : 'negative'">
                <span>{{ kpi.change > 0 ? '▲' : '▼' }}</span>
                <span>{{ Math.abs(kpi.change) }}{{ key === 'avgRevenuePerSKU' || key === 'inventoryTurnover' ? '%' : kpi.unit }}</span>
                <span class="period">vs 지난주</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Charts Row 1: Trend & Category Distribution -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <BaseCard>
            <VueApexCharts
              type="line"
              height="350"
              :options="productTrendOptions"
              :series="productTrendSeries"
            />
          </BaseCard>
        </div>
        <div class="col-lg-4">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">카테고리별 매출 분포</h6>
            </template>
            <VueApexCharts
              type="donut"
              height="320"
              :options="categoryChartOptions"
              :series="categoryChartSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Category Performance Table -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <h6 class="mb-0">카테고리별 성과 분석</h6>
            </template>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th>총 매출</th>
                    <th>판매 수량</th>
                    <th>평균 단가</th>
                    <th>성장률</th>
                    <th>마진율</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in categoryPerformanceData" :key="cat.category">
                    <td>
                      <span :class="getCategoryBadgeClass(cat.category)">
                        {{ cat.category }}
                      </span>
                    </td>
                    <td class="fw-bold">{{ formatCurrency(cat.revenue) }}</td>
                    <td>{{ formatNumber(cat.quantity) }}개</td>
                    <td>{{ formatCurrency(cat.avgPrice) }}</td>
                    <td>
                      <span class="badge bg-success">
                        ▲ {{ cat.growth }}%
                      </span>
                    </td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div
                          class="progress-bar bg-info"
                          :style="{ width: cat.margin + '%' }"
                        >
                          {{ cat.margin }}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Charts Row 2: Size & Color Distribution Heatmaps -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="heatmap"
              height="280"
              :options="sizeHeatmapOptions"
              :series="sizeHeatmapSeries"
            />
          </BaseCard>
        </div>
        <div class="col-lg-6">
          <BaseCard>
            <VueApexCharts
              type="heatmap"
              height="280"
              :options="colorHeatmapOptions"
              :series="colorHeatmapSeries"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Product Performance Matrix -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <VueApexCharts
              type="scatter"
              height="350"
              :options="performanceMatrixOptions"
              :series="performanceMatrixSeries"
            />
            <div class="mt-3 p-3 bg-light rounded">
              <small class="text-muted">
                <strong>분석 가이드:</strong>
                우측 상단 영역(높은 판매량 + 높은 회전율) = 스타 상품 |
                좌측 하단 영역(낮은 판매량 + 낮은 회전율) = 재고 관리 필요 상품
              </small>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Top 20 Products Table -->
      <div class="row mb-4">
        <div class="col-12">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">🏆 TOP 20 인기 상품</h6>
                <button class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-file-excel"></i> 엑셀 다운로드
                </button>
              </div>
            </template>
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style="width: 60px;">순위</th>
                    <th>상품 코드</th>
                    <th>상품명</th>
                    <th>카테고리</th>
                    <th>총 매출</th>
                    <th>판매 수량</th>
                    <th>평균 단가</th>
                    <th>재고 상태</th>
                    <th>성장률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in topProductsData" :key="product.rank">
                    <td>
                      <div class="rank-badge" :class="'rank-' + product.rank">
                        {{ product.rank }}
                      </div>
                    </td>
                    <td class="text-muted small">{{ product.productId }}</td>
                    <td class="fw-bold">{{ product.name }}</td>
                    <td>
                      <span :class="getCategoryBadgeClass(product.category)">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="fw-bold">{{ formatCurrency(product.totalSales) }}</td>
                    <td>{{ formatNumber(product.quantity) }}개</td>
                    <td>{{ formatCurrency(product.avgPrice) }}</td>
                    <td>
                      <span :class="getStockLevelClass(product.stockLevel)">
                        {{ getStockLevelText(product.stockLevel) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-success">
                        ▲ {{ product.growth }}%
                      </span>
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
.products-detail {
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

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #000;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.progress {
  background-color: #e9ecef;
}

.progress-bar {
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
