<template>
  <BaseCard>
    <template #header><h5>카테고리별 매출 비중 (차트 클릭)</h5></template>
    <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const props = defineProps({ series: Array, categories: Array });
const emit = defineEmits(['data-point-selected']);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const selectedLabel = config.w.config.xaxis.categories[config.dataPointIndex];
        emit('data-point-selected', selectedLabel);
      }
    }
  },
  plotOptions: { bar: { borderRadius: 4, horizontal: false, } },
  xaxis: { categories: props.categories },
  yaxis: { title: { text: '매출액 (억원)' } }
}));
</script>