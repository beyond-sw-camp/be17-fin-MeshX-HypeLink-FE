<template>
  <BaseCard>
    <template #header><h5>{{ authStore.user.name }}님, 환영합니다.</h5></template>
    <p>좌측 메뉴를 통해 매장을 관리하고, 필요한 지원을 요청할 수 있습니다.</p>
    <router-link to="/my-store" class="btn btn-primary">내 점포 관리 바로가기</router-link>
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/BaseCard.vue';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
</script>
