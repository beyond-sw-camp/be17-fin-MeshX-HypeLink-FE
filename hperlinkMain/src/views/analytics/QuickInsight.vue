<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getSalesOverview, getTopProducts, getTopStores } from '@/api/analytics';

const insights = ref({
  todayRevenue: 0,
  dailyGrowth: 0,
  topProduct: '로딩 중...',
  topStore: '로딩 중...',
  totalOrders: 0,
  avgOrderValue: 0
});

const loadInsights = async () => {
  try {
    // 오늘 매출 데이터
    const salesResponse = await getSalesOverview('daily');
    if (salesResponse?.data) {
      insights.value.todayRevenue = salesResponse.data.totalRevenue || 0;
      insights.value.dailyGrowth = salesResponse.data.growthRate || 0;
      insights.value.totalOrders = salesResponse.data.totalTransactions || 0;
      insights.value.avgOrderValue = salesResponse.data.avgOrderValue || 0;
    }

    // 최고 매출 상품
    const productsResponse = await getTopProducts('daily', 1);
    if (productsResponse?.data && productsResponse.data.length > 0) {
      insights.value.topProduct = productsResponse.data[0].productName || productsResponse.data[0].itemName || '데이터 없음';
    }

    // 최고 매출 매장
    const storesResponse = await getTopStores('daily', 1);
    if (storesResponse?.data && storesResponse.data.length > 0) {
      insights.value.topStore = storesResponse.data[0].storeName || storesResponse.data[0].memberName || '데이터 없음';
    }
  } catch (error) {
    console.error('Failed to load insights:', error);
  }
};

const formatCurrency = (value) => {
  if (value >= 100000000) {
    return `₩${(value / 100000000).toFixed(1)}억`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(1)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

onMounted(() => {
  loadInsights();
});
</script>

<template>
  <div class="row mb-4">
    <div class="col-12">
      <BaseCard class="quick-insight-card">
        <template #header>
          <h5 class="mb-0">📊 오늘의 요약</h5>
        </template>

        <div class="insights-grid">
          <div class="insight-item">
            <div class="insight-icon">💰</div>
            <div class="insight-content">
              <div class="insight-label">실시간 매출</div>
              <div class="insight-value">{{ formatCurrency(insights.todayRevenue) }}</div>
              <div class="insight-sub" :class="insights.dailyGrowth >= 0 ? 'text-success' : 'text-danger'">
                전일 대비: {{ insights.dailyGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(insights.dailyGrowth).toFixed(1) }}%
              </div>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon">🏆</div>
            <div class="insight-content">
              <div class="insight-label">가장 잘 팔린 상품</div>
              <div class="insight-value small">{{ insights.topProduct }}</div>
              <div class="insight-sub">오늘의 베스트셀러</div>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon">🏪</div>
            <div class="insight-content">
              <div class="insight-label">최고 매출 매장</div>
              <div class="insight-value small">{{ insights.topStore }}</div>
              <div class="insight-sub">오늘의 TOP 매장</div>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon">📦</div>
            <div class="insight-content">
              <div class="insight-label">오늘의 주문</div>
              <div class="insight-value">{{ insights.totalOrders }}건</div>
              <div class="insight-sub">평균 객단가: {{ formatCurrency(insights.avgOrderValue) }}</div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.quick-insight-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.quick-insight-card :deep(.card-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-insight-card :deep(.card-header h5) {
  color: white;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.insight-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.insight-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.insight-content {
  flex: 1;
}

.insight-label {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.insight-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.insight-value.small {
  font-size: 1.25rem;
}

.insight-sub {
  font-size: 0.8rem;
  opacity: 0.85;
  font-weight: 500;
}

.text-success {
  color: #4ade80 !important;
}

.text-danger {
  color: #f87171 !important;
}

@media (max-width: 768px) {
  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>
