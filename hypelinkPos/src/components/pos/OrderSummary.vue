<script setup>
import { useOrdersStore } from '@/stores/orders'

const props = defineProps({
  orderTotal: Number
})

const emit = defineEmits([
  'updateItemQuantity',
  'removeItem',
  'holdCurrentOrder',
  'showHeldOrders',
  'cancelOrder',
  'openDiscount',
  'openPayment'
])

const ordersStore = useOrdersStore()

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="order-section">
    <div class="order-header">
      <h2>주문 내역</h2>
      <div class="order-actions">
        <button
          v-if="ordersStore.heldOrders.length > 0"
          class="held-btn"
          @click="emit('showHeldOrders')"
        >
          보류 ({{ ordersStore.heldOrders.length }})
        </button>
        <button
          v-if="ordersStore.currentOrder.length > 0"
          class="hold-btn"
          @click="emit('holdCurrentOrder')"
        >
          보류
        </button>
        <button
          v-if="ordersStore.currentOrder.length > 0"
          class="clear-btn"
          @click="emit('cancelOrder')"
        >
          취소
        </button>
      </div>
    </div>

    <div class="order-items">
      <div v-if="ordersStore.currentOrder.length === 0" class="empty-order">
        상품을 선택해주세요
      </div>

      <div
        v-for="item in ordersStore.currentOrder"
        :key="item.productId"
        class="order-item"
      >
        <div class="item-info">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-price">{{ formatPrice(item.price) }}</div>
        </div>

        <div class="item-controls">
          <button
            class="qty-btn"
            @click="emit('updateItemQuantity', item.productId, item.quantity - 1)"
          >
            -
          </button>
          <span class="qty">{{ item.quantity }}</span>
          <button
            class="qty-btn"
            @click="emit('updateItemQuantity', item.productId, item.quantity + 1)"
          >
            +
          </button>
          <button class="remove-btn" @click="emit('removeItem', item.productId)">삭제</button>
        </div>

        <div class="item-subtotal">{{ formatPrice(item.subtotal) }}</div>
      </div>
    </div>

    <div class="order-summary">
      <div class="summary-row">
        <span>상품 수</span>
        <span>{{ ordersStore.currentOrder.length }}개</span>
      </div>
      <div class="summary-row total">
        <span>총 금액</span>
        <span class="total-amount">{{ formatPrice(orderTotal) }}</span>
      </div>
    </div>

    <button
      class="discount-btn"
      :disabled="ordersStore.currentOrder.length === 0"
      @click="emit('openDiscount')"
    >
      할인
    </button>

    <button
      class="payment-btn"
      :disabled="ordersStore.currentOrder.length === 0"
      @click="emit('openPayment')"
    >
      결제하기
    </button>
  </div>
</template>

<style scoped>
.order-section {
  width: 100%;
  max-height: 50vh;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

@media (min-width: 1024px) {
  .order-section {
    width: 420px;
    max-height: 100vh;
    border-top: none;
    border-left: 1px solid var(--border-color);
    position: static;
    box-shadow: none;
  }
}

@media (min-width: 1280px) {
  .order-section {
    width: 480px;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

@media (min-width: 1024px) {
  .order-header {
    padding: 24px 28px;
  }
}

.order-header h2 {
  font-size: 18px;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .order-header h2 {
    font-size: 22px;
  }
}

.order-actions {
  display: flex;
  gap: 8px;
}

.held-btn,
.hold-btn,
.clear-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.held-btn {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.held-btn:hover {
  background: #EBF3FF;
}

.hold-btn {
  color: var(--text-secondary);
}

.hold-btn:hover {
  background: var(--bg-gray);
}

.clear-btn {
  color: var(--text-secondary);
}

.clear-btn:hover {
  background: var(--bg-gray);
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

@media (min-width: 1024px) {
  .order-items {
    padding: 20px 24px;
  }
}

.empty-order {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 16px;
}

.order-item {
  padding: 20px;
  background: var(--bg-gray);
  border-radius: 12px;
  margin-bottom: 12px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.item-name {
  font-size: 17px;
  font-weight: 600;
}

.item-price {
  font-size: 15px;
  color: var(--text-secondary);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--bg-gray);
}

.qty {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.remove-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--error-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--error-color);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: var(--error-color);
  color: white;
}

.item-subtotal {
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.order-summary {
  padding: 28px;
  border-top: 1px solid var(--border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 16px;
  color: var(--text-secondary);
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--border-color);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.total-amount {
  color: var(--primary-color);
  font-size: 32px;
}

.discount-btn {
  margin: 0 28px 12px;
  padding: 16px;
  background: var(--warning-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.discount-btn:hover:not(:disabled) {
  background: #FF9900;
}

.discount-btn:disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.payment-btn {
  margin: 0 28px 28px;
  padding: 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-btn:hover:not(:disabled) {
  background: #0052CC;
}

.payment-btn:disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}
</style>
