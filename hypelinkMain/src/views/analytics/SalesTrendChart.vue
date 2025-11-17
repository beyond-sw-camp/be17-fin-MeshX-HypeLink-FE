<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import VueApexCharts from 'vue3-apexcharts';
import { getSalesTrend } from '@/api/analytics';

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
    const response = await getSalesTrend(props.period);
    if (response.data && response.data.length > 0) {
      trendData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch sales trend:', error);
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
    type: 'line',
    height: 350,
    toolbar: {
      show: true
    },
    zoom: {
      enabled: true
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#0d6efd', '#198754'],
  xaxis: {
    categories: trendData.value.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    title: {
      text: '날짜'
    }
  },
  yaxis: [
    {
      title: {
        text: '매출액 (만원)'
      },
      labels: {
        formatter: function (value) {
          return (value / 10000).toFixed(0);
        }
      }
    },
    {
      opposite: true,
      title: {
        text: '거래 건수 (건)'
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(0);
        }
      }
    }
  ],
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  grid: {
    borderColor: '#e7e7e7',
    row: {
      colors: ['#f3f3f3', 'transparent'],
      opacity: 0.5
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: [
      {
        formatter: function (value) {
          return '₩' + (value / 10000).toFixed(0) + '만원';
        }
      },
      {
        formatter: function (value) {
          return value.toFixed(0) + '건';
        }
      }
    ]
  }
}));

const series = computed(() => [
  {
    name: '매출액',
    type: 'area',
    data: trendData.value.map(item => item.totalRevenue)
  },
  {
    name: '거래 건수',
    type: 'line',
    data: trendData.value.map(item => item.orderCount)
  }
]);
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 class="mb-0">📈 매출 추이</h5>
    </template>

    <VueApexCharts
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </BaseCard>
</template>

<style scoped>
/* Additional styling if needed */
</style>
