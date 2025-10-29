<script setup>
import {computed, ref, onMounted} from 'vue'
import {useInventoryStore} from '@/stores/inventory'
import {useProductsStore} from '@/stores/products'
import itemAPI from '@/api/item'

const inventoryStore = useInventoryStore()
const productsStore = useProductsStore()

const items = ref([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(1)
const totalElements = ref(0)
const pageSize = ref(10)

const inventoryItems = computed(() => {
  return items.value.map(item => ({
    productId: item.id,
    productName: item.productName,
    currentStock: item.stock
  }))
})

const outOfStockItems = computed(() => {
  return inventoryItems.value.filter(item => item.currentStock === 0)
})

// API로 상품 불러오기 (페이징)
const fetchAllItems = async () => {
  loading.value = true
  const result = await itemAPI.getItemList(currentPage.value, pageSize.value)

  if (result.success) {
    items.value = result.data.content || []
    totalPages.value = result.data.totalPages || 1
    totalElements.value = result.data.totalElements || 0
  } else {
    console.error('Failed to fetch items:', result.message)
    items.value = []
  }

  loading.value = false
}

// 페이징 함수
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    fetchAllItems()
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    fetchAllItems()
  }
}

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    fetchAllItems()
  }
}

onMounted(() => {
  fetchAllItems()
})

const getStockStatus = (item) => {
  if (item.currentStock === 0) return { label: '재고없음', class: 'empty' }
  return { label: '정상', class: 'normal' }
}
</script>

<template>
  <div class="inventory-view">
    <div class="header">
      <h1>재고 관리</h1>
      <div class="header-info">
        <div class="alert-section" v-if="outOfStockItems.length > 0">
          <div class="alert-badge">⚠️ {{ outOfStockItems.length }}개 상품 재고 없음</div>
        </div>
        <div class="total-info">총 {{ totalElements }}개 상품</div>
      </div>
    </div>

    <div class="inventory-container">
      <div class="inventory-table">
        <div class="table-header">
          <div class="col col-name">상품명</div>
          <div class="col col-stock">현재 재고</div>
          <div class="col col-status">상태</div>
        </div>

        <div class="table-body">
          <div
            v-for="item in inventoryItems"
            :key="item.productId"
            class="table-row"
          >
            <div class="col col-name">
              <span class="product-name">{{ item.productName }}</span>
            </div>
            <div class="col col-stock">
              <span class="stock-value">{{ item.currentStock }}</span>
            </div>
            <div class="col col-status">
              <span
                class="status-badge"
                :class="getStockStatus(item).class"
              >
                {{ getStockStatus(item).label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 0" @click="prevPage">
            ◀ 이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages - 1" @click="nextPage">
            다음 ▶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-view {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.header-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.alert-section {
  display: flex;
  gap: 12px;
}

.total-info {
  padding: 12px 20px;
  background: #F0F7FF;
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.alert-badge {
  padding: 12px 20px;
  background: #FFF3E0;
  color: var(--warning-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.inventory-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.inventory-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
  align-items: center;
}

.table-header {
  background: var(--bg-gray);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.table-row {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.table-row:hover {
  background: var(--bg-gray);
}

.table-row:last-child {
  border-bottom: none;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.stock-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.min-value {
  font-size: 14px;
  color: var(--text-secondary);
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.normal {
  background: #E8F5E9;
  color: var(--success-color);
}

.status-badge.empty {
  background: #FFEBEE;
  color: var(--error-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.page-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: #f0f7ff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
}

</style>