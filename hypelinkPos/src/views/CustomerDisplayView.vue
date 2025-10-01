<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()

const orderTotal = computed(() => ordersStore.getOrderTotal())

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="customer-display">
    <div class="display-header">
      <h1>Toss POS</h1>
      <div class="store-name">테스트 매장</div>
    </div>

    <div class="display-body">
      <div v-if="ordersStore.currentOrder.length === 0" class="welcome-message">
        <div class="welcome-icon">🛒</div>
        <h2>환영합니다</h2>
        <p>편안한 쇼핑 되세요</p>
      </div>

      <div v-else class="order-display">
        <div class="items-list">
          <div
            v-for="item in ordersStore.currentOrder"
            :key="item.productId"
            class="display-item"
          >
            <div class="item-info">
              <div class="item-name">{{ item.productName }}</div>
              <div class="item-qty">{{ item.quantity }}개</div>
            </div>
            <div class="item-price">{{ formatPrice(item.subtotal) }}</div>
          </div>
        </div>

        <div class="total-display">
          <div class="total-label">합계</div>
          <div class="total-amount">{{ formatPrice(orderTotal) }}</div>
        </div>
      </div>
    </div>

    <div class="display-footer">
      <p>이용해 주셔서 감사합니다</p>
    </div>
  </div>
</template>

<style scoped>
.customer-display {
  min-height: 100vh;
  background: linear-gradient(135deg, #0064FF 0%, #0052CC 100%);
  display: flex;
  flex-direction: column;
  color: white;
  padding: 40px;
}

.display-header {
  text-align: center;
  margin-bottom: 60px;
}

.display-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
}

.store-name {
  font-size: 24px;
  font-weight: 500;
  opacity: 0.9;
}

.display-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-message {
  text-align: center;
}

.welcome-icon {
  font-size: 120px;
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.welcome-message h2 {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 16px;
}

.welcome-message p {
  font-size: 32px;
  font-weight: 400;
  opacity: 0.9;
}

.order-display {
  width: 100%;
  max-width: 800px;
}

.items-list {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.display-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.display-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.item-qty {
  font-size: 24px;
  opacity: 0.8;
}

.item-price {
  font-size: 36px;
  font-weight: 700;
}

.total-display {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 40px;
  font-weight: 600;
}

.total-amount {
  font-size: 64px;
  font-weight: 700;
}

.display-footer {
  text-align: center;
  margin-top: 60px;
}

.display-footer p {
  font-size: 28px;
  opacity: 0.8;
}

/* Scrollbar styling */
.items-list::-webkit-scrollbar {
  width: 8px;
}

.items-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.items-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>