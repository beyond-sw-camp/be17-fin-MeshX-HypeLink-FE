<script setup>
import BaseCard from '@/components/BaseCard.vue';
defineProps({ shipments: Array });
const statusClass = (status) => {
  if (status === '배송중') return 'bg-primary';
  if (status === '지연') return 'bg-danger';
  if (status === '완료') return 'bg-success';
  return 'bg-secondary';
};
</script>

<template>
  <BaseCard>
    <template #header><h5>배송 목록</h5></template>
    <ul class="list-group list-group-flush">
      <li v-for="shipment in shipments" :key="shipment.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ shipment.id }}</strong> ({{ shipment.driver }})
          <div class="text-muted small">{{ shipment.from }} → {{ shipment.to }}</div>
        </div>
        <span class="badge" :class="statusClass(shipment.status)">{{ shipment.status }}</span>
      </li>
    </ul>
  </BaseCard>
</template>