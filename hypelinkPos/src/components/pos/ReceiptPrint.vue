<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
  order: Object,
  storeName: String
})

const emit = defineEmits(['close'])

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const printReceipt = () => {
  window.print()
}
</script>

<template>
  <div class="receipt-modal-overlay" @click="emit('close')">
    <div class="receipt-container" @click.stop>
      <div class="receipt-actions no-print">
        <button @click="printReceipt" class="print-btn">인쇄</button>
        <button @click="emit('close')" class="close-btn">닫기</button>
      </div>

      <div class="receipt" id="receipt">
        <div class="receipt-header">
          <h1>{{ storeName }}</h1>
          <div class="receipt-type">영수증</div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-info">
          <div class="info-row">
            <span>주문번호</span>
            <span>{{ order.id.substring(0, 8) }}</span>
          </div>
          <div class="info-row">
            <span>일시</span>
            <span>{{ format(order.createdAt, 'yyyy-MM-dd HH:mm:ss') }}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-items">
          <div v-for="item in order.items" :key="item.productId" class="item-row">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-detail">
              <span>{{ formatPrice(item.price) }} × {{ item.quantity }}</span>
              <span class="item-total">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-summary">
          <div class="summary-row">
            <span>상품 수량</span>
            <span>{{ order.items.length }}개</span>
          </div>
          <div class="summary-row total">
            <span>총 금액</span>
            <span>{{ formatPrice(order.total) }}</span>
          </div>
          <div class="summary-row payment">
            <span>결제 방법</span>
            <span>{{
              order.paymentMethod === 'card' ? '카드' :
              order.paymentMethod === 'cash' ? '현금' :
              order.paymentMethod === 'qr' ? 'QR결제' : '계좌이체'
            }}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-footer">
          <p>이용해 주셔서 감사합니다</p>
          <p class="small">※ 본 영수증은 세금계산서가 아닙니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.receipt-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.receipt-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.print-btn,
.close-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.print-btn {
  background: var(--primary-color);
  color: white;
}

.print-btn:hover {
  background: #0052CC;
}

.close-btn {
  background: var(--bg-gray);
  color: var(--text-primary);
}

.close-btn:hover {
  background: #E5E8EB;
}

.receipt {
  background: white;
  padding: 32px 24px;
  font-family: 'Courier New', monospace;
  color: #000;
}

.receipt-header {
  text-align: center;
  margin-bottom: 16px;
}

.receipt-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #000;
}

.receipt-type {
  font-size: 18px;
  font-weight: 600;
}

.receipt-divider {
  border-top: 1px dashed #000;
  margin: 16px 0;
}

.receipt-info,
.receipt-summary {
  font-size: 14px;
}

.info-row,
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  line-height: 1.5;
}

.summary-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #000;
  font-size: 16px;
  font-weight: 700;
}

.summary-row.payment {
  margin-top: 8px;
  font-size: 14px;
}

.receipt-items {
  margin: 16px 0;
}

.item-row {
  margin-bottom: 12px;
  font-size: 14px;
}

.item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.item-detail {
  display: flex;
  justify-content: space-between;
  color: #333;
}

.item-total {
  font-weight: 600;
  color: #000;
}

.receipt-footer {
  text-align: center;
  margin-top: 16px;
}

.receipt-footer p {
  margin: 8px 0;
  font-size: 14px;
}

.receipt-footer .small {
  font-size: 11px;
  color: #666;
}

@media print {
  body * {
    visibility: hidden;
  }

  .receipt,
  .receipt * {
    visibility: visible;
  }

  .receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    padding: 10mm;
  }

  .no-print {
    display: none !important;
  }

  .receipt-modal-overlay {
    position: static;
    background: none;
  }

  .receipt-container {
    box-shadow: none;
    border-radius: 0;
    max-width: none;
    padding: 0;
  }
}
</style>