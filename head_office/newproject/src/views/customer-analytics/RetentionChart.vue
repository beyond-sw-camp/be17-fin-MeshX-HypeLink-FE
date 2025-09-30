<template>
  <BaseCard>
    <template #header><h5>신규 / 재방문 고객 추이</h5></template>
    <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const props = defineProps({ series: Array, categories: Array });

const chartOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  stroke: { curve: 'smooth' },
  xaxis: { categories: props.categories },
}));
</script>