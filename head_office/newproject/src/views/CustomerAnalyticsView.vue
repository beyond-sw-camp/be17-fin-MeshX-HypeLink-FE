<template>
  <div>
    <div class="row">
      <div class="col-lg-6">
        <AgeDistributionChart 
          :series="ageChartSeries" 
          :labels="ageChartLabels"
          @data-point-selected="handleAgeSelect"
        />
      </div>
      <div class="col-lg-6">
        <CategorySalesChart 
          :series="categoryChartSeries" 
          :categories="categoryChartCategories"
          @data-point-selected="handleCategorySelect"
        />
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <DrillDownResults :drillDown="drillDown" @close="clearDrillDown" />
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-lg-12">
        <RetentionChart :series="retentionChartSeries" :categories="retentionChartCategories" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AgeDistributionChart from './customer-analytics/AgeDistributionChart.vue';
import CategorySalesChart from './customer-analytics/CategorySalesChart.vue';
import DrillDownResults from './customer-analytics/DrillDownResults.vue';
import RetentionChart from './customer-analytics/RetentionChart.vue';

// --- 상태 및 데이터 관리 ---

const drillDown = ref({ title: null, items: [] });

const topItemsByAge = {
  '10대': [{ name: 'Hype-Tee (Black)', sales: 1200 }, { name: 'Mesh-Cap (White)', sales: 950 }],
  '20대': [{ name: 'Link-Pants (Beige)', sales: 2500 }, { name: 'Hype-Tee (White)', sales: 2100 }],
  '30대': [{ name: 'Hyper-Jacket (Black)', sales: 1900 }, { name: 'Link-Pants (Black)', sales: 1500 }],
  '40대': [{ name: 'Classic-Polo', sales: 800 }],
  '50대 이상': [{ name: 'Comfort-Pants', sales: 600 }]
};

const topItemsByCategory = {
  '상의': [{ name: 'Hype-Tee (White)', sales: 3100 }, { name: 'Classic-Polo', sales: 1800 }],
  '하의': [{ name: 'Link-Pants (Beige)', sales: 2800 }, { name: 'Link-Pants (Black)', sales: 1900 }],
  '아우터': [{ name: 'Hyper-Jacket (Khaki)', sales: 2200 }, { name: 'Hyper-Jacket (Black)', sales: 2100 }],
  '악세서리': [{ name: 'Mesh-Cap (Black)', sales: 1800 }, { name: 'Logo Socks (3-pack)', sales: 1500 }]
};

// --- 이벤트 핸들러 ---

const handleAgeSelect = (ageGroup) => {
  drillDown.value = {
    title: `'${ageGroup}' 고객이 가장 많이 구매한 품목`,
    items: topItemsByAge[ageGroup] || []
  };
};

const handleCategorySelect = (category) => {
  drillDown.value = {
    title: `'${category}' 카테고리 인기 품목`,
    items: topItemsByCategory[category] || []
  };
};

const clearDrillDown = () => {
  drillDown.value = { title: null, items: [] };
};

// --- 각 차트에 전달할 데이터 ---

const ageChartSeries = ref([15, 45, 25, 10, 5]);
const ageChartLabels = ref(['10대', '20대', '30대', '40대', '50대 이상']);

const categoryChartSeries = ref([{
  name: '매출액',
  data: [400, 230, 180, 120]
}]);
const categoryChartCategories = ref(['상의', '하의', '아우터', '악세서리']);

const retentionChartSeries = ref([
  { name: "신규 고객", data: [31, 40, 28, 51, 42, 109, 100] },
  { name: "재방문 고객", data: [11, 32, 45, 32, 34, 52, 41] }
]);
const retentionChartCategories = ref(['1월', '2월', '3월', '4월', '5월', '6월', '7월']);

</script>
