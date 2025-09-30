<template>
  <BaseCard>
    <template #header><h5>실시간 배송 현황</h5></template>
    <div id="map-container" style="height: 600px;"></div>
  </BaseCard>
</template>
<script setup>
import { onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const props = defineProps({ shipments: Array });
onMounted(() => {
  const map = L.map("map-container").setView([36.5, 127.5], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap' }).addTo(map);
  props.shipments.forEach(shipment => {
    if (shipment.status !== '완료') {
      L.marker(shipment.location).addTo(map).bindPopup(`<b>${shipment.id}</b><br>${shipment.driver} 기사`);
    }
  });
});
</script>
