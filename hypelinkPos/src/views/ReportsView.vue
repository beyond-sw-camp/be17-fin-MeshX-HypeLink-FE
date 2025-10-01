<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { usePaymentsStore } from '@/stores/payments'
import { useProductsStore } from '@/stores/products'

const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const productsStore = useProductsStore()

const todayTotal = computed(() => paymentsStore.getTodayTotal())
const paymentStats = computed(() => paymentsStore.getPaymentStats())

const totalOrders = computed(() => ordersStore.orders.length)
const completedOrders = computed(
  () => ordersStore.orders.filter((o) => o.status === 'completed').length
)

const productStats = computed(() => {
  const itemCounts = {}

  ordersStore.orders
    .filter((o) => o.status === 'completed')
    .forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.productId]) {
          itemCounts[item.productId] = {
            name: item.productName,
            count: 0,
            revenue: 0
          }
        }
        itemCounts[item.productId].count += item.quantity
        itemCounts[item.productId].revenue += item.subtotal
      })
    })

  return Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: '현금',
    card: '카드',
    qr: 'QR결제',
    transfer: '계좌이체'
  }
  return labels[method] || method
}
</script>

<template>
  <div class="reports-view">
    <div class="header">
      <h1>리포트</h1>
      <div class="date-filter">
        <button class="filter-btn active">오늘</button>
        <button class="filter-btn">이번 주</button>
        <button class="filter-btn">이번 달</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-label">오늘 매출</div>
          <div class="card-value">{{ formatPrice(todayTotal) }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon">📋</div>
        <div class="card-content">
          <div class="card-label">총 주문</div>
          <div class="card-value">{{ totalOrders }}건</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <div class="card-label">완료된 주문</div>
          <div class="card-value">{{ completedOrders }}건</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <div class="card-label">총 상품</div>
          <div class="card-value">{{ productsStore.products.length }}개</div>
        </div>
      </div>
    </div>

    <div class="reports-grid">
      <!-- Payment Methods -->
      <div class="report-section">
        <h2>결제 방법별 통계</h2>
        <div class="report-content">
          <div
            v-for="(count, method) in paymentStats.byMethod"
            :key="method"
            class="stat-row"
          >
            <span class="stat-label">{{ getPaymentMethodLabel(method) }}</span>
            <span class="stat-value">{{ count }}건</span>
          </div>
          <div v-if="Object.keys(paymentStats.byMethod).length === 0" class="empty">
            데이터가 없습니다
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="report-section">
        <h2>인기 상품 TOP 5</h2>
        <div class="report-content">
          <div
            v-for="(product, index) in productStats"
            :key="product.name"
            class="product-row"
          >
            <div class="rank">{{ index + 1 }}</div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-count">{{ product.count }}개 판매</div>
            </div>
            <div class="product-revenue">{{ formatPrice(product.revenue) }}</div>
          </div>
          <div v-if="productStats.length === 0" class="empty">
            데이터가 없습니다
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reports-view {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
}

.date-filter {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 40px;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.report-section {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 24px;
}

.report-section h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-gray);
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-primary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-gray);
  border-radius: 8px;
}

.rank {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.product-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.product-revenue {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-color);
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>