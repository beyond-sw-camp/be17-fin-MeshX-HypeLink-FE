<script setup>
import { ref, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import { getLowStockItems } from '@/api/analytics';

// Props
const props = defineProps({
  threshold: {
    type: Number,
    default: 20
  }
});

// 실제 API 데이터
const lowStockItems = ref([]);

// API 호출
const fetchLowStockItems = async () => {
  try {
    const response = await getLowStockItems(props.threshold);
    if (response.data) {
      lowStockItems.value = response.data.map(item => ({
        id: item.itemDetailId,
        productCode: item.itemCode,
        productName: item.itemName,
        categoryName: item.categoryName,
        color: item.colorName,
        size: item.sizeName,
        currentStock: item.currentStock,
        storeName: '', // TODO: 매장 정보가 없음 - 백엔드 수정 필요
        storeNumber: '',
        status: item.urgency // critical, high, medium, low
      }));
    }
  } catch (error) {
    console.error('Failed to fetch low stock items:', error);
  }
};

onMounted(() => {
  fetchLowStockItems();
});

const getStatusBadge = (status, stock) => {
  if (status === 'critical' || stock <= 3) {
    return { class: 'badge-danger', text: '긴급', icon: '🚨' };
  } else if (status === 'warning' || stock <= 6) {
    return { class: 'badge-warning', text: '경고', icon: '⚠️' };
  } else {
    return { class: 'badge-info', text: '주의', icon: 'ℹ️' };
  }
};

const handleOrder = (item) => {
  console.log('Order item:', item);
  // TODO: Navigate to order page or open modal
};
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">📦 재고 부족 알림</h5>
        <span class="badge bg-danger">{{ lowStockItems.length }}건</span>
      </div>
    </template>

    <div class="table-responsive">
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th style="width: 70px">상태</th>
            <th>상품명</th>
            <th>옵션</th>
            <th>매장</th>
            <th class="text-center">재고</th>
            <th style="width: 100px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lowStockItems" :key="item.id">
            <td>
              <span
                class="badge"
                :class="getStatusBadge(item.status, item.currentStock).class"
              >
                {{ getStatusBadge(item.status, item.currentStock).icon }}
                {{ getStatusBadge(item.status, item.currentStock).text }}
              </span>
            </td>
            <td>
              <div class="product-info">
                <div class="product-name">{{ item.productName }}</div>
                <div class="product-code">{{ item.productCode }}</div>
              </div>
            </td>
            <td>
              <div class="option-info">
                <span class="option-item">{{ item.color }}</span>
                <span class="option-divider">/</span>
                <span class="option-item">{{ item.size }}</span>
              </div>
            </td>
            <td>
              <div class="store-info">
                <div class="store-name">{{ item.storeName }}</div>
                <div class="store-number">{{ item.storeNumber }}</div>
              </div>
            </td>
            <td class="text-center">
              <span
                class="stock-badge"
                :class="{
                  'stock-critical': item.currentStock <= 3,
                  'stock-warning': item.currentStock > 3 && item.currentStock <= 6,
                  'stock-low': item.currentStock > 6
                }"
              >
                {{ item.currentStock }}개
              </span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-primary w-100"
                @click="handleOrder(item)"
              >
                발주
              </button>
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
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.5rem;
  font-weight: 600;
}

.badge-danger {
  background-color: #dc3545;
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

.product-info,
.store-info {
  display: flex;
  flex-direction: column;
}

.product-name,
.store-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.9rem;
}

.product-code,
.store-number {
  font-size: 0.75rem;
  color: #6c757d;
}

.option-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.option-item {
  color: #495057;
}

.option-divider {
  color: #dee2e6;
}

.stock-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.stock-critical {
  background-color: #f8d7da;
  color: #842029;
}

.stock-warning {
  background-color: #fff3cd;
  color: #664d03;
}

.stock-low {
  background-color: #cff4fc;
  color: #055160;
}

tbody tr:hover {
  background-color: #f8f9fa;
}
</style>
