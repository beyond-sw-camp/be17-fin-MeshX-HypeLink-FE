<template>
  <BaseCard>
    <template #header><h5>월별 총 매출</h5></template>
    <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const props = defineProps({
  chartOptions: Object,
  series: Array
});

const chartOptions = computed(() => props.chartOptions);
</script>
