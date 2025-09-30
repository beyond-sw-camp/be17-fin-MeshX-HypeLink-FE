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
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useShipmentStore } from '@/stores/shipments';
import ShipmentMap from './shipment-tracking/ShipmentMap.vue';
import ShipmentList from './shipment-tracking/ShipmentList.vue';

const authStore = useAuthStore();
const shipmentStore = useShipmentStore();

const shipments = computed(() => {
  if (authStore.isStoreOwner) {
    return shipmentStore.allShipments.filter(s => s.to === authStore.user.name);
  }
  return shipmentStore.allShipments;
});
</script>