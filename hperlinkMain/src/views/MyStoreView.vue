<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const toastStore = useToastStore();

const myStore = ref(null);
const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    // 실제로는 로그인된 사용자 정보(authStore.user.name)를 기반으로 API를 호출하여
    // 해당 점포의 상세 데이터를 가져와야 합니다.
    // 여기서는 하드코딩된 샘플 데이터를 사용합니다.
    if (authStore.user?.name === 'HypeLink 강남점') {
      myStore.value = 
        { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', owner: '최민성', phone: '010-1234-5678', status: '운영중' };
      toastStore.showToast('매장 정보를 불러왔습니다.', 'info');
    } else {
      toastStore.showToast('해당 매장 정보를 찾을 수 없습니다.', 'danger');
    }
    isLoading.value = false;
  }, 1000);
});
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">{{ authStore.user.name }} 관리</h3>
      <span v-if="myStore" class="badge fs-6" :class="myStore.status === '운영중' ? 'bg-success' : 'bg-danger'">{{ myStore.status }}</span>
    </div>

    <BaseSpinner v-if="isLoading" height="200px" />

    <div v-else-if="myStore">
      <div class="row">
        <div class="col-md-12">
          <BaseCard>
            <template #header><h5>점포 기본 정보</h5></template>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><b>점주:</b> {{ myStore.owner }}</li>
              <li class="list-group-item"><b>주소:</b> {{ myStore.address }}</li>
              <li class="list-group-item"><b>연락처:</b> {{ myStore.phone }}</li>
            </ul>
          </BaseCard>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <BaseCard>
            <template #header><h5>금일 매출 현황</h5></template>
            <h2 class="text-center">1,250,000 원</h2>
          </BaseCard>
        </div>
        <div class="col-md-6">
          <BaseCard>
            <template #header><h5>재고 현황 요약</h5></template>
            <p>품절 임박 상품: <strong>2</strong>개</p>
          </BaseCard>
        </div>
      </div>
    </div>
    <BaseEmptyState v-else message="내 매장 정보를 찾을 수 없습니다." />
  </div>
</template>
