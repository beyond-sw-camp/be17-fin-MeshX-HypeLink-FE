<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

// Chart.js 형식의 데이터를 ApexCharts 형식으로 변환
const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 350,
    toolbar: {
      show: false
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#42A5F5'],
  xaxis: {
    categories: props.chartData.labels || [],
    labels: {
      style: {
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: (value) => {
        return value ? value.toLocaleString() + '원' : '0원'
      }
    }
  },
  tooltip: {
    y: {
      formatter: (value) => {
        return value ? value.toLocaleString() + '원' : '0원'
      }
    }
  },
  dataLabels: {
    enabled: false
  }
}))

const series = computed(() => {
  if (!props.chartData.datasets || props.chartData.datasets.length === 0) {
    return []
  }
  return props.chartData.datasets.map(dataset => ({
    name: dataset.label || '데이터',
    data: dataset.data || []
  }))
})
</script>

<template>
  <div class="line-chart">
    <apexchart
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<style scoped>
.line-chart {
  width: 100%;
}
</style>
