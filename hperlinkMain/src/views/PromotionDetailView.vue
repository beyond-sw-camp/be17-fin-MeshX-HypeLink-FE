<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getPromotionDetail } from '@/api/promotion';
import { useToastStore } from '@/stores/toast';

const apexchart = VueApexCharts;
const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const promotionId = parseInt(route.params.id);
const promotion = ref(null);
const isLoading = ref(true);

// 프로모션 상세 정보 로드
onMounted(async () => {
  try {
    const res = await getPromotionDetail(promotionId);
    
    // 응답 구조 자동 감지
    let data = null;
    if (res.data?.data) {
      data = res.data.data;
    } else if (res.data) {
      data = res.data;
    }

    if (data) {
      promotion.value = {
        id: data.id,
        name: data.title,
        title: data.title,
        period: `${data.startDate} ~ ${data.endDate}`,
        couponType: data.couponType,
        couponId: data.couponId,
        couponName: data.couponName || '쿠폰 정보 없음',
        status: data.status,
        description: data.contents,
      };
    }
  } catch (error) {
    console.error('프로모션 상세 정보 로드 실패:', error);
    toastStore.showToast('프로모션 정보를 불러올 수 없습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
});

const getStatusLabel = (status) => {
  switch (status) {
    case 'ONGOING': return '진행중';
    case 'UPCOMING': return '예정';
    case 'ENDED': return '종료';
    default: return '알 수 없음';
  }
};

const getCouponTypeLabel = (type) => {
  switch (type) {
    case 'PERCENTAGE': return '퍼센트 할인';
    case 'FIXED': return '고정 할인';
    default: return type;
  }
};

const statusClass = (status) => {
  switch (status) {
    case 'ONGOING': return 'bg-primary';
    case 'UPCOMING': return 'bg-info';
    case 'ENDED': return 'bg-secondary';
    default: return 'bg-light';
  }
};

// 매출 변화 차트 데이터 (임시 더미 데이터)
const salesChartSeries = computed(() => {
  if (!promotion.value) return [];
  
  // 백엔드에서 salesImpact 데이터가 오면 사용, 없으면 더미 데이터
  if (promotion.value.salesImpact) {
    return [
      { name: '프로모션 전', data: promotion.value.salesImpact.before },
      { name: '프로모션 중', data: promotion.value.salesImpact.during },
      { name: '프로모션 후', data: promotion.value.salesImpact.after },
    ];
  }
  
  // 더미 데이터
  return [
    { name: '프로모션 전', data: [320, 350, 380, 420, 450] },
    { name: '프로모션 중', data: [580, 620, 690, 750, 820] },
    { name: '프로모션 후', data: [480, 510, 530, 560, 590] },
  ];
});

const salesChartOptions = computed(() => ({
  chart: { 
    type: 'line', 
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  stroke: { 
    curve: 'smooth',
    width: 3,
  },
  xaxis: { 
    categories: promotion.value?.salesImpact?.labels || ['1주차', '2주차', '3주차', '4주차', '5주차'],
    title: { text: '기간' },
  },
  yaxis: { 
    title: { text: '매출액 (만원)' },
  },
  colors: ['#6c757d', '#0d6efd', '#28a745'],
  legend: {
    position: 'top',
    horizontalAlign: 'center',
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + '만원';
      }
    }
  },
}));
</script>

<template>
  <div>
    <BaseSpinner v-if="isLoading" height="400px" />
    
    <BaseCard v-else-if="promotion">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ promotion.title }} 상세 정보</h5>
          <button class="btn btn-sm btn-secondary" @click="router.back()">목록으로</button>
        </div>
      </template>
      
      <div class="row">
        <div class="col-md-6 mb-3">
          <p><strong>프로모션명:</strong> {{ promotion.title }}</p>
        </div>
        <div class="col-md-6 mb-3">
          <p><strong>상태:</strong> 
            <span class="badge" :class="statusClass(promotion.status)">
              {{ getStatusLabel(promotion.status) }}
            </span>
          </p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <p><strong>기간:</strong> {{ promotion.period }}</p>
        </div>
        <div class="col-md-6 mb-3">
          <p><strong>쿠폰 타입:</strong> {{ getCouponTypeLabel(promotion.couponType) }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-3">
          <p><strong>쿠폰:</strong> {{ promotion.couponName }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-3">
          <p><strong>설명:</strong></p>
          <p class="text-muted">{{ promotion.description || '설명이 없습니다.' }}</p>
        </div>
      </div>

      <hr class="my-4">
      <h5 class="mb-3">📈 프로모션 매출 변화 분석</h5>
      <apexchart 
        type="line" 
        height="350" 
        :options="salesChartOptions" 
        :series="salesChartSeries"
      />
    </BaseCard>
    
    <BaseCard v-else>
      <p class="text-center text-muted">프로모션 정보를 찾을 수 없습니다.</p>
    </BaseCard>
  </div>
</template>