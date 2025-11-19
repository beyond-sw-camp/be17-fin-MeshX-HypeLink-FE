<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getCustomerRFM } from '@/api/analytics';

const rfmData = ref([]);
const isLoading = ref(true);

const loadRFMData = async () => {
  isLoading.value = true;
  try {
    const response = await getCustomerRFM(50);
    if (response?.data && Array.isArray(response.data)) {
      rfmData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load RFM data:', error);
  } finally {
    isLoading.value = false;
  }
};

const getSegmentBadgeClass = (segment) => {
  const classes = {
    'VIP': 'badge bg-danger',
    '충성고객': 'badge bg-success',
    '잠재고객': 'badge bg-info',
    '이탈위험': 'badge bg-warning text-dark',
    '휴면고객': 'badge bg-secondary'
  };
  return classes[segment] || 'badge bg-secondary';
};

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

onMounted(() => {
  loadRFMData();
});
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-0">👥 고객 RFM 분석</h6>
        <button class="btn btn-sm btn-outline-primary" @click="loadRFMData">
          새로고침
        </button>
      </div>
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
            <th>고객명</th>
            <th>세그먼트</th>
            <th>RFM 점수</th>
            <th class="text-end">최근 주문</th>
            <th class="text-end">주문 횟수</th>
            <th class="text-end">총 구매액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(customer, index) in rfmData" :key="customer.customerId">
            <td>{{ index + 1 }}</td>
            <td>
              <div>
                <div class="fw-bold">{{ customer.customerName }}</div>
                <small class="text-muted">{{ customer.customerEmail }}</small>
              </div>
            </td>
            <td>
              <span :class="getSegmentBadgeClass(customer.segment)">
                {{ customer.segment }}
              </span>
            </td>
            <td>
              <div class="d-flex gap-1">
                <span class="badge bg-primary">R:{{ customer.recencyScore }}</span>
                <span class="badge bg-success">F:{{ customer.frequencyScore }}</span>
                <span class="badge bg-warning text-dark">M:{{ customer.monetaryScore }}</span>
              </div>
              <small class="text-muted">{{ customer.rfmScore?.toFixed(2) }}</small>
            </td>
            <td class="text-end">{{ customer.daysSinceLastOrder }}일 전</td>
            <td class="text-end">{{ customer.totalOrders }}회</td>
            <td class="text-end fw-bold">{{ formatCurrency(customer.totalSpent) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && rfmData.length === 0" class="text-center py-4 text-muted">
      데이터가 없습니다.
    </div>
  </BaseCard>
</template>

<style scoped>
.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
