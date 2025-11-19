<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getTopStores } from '@/api/analytics';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['sales', 'orders'].includes(value)
  },
  period: {
    type: String,
    default: 'weekly'
  },
  limit: {
    type: Number,
    default: 5
  }
});

// 실제 API 데이터
const storesData = ref([]);

// API 호출
const fetchStoresData = async () => {
  try {
    const response = await getTopStores(props.period, props.limit);
    if (response.data) {
      storesData.value = response.data.map(store => ({
        id: store.storeId,
        storeNumber: store.storeNumber,
        storeName: store.memberName || '알 수 없음',
        value: store.totalRevenue,
        count: store.orderCount,
        growth: store.growthRate || 0
      }));
    }
  } catch (error) {
    console.error('Failed to fetch stores data:', error);
  }
};

onMounted(() => {
  fetchStoresData();
});

watch(() => [props.period, props.limit], () => {
  fetchStoresData();
});

const data = computed(() => storesData.value);

const title = computed(() => props.type === 'sales' ? '🏪 TOP 5 매출 매장' : '📦 TOP 5 발주 매장');
const valueLabel = computed(() => props.type === 'sales' ? '매출액' : '발주 금액');

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

const getRankBadgeClass = (index) => {
  if (index === 0) return 'badge-gold';
  if (index === 1) return 'badge-silver';
  if (index === 2) return 'badge-bronze';
  return 'badge-default';
};
</script>

<template>
  <BaseCard>
    <template #header>
      <h5 class="mb-0">{{ title }}</h5>
    </template>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th style="width: 50px">순위</th>
            <th>매장</th>
            <th class="text-end">{{ valueLabel }}</th>
            <th class="text-end">건수</th>
            <th class="text-end">성장률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(store, index) in data" :key="store.id">
            <td>
              <span class="rank-badge" :class="getRankBadgeClass(index)">
                {{ index + 1 }}
              </span>
            </td>
            <td>
              <div class="store-info">
                <div class="store-name">{{ store.storeName }}</div>
                <div class="store-number">{{ store.storeNumber }}</div>
              </div>
            </td>
            <td class="text-end fw-bold">{{ formatCurrency(store.value) }}</td>
            <td class="text-end">{{ store.count }}건</td>
            <td class="text-end">
              <span class="growth-badge" :class="store.growth > 0 ? 'positive' : 'negative'">
                <span>{{ store.growth > 0 ? '↑' : '↓' }}</span>
                {{ Math.abs(store.growth) }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>

<style scoped>
.table {
  margin-bottom: 0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
}

.badge-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #856404;
}

.badge-silver {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #495057;
}

.badge-bronze {
  background: linear-gradient(135deg, #cd7f32, #e6a864);
  color: #fff;
}

.badge-default {
  background-color: #f8f9fa;
  color: #6c757d;
}

.store-info {
  display: flex;
  flex-direction: column;
}

.store-name {
  font-weight: 600;
  color: #212529;
}

.store-number {
  font-size: 0.85rem;
  color: #6c757d;
}

.growth-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.growth-badge.positive {
  background-color: #d1e7dd;
  color: #0f5132;
}

.growth-badge.negative {
  background-color: #f8d7da;
  color: #842029;
}

tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
