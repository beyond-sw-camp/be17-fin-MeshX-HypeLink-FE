<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getCategoryPerformance } from '@/api/analytics';

const props = defineProps({
  period: {
    type: String,
    default: 'weekly'
  }
});

// 실제 API 데이터
const categoryData = ref([]);

// 고정 색상 매핑
const colorMap = {
  '상의': '#0d6efd',
  '하의': '#198754',
  '아우터': '#ffc107',
  '악세서리': '#0dcaf0',
  '신발': '#6c757d'
};

// API 호출
const fetchCategoryData = async () => {
  try {
    const response = await getCategoryPerformance(props.period);
    if (response.data && response.data.length > 0) {
      const totalRevenue = response.data.reduce((sum, item) => sum + item.revenue, 0);

      categoryData.value = response.data.map(item => ({
        category: item.categoryName,
        sales: item.revenue,
        orders: item.quantity,
        percentage: totalRevenue > 0 ? (item.revenue * 100 / totalRevenue) : 0,
        color: colorMap[item.categoryName] || '#6c757d'
      }));
    }
  } catch (error) {
    console.error('Failed to fetch category data:', error);
  }
};

onMounted(() => {
  fetchCategoryData();
});

watch(() => props.period, () => {
  fetchCategoryData();
});

// 차트 옵션 (computed로 변경하여 동적으로 업데이트)
const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    height: 380
  },
  labels: categoryData.value.map(item => item.category),
  colors: categoryData.value.map(item => item.color),
  legend: {
    position: 'bottom',
    horizontalAlign: 'center'
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '16px',
            fontWeight: 600
          },
          value: {
            show: true,
            fontSize: '24px',
            fontWeight: 700,
            formatter: function (val) {
              return '₩' + (val / 10000).toFixed(0) + '만';
            }
          },
          total: {
            show: true,
            label: '전체 매출',
            fontSize: '14px',
            color: '#6c757d',
            formatter: function (w) {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return '₩' + (total / 100000000).toFixed(1) + '억';
            }
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(1) + '%';
    }
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return '₩' + (val / 10000).toFixed(0) + '만원';
      }
    }
  }
}));

const series = computed(() => categoryData.value.map(item => item.sales));

const categoryDetails = computed(() => categoryData.value);

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 class="mb-0">📊 카테고리별 분석</h5>
    </template>

    <div class="category-chart-container">
      <VueApexCharts
        type="donut"
        height="300"
        :options="chartOptions"
        :series="series"
      />

      <div class="category-details mt-3">
        <div
          v-for="category in categoryDetails"
          :key="category.category"
          class="category-item"
        >
          <div class="category-header">
            <div class="category-label">
              <span
                class="category-dot"
                :style="{ backgroundColor: category.color }"
              ></span>
              <span class="category-name">{{ category.category }}</span>
            </div>
            <span class="category-percentage">{{ category.percentage }}%</span>
          </div>
          <div class="category-stats">
            <span class="stat-item">매출: {{ formatCurrency(category.sales) }}</span>
            <span class="stat-divider">|</span>
            <span class="stat-item">주문: {{ category.orders }}건</span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.category-chart-container {
  padding: 0.5rem 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  transition: all 0.2s;
}

.category-item:hover {
  background-color: #e9ecef;
  transform: translateX(4px);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.category-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
}

.category-percentage {
  font-weight: 700;
  font-size: 1rem;
  color: #495057;
}

.category-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  padding-left: 1.5rem;
}

.stat-item {
  display: inline-block;
}

.stat-divider {
  color: #dee2e6;
}
</style>
