<template>
  <div class="row">
    <div class="col-lg-8">
      <ShipmentMap :shipments="shipments" />
    </div>
    <div class="col-lg-4">
      <ShipmentList :shipments="shipments" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ShipmentMap from './shipment-tracking/ShipmentMap.vue';
import ShipmentList from './shipment-tracking/ShipmentList.vue';

const authStore = useAuthStore();

const allShipments = ref([
  { id: 'HYP-001', driver: '김기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', location: [37.504, 127.024] },
  { id: 'HYP-002', driver: '이기사', from: '부산 물류센터', to: 'HypeLink 부산점', status: '지연', location: [35.163, 129.160] },
  { id: 'HYP-003', driver: '박기사', from: '서울 본사', to: 'HypeLink 홍대점', status: '완료', location: [37.556, 126.922] },
  { id: 'HYP-004', driver: '최기사', from: '서울 본사', to: 'HypeLink 강남점', status: '배송중', location: [37.534, 126.990] },
]);

const shipments = computed(() => {
  if (authStore.isStoreOwner) {
    return allShipments.value.filter(s => s.to === authStore.user.name);
  }
  return allShipments.value;
});
</script>