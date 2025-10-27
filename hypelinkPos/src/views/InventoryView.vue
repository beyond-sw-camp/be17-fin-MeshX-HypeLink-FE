<script setup>
import {computed, ref, onMounted} from 'vue'
import {useInventoryStore} from '@/stores/inventory'
import {useProductsStore} from '@/stores/products'
import itemAPI from '@/api/item'

const inventoryStore = useInventoryStore()
const productsStore = useProductsStore()

const showAddModal = ref(false)
const selectedProductId = ref('')
const adjustType = ref('in')
const adjustQuantity = ref(0)
const adjustReason = ref('')

const items = ref([])
const loading = ref(false)
const minStockSettings = ref({})
const currentPage = ref(0)
const totalPages = ref(1)
const totalElements = ref(0)
const pageSize = ref(10)

const inventoryItems = computed(() => {
  return items.value.map(item => ({
    productId: item.id,
    productName: item.productName,
    currentStock: item.stock,
    minStock: minStockSettings.value[item.id] || 10
  }))
})

const lowStockItems = computed(() => {
  return inventoryItems.value.filter(item => item.currentStock <= item.minStock)
})

// API로 상품 불러오기 (페이징)
const fetchAllItems = async () => {
  loading.value = true
  const result = await itemAPI.getItemList(1, currentPage.value, pageSize.value)

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

const openAddModal = (productId, type) => {
  selectedProductId.value = productId
  adjustType.value = type
  adjustQuantity.value = 0
  adjustReason.value = ''
  showAddModal.value = true
}

const submitAdjustment = () => {
  if (adjustQuantity.value <= 0) {
    alert('수량을 입력해주세요.')
    return
  }

  // 로컬에서 재고 업데이트 (실제로는 API 호출 필요)
  const item = items.value.find(i => i.id === selectedProductId.value)
  if (item) {
    if (adjustType.value === 'in') {
      item.stock += adjustQuantity.value
    } else {
      item.stock -= adjustQuantity.value
    }
  }

  showAddModal.value = false

  // TODO: 재고 업데이트 API 호출
  // await axios.patch(`/api/store/item/${selectedProductId.value}/stock`, { quantity, type })
}

const getStockStatus = (item) => {
  if (item.currentStock === 0) return { label: '재고없음', class: 'empty' }
  if (item.currentStock <= item.minStock) return { label: '부족', class: 'low' }
  return { label: '정상', class: 'normal' }
}
</script>

<template>
  <div class="inventory-view">
    <div class="header">
      <h1>재고 관리</h1>
      <div class="header-info">
        <div class="alert-section" v-if="lowStockItems.length > 0">
          <div class="alert-badge">⚠️ {{ lowStockItems.length }}개 상품 재고 부족</div>
        </div>
        <div class="total-info">총 {{ totalElements }}개 상품</div>
      </div>
    </div>

    <div class="inventory-container">
      <div class="inventory-table">
        <div class="table-header">
          <div class="col col-name">상품명</div>
          <div class="col col-stock">현재 재고</div>
          <div class="col col-min">최소 재고</div>
          <div class="col col-status">상태</div>
          <div class="col col-actions">관리</div>
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
            <div class="col col-min">
              <span class="min-value">{{ item.minStock }}</span>
            </div>
            <div class="col col-status">
              <span
                class="status-badge"
                :class="getStockStatus(item).class"
              >
                {{ getStockStatus(item).label }}
              </span>
            </div>
            <div class="col col-actions">
              <button
                class="action-btn in"
                @click="openAddModal(item.productId, 'in')"
              >
                입고
              </button>
              <button
                class="action-btn out"
                @click="openAddModal(item.productId, 'out')"
              >
                출고
              </button>
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

    <!-- Adjust Stock Modal -->
    <div v-if="showAddModal" class="modal-overlay" >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ adjustType === 'in' ? '재고 입고' : '재고 출고' }}</h2>
          <button class="close-btn" @click="showAddModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>수량</label>
            <input
              v-model.number="adjustQuantity"
              type="number"
              min="1"
              placeholder="수량 입력"
            />
          </div>

          <div class="form-group">
            <label>사유 (선택)</label>
            <input
              v-model="adjustReason"
              type="text"
              placeholder="입고/출고 사유"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showAddModal = false">
            취소
          </button>
          <button class="confirm-btn" @click="submitAdjustment">확인</button>
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
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

.status-badge.low {
  background: #FFF3E0;
  color: var(--warning-color);
}

.status-badge.empty {
  background: #FFEBEE;
  color: var(--error-color);
}

.col-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.in {
  background: #E8F5E9;
  color: var(--success-color);
}

.action-btn.in:hover {
  background: var(--success-color);
  color: white;
}

.action-btn.out {
  background: #FFF3E0;
  color: var(--warning-color);
}

.action-btn.out:hover {
  background: var(--warning-color);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: var(--primary-color);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover {
  background: #0052CC;
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