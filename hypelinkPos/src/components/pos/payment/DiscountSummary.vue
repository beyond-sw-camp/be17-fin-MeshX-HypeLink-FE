<script setup>
const props = defineProps({
  totalAmount: Number,
  pointsUsed: Number,
  couponDiscount: Number,
  finalAmount: Number
})

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div v-if="couponDiscount > 0 || pointsUsed > 0" class="total-discount-summary">
    <div class="summary-row">
      <span>원래 금액</span>
      <span>{{ formatPrice(totalAmount) }}</span>
    </div>
    <div v-if="couponDiscount > 0" class="summary-row discount">
      <span>쿠폰 할인</span>
      <span>-{{ formatPrice(couponDiscount) }}</span>
    </div>
    <div v-if="pointsUsed > 0" class="summary-row discount">
      <span>포인트 사용</span>
      <span>-{{ formatPrice(pointsUsed) }}</span>
    </div>
    <div class="summary-row final">
      <span>최종 결제 금액</span>
      <span class="final-amount-value">{{ formatPrice(finalAmount) }}</span>
    </div>
  </div>
</template>

<style scoped>
.total-discount-summary {
  background: var(--bg-gray);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.total-discount-summary .summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.total-discount-summary .summary-row.discount {
  color: var(--success-color);
}

.total-discount-summary .summary-row.final {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 2px solid var(--border-color);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.final-amount-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color);
}
</style>