<script setup>
import { computed } from 'vue'

const props = defineProps({
  member: Object,
  availableCoupons: Array,
  selectedCoupon: Object,
  couponDiscount: Number
})

const emit = defineEmits(['show-coupon-list', 'remove-coupon'])

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div v-if="member && availableCoupons.length > 0" class="coupon-section">
    <div v-if="!selectedCoupon" class="coupon-select">
      <button class="select-coupon-btn" @click="emit('show-coupon-list')">
        🎟️ 쿠폰 선택 ({{ availableCoupons.length }}장)
      </button>
    </div>
    <div v-else class="selected-coupon">
      <div class="coupon-info">
        <span class="coupon-icon">🎟️</span>
        <div class="coupon-details">
          <div class="coupon-name">{{ selectedCoupon.name }}</div>
          <div class="coupon-discount">-{{ formatPrice(couponDiscount) }}</div>
        </div>
      </div>
      <button class="remove-coupon-btn" @click="emit('remove-coupon')">✕</button>
    </div>
  </div>
</template>

<style scoped>
.coupon-section {
  background: #FFF8E1;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #FFD54F;
}

.coupon-select {
  display: flex;
}

.select-coupon-btn {
  width: 100%;
  padding: 14px;
  background: white;
  border: 2px dashed var(--warning-color);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--warning-color);
  cursor: pointer;
  transition: all 0.2s;
}

.select-coupon-btn:hover {
  background: var(--warning-color);
  color: white;
  border-style: solid;
}

.selected-coupon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px;
  border-radius: 8px;
}

.coupon-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.coupon-icon {
  font-size: 28px;
}

.coupon-details {
  flex: 1;
}

.coupon-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.coupon-discount {
  font-size: 16px;
  font-weight: 700;
  color: var(--warning-color);
}

.remove-coupon-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #FFEBEE;
  color: var(--error-color);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-coupon-btn:hover {
  background: var(--error-color);
  color: white;
}
</style>