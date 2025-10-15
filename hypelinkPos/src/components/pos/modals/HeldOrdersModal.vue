<script setup>
import { useOrdersStore } from '@/stores/orders'

defineEmits(['close', 'retrieveOrder', 'removeHeld'])

const ordersStore = useOrdersStore()

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="held-modal-overlay" @click="$emit('close')">
    <div class="held-modal-content" @click.stop>
      <div class="held-modal-header">
        <h2>보류된 주문</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="held-orders-list">
        <div
          v-for="held in ordersStore.heldOrders"
          :key="held.id"
          class="held-order-card"
        >
          <div class="held-order-info">
            <div class="held-order-id">{{ held.id }}</div>
            <div class="held-order-time">
              {{ new Date(held.timestamp).toLocaleTimeString('ko-KR') }}
            </div>
            <div class="held-order-items">
              {{ held.items.length }}개 상품 ·
              {{ formatPrice(held.items.reduce((sum, item) => sum + item.subtotal, 0)) }}
            </div>
          </div>
          <div class="held-order-actions">
            <button class="retrieve-btn" @click="$emit('retrieveOrder', held.id)">
              회수
            </button>
            <button class="delete-held-btn" @click="$emit('removeHeld', held.id)">
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.held-modal-overlay {
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

.held-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.held-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.held-modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.held-modal-header .close-btn {
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

.held-modal-header .close-btn:hover {
  background: var(--bg-gray);
}

.held-orders-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.held-order-card {
  background: var(--bg-gray);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.held-order-info {
  flex: 1;
}

.held-order-id {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.held-order-time {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.held-order-items {
  font-size: 14px;
  color: var(--text-primary);
}

.held-order-actions {
  display: flex;
  gap: 8px;
}

.retrieve-btn,
.delete-held-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retrieve-btn {
  background: var(--primary-color);
  color: white;
}

.retrieve-btn:hover {
  background: #0052CC;
}

.delete-held-btn {
  background: white;
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.delete-held-btn:hover {
  background: var(--error-color);
  color: white;
}
</style>
