<script setup>
import { useAuthStore } from '@/stores/auth';
import AdminDashboard from './dashboard/AdminDashboard.vue';
import StoreOwnerDashboard from './dashboard/StoreOwnerDashboard.vue';
import BaseCard from '@/components/BaseCard.vue';

const authStore = useAuthStore();
</script>

<template>
  <div>
    <!-- 관리자일 경우 AdminDashboard를 보여줌 -->
    <AdminDashboard v-if="authStore.isAdmin" />

    <!-- 점주일 경우 StoreOwnerDashboard를 보여줌 -->
    <StoreOwnerDashboard v-else-if="authStore.isStoreOwner" />

    <!-- 로그아웃 상태일 경우 (또는 역할이 없을 경우) -->
    <div v-else>
      <BaseCard>
        <template #header><h5>HypeLink</h5></template>
        <p>HypeLink 대시보드에 오신 것을 환영합니다. 로그인하여 서비스를 이용해주세요.</p>
      </BaseCard>
    </div>
  </div>
</template>