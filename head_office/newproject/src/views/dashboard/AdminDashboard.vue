<template>
  <div class="row">
    <div class="col-md-3">
      <KpiCard title="총 매출" value="12,875,000 원" color="primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-currency-dollar text-primary" viewBox="0 0 16 16"><path d="M4 10.781c.148 1.667 1.513 2.85 3.591 2.85c2.08 0 3.471-1.135 3.471-2.85c0-1.592-1.153-2.246-3.016-2.651C5.402 7.57 4.438 7.107 4.438 6.102c0-.998.817-1.657 2.177-1.657c1.294 0 2.08.622 2.08 1.657h1.453c-.148-1.791-1.37-3.03-3.532-3.03c-2.138 0-3.404 1.23-3.404 2.955c0 1.44.893 2.143 2.988 2.621c2.02.468 2.913.944 2.913 2.085c0 1.222-.933 1.92-2.384 1.92c-1.337 0-2.26-.68-2.26-1.92H4z"/></svg>
      </KpiCard>
    </div>
    <div class="col-md-3">
      <KpiCard title="총 매장 수" value="4 개" color="info">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-shop text-info" viewBox="0 0 16 16"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/></svg>
      </KpiCard>
    </div>
    <div class="col-md-3">
      <KpiCard title="미처리 AS" value="2 건" color="warning">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-tools text-warning" viewBox="0 0 16 16"><path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851l2.654-2.617.968.968-.305.914a1 1 0 0 0 .242 1.023l3.356 3.356a1 1 0 0 0 1.414 0l1.586-1.586a1 1 0 0 0 0-1.414l-3.356-3.356a1 1 0 0 0-1.023-.242L10.5 9.5l-.96-.96 2.675-2.675A1 1 0 0 1 13 5.889h.07a1 1 0 0 0 .815-.419L16 1 15 0 1 0zM11.354 4.646a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
      </KpiCard>
    </div>
    <div class="col-md-3">
      <KpiCard title="총 사용자" value="12 명" color="success">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-people-fill text-success" viewBox="0 0 16 16"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>
      </KpiCard>
    </div>
  </div>
  <div class="row mt-4">
    <div class="col-lg-8">
      <SalesChartCard :chartOptions="salesChart.chartOptions" :series="salesChart.series" />
    </div>
    <div class="col-lg-4">
      <PosStatusChart />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import KpiCard from './KpiCard.vue';
import PosStatusChart from './PosStatusChart.vue';
import SalesChartCard from './SalesChartCard.vue';

const salesChart = ref({
  series: [{
    name: '매출',
    data: [30, 40, 45, 50, 49, 60, 70, 91],
  }],
  chartOptions: {
    chart: { id: 'admin-sales-chart', toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] },
    colors: ['#0d6efd']
  }
});
</script>
