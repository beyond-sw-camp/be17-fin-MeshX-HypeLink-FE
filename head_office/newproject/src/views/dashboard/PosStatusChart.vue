<script setup>
import { ref } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

const series = ref([350, 45, 12]);
const chartOptions = ref({
  chart: { type: 'donut' },
  labels: ['Online', 'Offline', 'Error'],
  colors: ['#28a745', '#6c757d', '#dc3545'],
  legend: { position: 'bottom' }
});
</script>

<template>
  <BaseCard>
    <template #header><h5>POS 기기 상태</h5></template>
    <apexchart type="donut" height="300" :options="chartOptions" :series="series"></apexchart>
  </BaseCard>
</template>