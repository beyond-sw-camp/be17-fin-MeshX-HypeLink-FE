<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getTopProducts } from '@/api/analytics';

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
    default: 20
  }
});

// 실제 API 데이터
const productsData = ref([]);

// API 호출
const fetchProductsData = async () => {
  try {
    const response = await getTopProducts(props.period, props.limit);
    if (response.data) {
      productsData.value = response.data.map(product => ({
        id: product.itemId,
        productCode: product.itemCode,
        productName: product.koName || product.enName || '상품명 없음',
        category: product.categoryName,
        quantity: product.quantity,
        amount: product.totalRevenue
      }));
    }
  } catch (error) {
    console.error('Failed to fetch products data:', error);
  }
};

onMounted(() => {
  fetchProductsData();
});

watch(() => [props.period, props.limit], () => {
  fetchProductsData();
});

const data = computed(() => productsData.value);

const title = computed(() => props.type === 'sales' ? '🛍️ 베스트 판매 상품 TOP 10' : '📦 베스트 주문 상품 TOP 10');
const description = computed(() => props.type === 'sales' ? '고객 구매 기준' : '가맹점 발주 기준');

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₩${(value / 10000000).toFixed(1)}천만`;
  } else if (value >= 10000) {
    return `₩${(value / 10000).toFixed(0)}만`;
  }
  return `₩${value.toLocaleString()}`;
};

const getCategoryBadgeClass = (category) => {
  const classes = {
    '상의': 'badge-primary',
    '하의': 'badge-success',
    '아우터': 'badge-warning',
    '악세서리': 'badge-info',
    '신발': 'badge-secondary'
  };
  return classes[category] || 'badge-secondary';
};
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ title }}</h5>
        <span class="text-muted small">{{ description }}</span>
      </div>
    </template>

    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th style="width: 40px">#</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th class="text-end">판매량</th>
            <th class="text-end">금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in data" :key="product.id">
            <td class="text-center">
              <span class="rank-number" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </span>
            </td>
            <td>
              <div class="product-info">
                <div class="product-name">{{ product.productName }}</div>
                <div class="product-code">{{ product.productCode }}</div>
              </div>
            </td>
            <td>
              <span class="badge" :class="getCategoryBadgeClass(product.category)">
                {{ product.category }}
              </span>
            </td>
            <td class="text-end fw-bold">{{ product.quantity }}개</td>
            <td class="text-end">{{ formatCurrency(product.amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>

<style scoped>
.table {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  font-size: 0.85rem;
}

.rank-number.top-three {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.9rem;
}

.product-code {
  font-size: 0.75rem;
  color: #6c757d;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.65rem;
  font-weight: 500;
}

.badge-primary {
  background-color: #0d6efd;
  color: white;
}

.badge-success {
  background-color: #198754;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.badge-info {
  background-color: #0dcaf0;
  color: #000;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
