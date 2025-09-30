<template>
  <div v-if="authStore.isLoggedIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="mb-0">{{ authStore.user.name }} 관리</h3>
      <span class="badge fs-6" :class="myStore.status === '운영중' ? 'bg-success' : 'bg-danger'">{{ myStore.status }}</span>
    </div>
    <div class="row">
      <div class="col-md-12">
        <StoreInfoCard :store="myStore" />
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
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';
import StoreInfoCard from './my-store/StoreInfoCard.vue';

const authStore = useAuthStore();

const myStore = ref(
  { id: 1, name: 'HypeLink 강남점', address: '서울시 강남구 테헤란로', owner: '최민성', phone: '010-1234-5678', status: '운영중' }
);
</script>