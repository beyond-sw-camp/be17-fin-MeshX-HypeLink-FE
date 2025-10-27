<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getOrderTrend } from '@/api/analytics';

const props = defineProps({
  period: {
    type: String,
    default: 'weekly'
  }
});

// 실제 API 데이터
const trendData = ref([]);

// API 호출
const fetchTrendData = async () => {
  try {
    const response = await getOrderTrend(props.period);
    if (response.data && response.data.length > 0) {
      trendData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch order trend:', error);
  }
};

onMounted(() => {
  fetchTrendData();
});

watch(() => props.period, () => {
  fetchTrendData();
});

// 차트 옵션 (computed로 동적 업데이트)
const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: {
      show: true
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  colors: ['#198754', '#ffc107', '#dc3545'],
  xaxis: {
    categories: trendData.value.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    title: {
      text: '날짜'
    }
  },
  yaxis: {
    title: {
      text: '주문 건수 (건)'
    }
  },
  fill: {
    opacity: 1
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + ' 건';
      }
    }
  }
}));

const series = computed(() => [
  {
    name: '수령 완료',
    data: trendData.value.map(item => item.completedOrders || 0)
  },
  {
    name: '발주 대기',
    data: trendData.value.map(item => item.pendingOrders || 0)
  },
  {
    name: '취소',
    data: trendData.value.map(item => item.cancelledOrders || 0)
  }
]);
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 class="mb-0">📦 주문 추이</h5>
    </template>

    <VueApexCharts
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </BaseCard>
</template>

<style scoped>
/* Additional styling if needed */
</style>
