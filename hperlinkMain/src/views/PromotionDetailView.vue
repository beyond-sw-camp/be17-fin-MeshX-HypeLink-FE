<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { getPromotionDetail } from '@/api/promotion';
import { useToastStore } from '@/stores/toast';
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
        images: data.images || [],
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
</script>

<template>
  <div>
    <BaseSpinner v-if="isLoading" height="400px" />
    
    <BaseCard v-else-if="promotion">
      <template #header>
        <h5 class="mb-0">{{ promotion.title }} 상세 정보</h5>
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

      <!-- 이미지 영역 -->
      <div v-if="promotion.images && promotion.images.length > 0" class="mt-4">
        <p><strong>이미지:</strong></p>
        <div class="image-gallery">
          <div v-for="image in promotion.images" :key="image.id" class="image-item">
            <img :src="image.imageUrl" :alt="image.originalName" class="img-fluid rounded shadow-sm" style="max-width: 100%; height: auto; border: 1px solid #eee;">
          </div>
        </div>
      </div>
    </BaseCard>
    
    <BaseCard v-else>
      <p class="text-center text-muted">프로모션 정보를 찾을 수 없습니다.</p>
    </BaseCard>
  </div>
</template>

<style scoped>
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-item {
  width: 100%;
  text-align: center;
}

.img-fluid {
  max-width: 100%;
  height: auto;
  border: 1px solid #eee;
}
</style>