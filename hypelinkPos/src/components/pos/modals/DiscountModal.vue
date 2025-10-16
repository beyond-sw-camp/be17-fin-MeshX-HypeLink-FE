<script setup>
import { useOrdersStore } from '@/stores/orders'

const props = defineProps({
  discountType: String,
  discountValue: String,
  selectedDiscountItems: Array
})

const emit = defineEmits([
  'update:discountType',
  'update:discountValue',
  'update:selectedDiscountItems',
  'close',
  'selectAllItems',
  'applyDiscount',
  'openDiscountKeypad'
])

const ordersStore = useOrdersStore()

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const isItemSelected = (productId) => {
  return props.selectedDiscountItems.includes(productId)
}

const toggleDiscountItem = (productId) => {
  const index = props.selectedDiscountItems.indexOf(productId)
  if (index > -1) {
    const newItems = [...props.selectedDiscountItems]
    newItems.splice(index, 1)
    emit('update:selectedDiscountItems', newItems)
  } else {
    emit('update:selectedDiscountItems', [...props.selectedDiscountItems, productId])
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="discount-modal-content" @click.stop>
      <div class="modal-header">
        <h2>할인</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="discount-modal-body">
        <!-- Left: Input and Actions -->
        <div class="discount-left">
          <div class="discount-type-selector">
            <button
              class="type-btn"
              :class="{ active: discountType === 'amount' }"
              @click="emit('update:discountType', 'amount')"
            >
              금액 (원)
            </button>
            <button
              class="type-btn"
              :class="{ active: discountType === 'percent' }"
              @click="emit('update:discountType', 'percent')"
            >
              비율 (%)
            </button>
          </div>

          <div class="discount-input-display">
            <input
              :value="discountValue"
              type="text"
              readonly
              :placeholder="discountType === 'amount' ? '금액 입력' : '비율 입력'"
              class="discount-display"
              @click="emit('openDiscountKeypad')"
            />
            <span class="discount-unit">{{ discountType === 'amount' ? '원' : '%' }}</span>
          </div>

          <div class="discount-actions">
            <button class="total-discount-btn" @click="emit('selectAllItems')">
              전체 선택
            </button>
            <button class="apply-discount-btn" @click="emit('applyDiscount')">
              할인 적용
            </button>
          </div>
        </div>

        <!-- Right: Order Items -->
        <div class="discount-right">
          <div class="discount-items-header">
            <h3>선택 품목</h3>
            <span class="selected-count">
              {{ selectedDiscountItems.length }}개 선택
            </span>
          </div>

          <div class="discount-items-list">
            <div
              v-for="item in ordersStore.currentOrder"
              :key="item.productId"
              class="discount-item"
              :class="{ selected: isItemSelected(item.productId) }"
              @click="toggleDiscountItem(item.productId)"
            >
              <div class="discount-item-check">
                <span v-if="isItemSelected(item.productId)" class="check-icon">✓</span>
              </div>
              <div class="discount-item-info">
                <div class="discount-item-name">{{ item.productName }}</div>
                <div class="discount-item-detail">
                  {{ item.quantity }}개 × {{ formatPrice(item.price) }}
                </div>
              </div>
              <div class="discount-item-price">
                {{ formatPrice(item.subtotal) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.discount-modal-content {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 20px;
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

.discount-modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.discount-left {
  flex: 1;
  padding: 24px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.discount-type-selector {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.discount-input-display {
  position: relative;
}

.discount-display {
  width: 100%;
  padding: 20px 60px 20px 20px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 32px;
  font-weight: 700;
  text-align: right;
  background: var(--bg-gray);
  color: var(--text-primary);
  cursor: pointer;
}

.discount-display:hover {
  border-color: var(--primary-color);
  background: #f0f7ff;
}

.discount-unit {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-secondary);
  pointer-events: none;
}

.discount-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.total-discount-btn,
.apply-discount-btn {
  flex: 1;
  padding: 18px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.total-discount-btn {
  background: var(--bg-gray);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.total-discount-btn:hover {
  background: #E5E8EB;
}

.apply-discount-btn {
  background: var(--primary-color);
  color: white;
}

.apply-discount-btn:hover {
  background: #0052CC;
}

.discount-right {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: var(--bg-gray);
}

.discount-items-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.discount-items-header h3 {
  font-size: 16px;
  font-weight: 700;
}

.selected-count {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

.discount-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.discount-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.discount-item:hover {
  border-color: var(--primary-color);
}

.discount-item.selected {
  border-color: var(--primary-color);
  background: #f0f7ff;
}

.discount-item-check {
  width: 28px;
  height: 28px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.discount-item.selected .discount-item-check {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.check-icon {
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.discount-item-info {
  flex: 1;
}

.discount-item-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.discount-item-detail {
  font-size: 13px;
  color: var(--text-secondary);
}

.discount-item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}
</style>
