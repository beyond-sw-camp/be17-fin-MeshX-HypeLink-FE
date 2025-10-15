<script setup>
import { useCouponsStore } from '@/stores/coupons'

const props = defineProps({
  availableCoupons: Array,
  show: Boolean
})

const emit = defineEmits(['select-coupon', 'close'])

const couponsStore = useCouponsStore()

const formatDate = (dateString) => {
  return dateString.replace(/-/g, '.')
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const selectCoupon = (coupon) => {
  emit('select-coupon', coupon)
}
</script>

<template>
  <div v-if="show" class="coupon-list-overlay" @click="emit('close')">
    <div class="coupon-list-modal" @click.stop>
      <div class="coupon-list-header">
        <h3>사용 가능한 쿠폰</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="coupon-list-body">
        <div
          v-for="coupon in availableCoupons"
          :key="coupon.id"
          class="coupon-item"
          @click="selectCoupon(coupon)"
        >
          <div class="coupon-item-header">
            <span class="coupon-type-badge" :class="coupon.type">
              {{ coupon.type === 'amount' ? '금액' : '비율' }}
            </span>
            <span class="coupon-expiry">~{{ formatDate(coupon.expiresAt) }}</span>
          </div>
          <div class="coupon-item-name">{{ coupon.name }}</div>
          <div class="coupon-item-value">
            {{ coupon.type === 'amount'
              ? formatPrice(coupon.value) + ' 할인'
              : coupon.value + '% 할인' }}
          </div>
          <div v-if="coupon.minPurchase > 0" class="coupon-min-purchase">
            {{ formatPrice(coupon.minPurchase) }} 이상 구매 시
          </div>
        </div>
      </div>

      <div class="coupon-list-footer">
        <button class="cancel-btn" @click="emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupon-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.coupon-list-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.coupon-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.coupon-list-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
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

.coupon-list-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.coupon-item {
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  border: 2px solid #FFD54F;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.coupon-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
  border-color: var(--warning-color);
}

.coupon-item:last-child {
  margin-bottom: 0;
}

.coupon-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.coupon-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.coupon-type-badge.amount {
  background: #FFD54F;
  color: #F57F17;
}

.coupon-type-badge.percent {
  background: #FFE082;
  color: #F57C00;
}

.coupon-expiry {
  font-size: 12px;
  color: #F57F17;
  font-weight: 500;
}

.coupon-item-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.coupon-item-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--warning-color);
  margin-bottom: 8px;
}

.coupon-min-purchase {
  font-size: 13px;
  color: #F57F17;
  font-weight: 500;
}

.coupon-list-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.coupon-list-footer .cancel-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  background: var(--bg-gray);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-list-footer .cancel-btn:hover {
  background: #E5E8EB;
}
</style>