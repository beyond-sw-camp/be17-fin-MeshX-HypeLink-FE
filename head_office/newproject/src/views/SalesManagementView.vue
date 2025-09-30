<template>
  <div>
    <SalesChart :chartOptions="salesChart.options" :series="salesChart.series" />
  </div>
</template>
<script setup>
import { ref } from 'vue';
import SalesChart from './sales-management/SalesChart.vue';
const salesChart = ref({
  series: [{
    name: '총 매출',
    data: [2.1, 2.5, 2.8, 3.5, 3.2, 4.0, 4.5, 4.1, 4.8],
  }],
  options: {
    chart: { id: 'sales-line-chart', toolbar: { show: false } },
    xaxis: { categories: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월'] },
    colors: ['#0d6efd'],
    stroke: { curve: 'smooth' },
    yaxis: { title: { text: '단위 (억원)' } }
  }
});
</script>