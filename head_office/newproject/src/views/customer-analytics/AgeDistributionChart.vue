<template>
  <BaseCard>
    <template #header><h5>연령대별 고객 분포 (차트 클릭)</h5></template>
    <apexchart type="donut" height="350" :options="chartOptions" :series="series"></apexchart>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const props = defineProps({ series: Array, labels: Array });
const emit = defineEmits(['data-point-selected']);

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const selectedLabel = config.w.config.labels[config.dataPointIndex];
        emit('data-point-selected', selectedLabel);
      }
    }
  },
  labels: props.labels,
  responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
}));
</script>