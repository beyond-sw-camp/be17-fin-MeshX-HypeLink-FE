<template>
  <BaseCard>
    <template #header><h5>점포 기본 정보</h5></template>
    <ul class="list-group list-group-flush">
      <li class="list-group-item"><b>점주:</b> {{ store.owner }}</li>
      <li class="list-group-item"><b>주소:</b> {{ store.address }}</li>
      <li class="list-group-item"><b>연락처:</b> {{ store.phone }}</li>
    </ul>
  </BaseCard>
</template>
<script setup>
import BaseCard from '@/components/BaseCard.vue';
defineProps({ store: Object });
</script>
