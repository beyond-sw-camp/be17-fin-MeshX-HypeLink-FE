<script setup>
import { ref, computed, onMounted  } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';
import { usePromotionStore } from '@/stores/promotions';
import { getPromotionDetail } from '@/api/promotion'; 

const apexchart = VueApexCharts;
const route = useRoute();
const router = useRouter();
const promotionStore = usePromotionStore();


const promotionId = parseInt(route.params.id);
const promotion = computed(() => 
  promotionStore.allPromotions.find(p => p.id === promotionId)
);

const statusClass = (status) => {
  if (status === '진행중') return 'bg-primary';
  if (status === '예정') return 'bg-info';
  if (status === '종료') return 'bg-secondary';
  return 'bg-light';
};

// 매출 변화 차트 데이터
const salesChartSeries = computed(() => {
  if (!promotion.value || !promotion.value.salesImpact) return [];
  const impact = promotion.value.salesImpact;
  return [
    { name: '프로모션 전', data: impact.before },
    { name: '프로모션 중', data: impact.during },
    { name: '프로모션 후', data: impact.after },
  ];
});

const salesChartOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth' },
  xaxis: { categories: promotion.value?.salesImpact?.labels || [] },
  yaxis: { title: { text: '매출액 (단위: 만원)' } },
  colors: ['#6c757d', '#0d6efd', '#28a745'],
}));
</script>

<template>
  <div>
    <BaseCard v-if="promotion">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ promotion.name }} 상세 정보</h5>
          <button class="btn btn-sm btn-secondary" @click="router.back()">목록으로</button>
        </div>
      </template>
      <div class="mb-3">
        <p><strong>기간:</strong> {{ promotion.period }}</p>
        <p><strong>대상:</strong> {{ promotion.target }}</p>
        <p><strong>상태:</strong> <span class="badge" :class="statusClass(promotion.status)">{{ promotion.status }}</span></p>
        <p><strong>설명:</strong> {{ promotion.description }}</p>
      </div>
      <hr>
      <h5>프로모션 매출 변화 분석</h5>
      <apexchart type="line" height="350" :options="salesChartOptions" :series="salesChartSeries"></apexchart>
    </BaseCard>
    <BaseCard v-else>
      <p>프로모션 정보를 찾을 수 없습니다.</p>
    </BaseCard>
  </div>
</template>