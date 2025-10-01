<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { format } from 'date-fns'

const ordersStore = useOrdersStore()

const orders = computed(() => ordersStore.orders)

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '완료',
    pending: '대기',
    cancelled: '취소'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  return `status-${status}`
}
</script>

<template>
  <div class="orders-view">
    <div class="header">
      <h1>주문 내역</h1>
      <div class="summary">
        <div class="summary-item">
          <span class="label">총 주문 수</span>
          <span class="value">{{ orders.length }}건</span>
        </div>
      </div>
    </div>

    <div class="orders-container">
      <div v-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>아직 주문 내역이 없습니다</p>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-id">{{ order.id }}</div>
            <div class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
              <span class="item-price">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-info">
              <div class="info-row">
                <span class="label">결제 방법</span>
                <span class="value">{{ order.paymentMethod || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">주문 시간</span>
                <span class="value">{{ formatDate(order.createdAt) }}</span>
              </div>
            </div>
            <div class="order-total">
              <span class="label">총 금액</span>
              <span class="amount">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-view {
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

.summary {
  display: flex;
  gap: 16px;
}

.summary-item {
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.summary-item .label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.summary-item .value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
}

.orders-container {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.orders-list {
  padding: 20px;
}

.order-card {
  background: var(--bg-gray);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.order-card:last-child {
  margin-bottom: 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.order-id {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.order-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.status-completed {
  background: #E8F5E9;
  color: var(--success-color);
}

.status-pending {
  background: #FFF3E0;
  color: var(--warning-color);
}

.status-cancelled {
  background: #FFEBEE;
  color: var(--error-color);
}

.order-items {
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
}

.item-name {
  flex: 1;
  color: var(--text-primary);
}

.item-qty {
  color: var(--text-secondary);
}

.item-price {
  font-weight: 600;
  color: var(--text-primary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.order-info {
  flex: 1;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  font-size: 13px;
}

.info-row .label {
  color: var(--text-secondary);
}

.info-row .value {
  color: var(--text-primary);
}

.order-total {
  text-align: right;
}

.order-total .label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.order-total .amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}
</style>