<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import SalesOverview from './analytics/SalesOverview.vue';
import OrderOverview from './analytics/OrderOverview.vue';
import QuickInsight from './analytics/QuickInsight.vue';
import SalesTrendChart from './analytics/SalesTrendChart.vue';
import OrderTrendChart from './analytics/OrderTrendChart.vue';
import TopStoresTable from './analytics/TopStoresTable.vue';
import TopProductsTable from './analytics/TopProductsTable.vue';
import CategoryChart from './analytics/CategoryChart.vue';
import LowStockTable from './analytics/LowStockTable.vue';
import CustomerRFMTable from './analytics/CustomerRFMTable.vue';
import ProductABCChart from './analytics/ProductABCChart.vue';
import { getTopStores, getTopProducts, getLowStockItems } from '@/api/analytics';

const isLoading = ref(true);
const selectedPeriod = ref('weekly');

// Quick View 데이터
const quickViewStores = ref([]);
const quickViewProducts = ref([]);
const quickViewLowStock = ref([]);

const periods = [
  { value: 'daily', label: '오늘' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'custom', label: '커스텀' }
];

const customDateRange = ref({
  startDate: '',
  endDate: ''
});

// Quick View 데이터 로드
const loadQuickViewData = async () => {
  try {
    // TOP 3 매장
    const storesResponse = await getTopStores(selectedPeriod.value, 3);
    if (storesResponse.data) {
      quickViewStores.value = storesResponse.data.map(store => ({
        name: store.memberName || '알 수 없음',
        value: store.totalRevenue
      }));
    }

    // TOP 5 상품
    const productsResponse = await getTopProducts(selectedPeriod.value, 5);
    if (productsResponse.data) {
      quickViewProducts.value = productsResponse.data.map(product => ({
        name: product.koName || product.enName,
        count: product.quantity
      }));
    }

    // 재고 부족 TOP 3 (첫 페이지에서 3개만 가져오기)
    const lowStockResponse = await getLowStockItems(20, 0, 3);
    if (lowStockResponse.data && lowStockResponse.data.content) {
      quickViewLowStock.value = lowStockResponse.data.content.map(item => ({
        name: item.itemName,
        stock: item.currentStock,
        store: '본사' // TODO: 매장 정보 없음
      }));
    }
  } catch (error) {
    console.error('Failed to load quick view data:', error);
  }
};

const handlePeriodChange = (period) => {
  selectedPeriod.value = period;
  loadQuickViewData();
};

const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `₩${(value / 100000000).toFixed(1)}억`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(1)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await loadQuickViewData();
    await new Promise(resolve => setTimeout(resolve, 500)); // UI 로딩 효과
  } catch (error) {
    console.error('Failed to load analytics data:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="analytics-dashboard">
    <!-- Header with Period Selector -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-0">📊 통합 분석 대시보드</h2>
          <div class="period-selector">
            <div class="btn-group" role="group">
              <button
                v-for="period in periods"
                :key="period.value"
                type="button"
                class="btn"
                :class="selectedPeriod === period.value ? 'btn-primary' : 'btn-outline-primary'"
                @click="handlePeriodChange(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Date Range -->
        <div v-if="selectedPeriod === 'custom'" class="mt-3">
          <div class="row">
            <div class="col-md-3">
              <input
                type="date"
                class="form-control"
                v-model="customDateRange.startDate"
                placeholder="시작일"
              />
            </div>
            <div class="col-md-3">
              <input
                type="date"
                class="form-control"
                v-model="customDateRange.endDate"
                placeholder="종료일"
              />
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary w-100" @click="handlePeriodChange('custom')">
                조회
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseSpinner v-if="isLoading" height="400px" />

    <div v-else>
      <!-- Quick Insight -->
      <QuickInsight />

      <!-- Sales Overview -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="section-header">
            <h5 class="mb-0">💰 매출 현황</h5>
            <router-link to="/analytics/sales" class="btn btn-sm btn-outline-primary">
              자세히 보기 →
            </router-link>
          </div>
        </div>
      </div>
      <SalesOverview :period="selectedPeriod" />

      <!-- Order Overview -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="section-header">
            <h5 class="mb-0">📦 주문 현황</h5>
            <router-link to="/analytics/orders" class="btn btn-sm btn-outline-primary">
              자세히 보기 →
            </router-link>
          </div>
        </div>
      </div>
      <OrderOverview :period="selectedPeriod" />

      <!-- Quick View Section -->
      <div class="row mb-3">
        <div class="col-12">
          <h5 class="mb-3">🏆 Quick View</h5>
        </div>
      </div>

      <!-- Trend Charts (Mini) -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <div class="chart-wrapper">
            <SalesTrendChart :period="selectedPeriod" />
            <div class="chart-overlay">
              <router-link to="/analytics/sales" class="btn btn-primary btn-sm">
                매출 상세 분석 →
              </router-link>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="chart-wrapper">
            <OrderTrendChart :period="selectedPeriod" />
            <div class="chart-overlay">
              <router-link to="/analytics/orders" class="btn btn-primary btn-sm">
                주문 상세 분석 →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 3 Stores & Top 5 Products & Low Stock -->
      <div class="row mb-4">
        <div class="col-lg-4">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">🏪 TOP 3 매장</h6>
                <router-link to="/analytics/stores" class="btn btn-sm btn-link p-0">
                  전체보기 →
                </router-link>
              </div>
            </template>
            <div class="quick-list">
              <div class="quick-item" v-for="(store, index) in quickViewStores" :key="index">
                <span class="rank">{{ index + 1 }}</span>
                <span class="name">{{ store.name }}</span>
                <span class="value">{{ formatCurrency(store.value) }}</span>
              </div>
              <div v-if="quickViewStores.length === 0" class="text-center text-muted py-3">
                데이터가 없습니다
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-lg-4">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">🛍️ TOP 5 상품</h6>
                <router-link to="/analytics/products" class="btn btn-sm btn-link p-0">
                  전체보기 →
                </router-link>
              </div>
            </template>
            <div class="quick-list">
              <div class="quick-item" v-for="(product, index) in quickViewProducts" :key="index">
                <span class="rank">{{ index + 1 }}</span>
                <span class="name">{{ product.name }}</span>
                <span class="value">{{ product.count }}개</span>
              </div>
              <div v-if="quickViewProducts.length === 0" class="text-center text-muted py-3">
                데이터가 없습니다
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-lg-4">
          <BaseCard>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">⚠️ 재고 부족</h6>
                <router-link to="/analytics/inventory" class="btn btn-sm btn-link p-0">
                  전체보기 →
                </router-link>
              </div>
            </template>
            <div class="quick-list">
              <div class="quick-item alert-item" v-for="(item, index) in quickViewLowStock" :key="index">
                <span class="rank danger">!</span>
                <div class="item-info">
                  <div class="name">{{ item.name }}</div>
                  <div class="sub-info">{{ item.store }}</div>
                </div>
                <span class="value danger">{{ item.stock }}개</span>
              </div>
              <div v-if="quickViewLowStock.length === 0" class="text-center text-muted py-3">
                데이터가 없습니다
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- Advanced Analytics Section -->
      <div class="row mb-3 mt-5">
        <div class="col-12">
          <h5 class="mb-3">🎯 고급 분석</h5>
        </div>
      </div>

      <!-- RFM & ABC Analysis -->
      <div class="row mb-4">
        <div class="col-12 mb-4">
          <ProductABCChart />
        </div>
        <div class="col-12">
          <CustomerRFMTable />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-dashboard {
  padding: 20px 0;
}

.period-selector .btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.period-selector .btn-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 2px solid #e9ecef;
}

.chart-wrapper {
  position: relative;
}

.chart-overlay {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.chart-wrapper:hover .chart-overlay {
  opacity: 1;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.quick-item:hover {
  background-color: #e9ecef;
  transform: translateX(4px);
}

.quick-item .rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.quick-item .rank.danger {
  background: #dc3545;
}

.quick-item .name {
  flex: 1;
  font-weight: 500;
  color: #212529;
  font-size: 0.9rem;
}

.quick-item .value {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.quick-item .value.danger {
  color: #dc3545;
}

.quick-item.alert-item {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
}

.quick-item.alert-item:hover {
  background-color: #ffe69c;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.item-info .name {
  font-size: 0.9rem;
  font-weight: 600;
}

.item-info .sub-info {
  font-size: 0.75rem;
  color: #6c757d;
}
</style>
