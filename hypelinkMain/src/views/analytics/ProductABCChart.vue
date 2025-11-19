<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getProductABC } from '@/api/analytics';

const abcData = ref([]);
const isLoading = ref(true);

const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 400,
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`
  },
  xaxis: {
    categories: [],
    labels: {
      rotate: -45,
      style: { fontSize: '10px' }
    }
  },
  yaxis: {
    title: { text: '매출 기여도 (%)' }
  },
  colors: [],
  legend: { show: false },
  title: {
    text: '상품별 매출 기여도 (ABC 분석)',
    align: 'left'
  }
});

const chartSeries = ref([{
  name: '매출 기여도',
  data: []
}]);

const loadABCData = async () => {
  isLoading.value = true;
  try {
    const response = await getProductABC('monthly');
    if (response?.data && Array.isArray(response.data)) {
      abcData.value = response.data;

      // 차트 데이터 업데이트
      const top20 = response.data.slice(0, 20);
      chartOptions.value.xaxis.categories = top20.map(p => p.productName);
      chartSeries.value[0].data = top20.map(p => p.revenuePercentage);

      // ABC 등급별 색상
      chartOptions.value.colors = top20.map(p => {
        if (p.abcGrade === 'A') return '#dc3545';
        if (p.abcGrade === 'B') return '#ffc107';
        return '#28a745';
      });
    }
  } catch (error) {
    console.error('Failed to load ABC data:', error);
  } finally {
    isLoading.value = false;
  }
};

const getGradeBadgeClass = (grade) => {
  const classes = {
    'A': 'badge bg-danger',
    'B': 'badge bg-warning text-dark',
    'C': 'badge bg-success'
  };
  return classes[grade] || 'badge bg-secondary';
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
  loadABCData();
});
</script>

<template>
  <div class="row">
    <!-- 차트 -->
    <div class="col-lg-8 mb-3">
      <BaseCard>
        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩중...</span>
          </div>
        </div>
        <VueApexCharts
          v-else
          type="bar"
          height="400"
          :options="chartOptions"
          :series="chartSeries"
        />
      </BaseCard>
    </div>

    <!-- ABC 요약 -->
    <div class="col-lg-4 mb-3">
      <BaseCard>
        <template #header>
          <h6 class="mb-0">📊 ABC 등급 요약</h6>
        </template>

        <div v-if="!isLoading" class="abc-summary">
          <div class="summary-item grade-a">
            <div class="grade-label">
              <span class="badge bg-danger">A 등급</span>
              <small>상위 20% (핵심 상품)</small>
            </div>
            <div class="grade-count">
              {{ abcData.filter(p => p.abcGrade === 'A').length }}개
            </div>
            <div class="grade-revenue">
              누적: {{ abcData.filter(p => p.abcGrade === 'A')[0]?.cumulativePercentage?.toFixed(1) || 0 }}%
            </div>
          </div>

          <div class="summary-item grade-b">
            <div class="grade-label">
              <span class="badge bg-warning text-dark">B 등급</span>
              <small>중위 30% (보통 상품)</small>
            </div>
            <div class="grade-count">
              {{ abcData.filter(p => p.abcGrade === 'B').length }}개
            </div>
          </div>

          <div class="summary-item grade-c">
            <div class="grade-label">
              <span class="badge bg-success">C 등급</span>
              <small>하위 50% (관리 상품)</small>
            </div>
            <div class="grade-count">
              {{ abcData.filter(p => p.abcGrade === 'C').length }}개
            </div>
          </div>

          <div class="mt-3 p-3 bg-light rounded">
            <small class="text-muted">
              <strong>💡 분석 팁:</strong><br>
              A등급 상품 집중 관리, B등급 프로모션 고려, C등급 재고 최소화
            </small>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 상세 테이블 -->
    <div class="col-12">
      <BaseCard>
        <template #header>
          <h6 class="mb-0">📋 상품별 상세 분석</h6>
        </template>

        <div v-if="isLoading" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">로딩중...</span>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>순위</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>등급</th>
                <th class="text-end">총 매출</th>
                <th class="text-end">매출 비중</th>
                <th class="text-end">누적 비중</th>
                <th>권장사항</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in abcData.slice(0, 30)" :key="product.productId">
                <td>{{ product.ranking }}</td>
                <td class="fw-bold">{{ product.productName }}</td>
                <td>{{ product.categoryName }}</td>
                <td>
                  <span :class="getGradeBadgeClass(product.abcGrade)">
                    {{ product.abcGrade }}
                  </span>
                </td>
                <td class="text-end">{{ formatCurrency(product.totalRevenue) }}</td>
                <td class="text-end">{{ product.revenuePercentage?.toFixed(2) }}%</td>
                <td class="text-end fw-bold">{{ product.cumulativePercentage?.toFixed(2) }}%</td>
                <td>
                  <small class="text-muted">{{ product.recommendation }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.abc-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.grade-a {
  background-color: #f8d7da;
  border-left-color: #dc3545;
}

.grade-b {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.grade-c {
  background-color: #d1e7dd;
  border-left-color: #28a745;
}

.grade-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.grade-count {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.grade-revenue {
  font-size: 0.9rem;
  color: #6c757d;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
