<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { usePaymentsStore } from '@/stores/payments'
import { useInventoryStore } from '@/stores/inventory'
import { useMembershipStore } from '@/stores/membership'
import { useCouponsStore } from '@/stores/coupons'
import ReceiptPrint from './ReceiptPrint.vue'

const props = defineProps({
  total: Number,
  member: Object
})

const emit = defineEmits(['close', 'complete'])

const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const inventoryStore = useInventoryStore()
const membershipStore = useMembershipStore()
const couponsStore = useCouponsStore()

const selectedMethod = ref('card')
const receivedAmount = ref(0)
const isProcessing = ref(false)
const showSuccess = ref(false)
const showReceipt = ref(false)
const completedOrder = ref(null)
const pointsToUse = ref(0)
const selectedCoupon = ref(null)
const showCouponList = ref(false)

const availablePoints = computed(() => {
  return props.member ? props.member.points : 0
})

const availableCoupons = computed(() => {
  if (!props.member) return []
  return couponsStore.getAvailableCoupons(props.member.id, props.total)
})

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  return couponsStore.calculateDiscount(selectedCoupon.value, props.total)
})

const finalAmount = computed(() => {
  return Math.max(0, props.total - pointsToUse.value - couponDiscount.value)
})

const paymentMethods = [
  { id: 'card', name: '카드', icon: '💳' },
  { id: 'cash', name: '현금', icon: '💵' },
  { id: 'qr', name: 'QR결제', icon: '📱' },
  { id: 'transfer', name: '계좌이체', icon: '🏦' }
]

const change = ref(0)

const selectMethod = (method) => {
  selectedMethod.value = method
}

const addAmount = (amount) => {
  receivedAmount.value += amount
  calculateChange()
}

const calculateChange = () => {
  change.value = Math.max(0, receivedAmount.value - finalAmount.value)
}

const useAllPoints = () => {
  pointsToUse.value = Math.min(availablePoints.value, props.total)
}

const clearPoints = () => {
  pointsToUse.value = 0
}

const selectCoupon = (coupon) => {
  selectedCoupon.value = coupon
  showCouponList.value = false
}

const removeCoupon = () => {
  selectedCoupon.value = null
}

const formatDate = (dateString) => {
  return dateString.replace(/-/g, '.')
}

const processPayment = async () => {
  if (selectedMethod.value === 'cash' && receivedAmount.value < finalAmount.value) {
    alert('받은 금액이 부족합니다.')
    return
  }

  if (pointsToUse.value > availablePoints.value) {
    alert('사용 가능한 포인트를 초과했습니다.')
    return
  }

  isProcessing.value = true

  try {
    // Use coupon if applicable
    if (selectedCoupon.value) {
      const result = couponsStore.useCoupon(selectedCoupon.value.id)
      if (!result.success) {
        alert(result.message)
        isProcessing.value = false
        return
      }
    }

    // Use points if applicable
    if (pointsToUse.value > 0 && props.member) {
      const result = membershipStore.usePoints(props.member.id, pointsToUse.value)
      if (!result.success) {
        alert(result.message)
        isProcessing.value = false
        return
      }
    }

    // Process payment
    const payment = await paymentsStore.processPayment(
      'temp-order-id',
      finalAmount.value,
      selectedMethod.value
    )

    // Complete order
    const order = ordersStore.completeOrder(selectedMethod.value)

    if (order) {
      // Update payment with actual order ID
      payment.orderId = order.id

      // Update inventory
      order.items.forEach(item => {
        inventoryStore.removeStock(item.productId, item.quantity, '판매')
      })

      // Earn points for member (1% of total before discount)
      if (props.member) {
        membershipStore.earnPoints(props.member.id, props.total)
      }
    }

    completedOrder.value = order
    showSuccess.value = true

    // setTimeout(() => {
    //   emit('complete')
    // }, 1500)
  } catch (error) {
    alert('결제 처리 중 오류가 발생했습니다.')
    isProcessing.value = false
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const openReceipt = () => {
  showReceipt.value = true
}

const closeReceipt = () => {
  showReceipt.value = false
  emit('close')
}
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div v-if="!showSuccess">
        <div class="modal-header">
          <h2>결제</h2>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="total-amount">
            <div class="label">결제 금액</div>
            <div class="amount">{{ formatPrice(total) }}</div>
          </div>

          <!-- Membership Points Section -->
          <div v-if="member" class="points-section">
            <div class="points-header">
              <div class="member-info-display">
                <span class="member-icon">👤</span>
                <span class="member-name-display">{{ member.name }}</span>
                <span class="available-points">보유: {{ availablePoints.toLocaleString() }}P</span>
              </div>
            </div>

            <div class="points-input-group">
              <div class="points-input">
                <label>포인트 사용</label>
                <input
                  v-model.number="pointsToUse"
                  type="number"
                  :max="Math.min(availablePoints, total)"
                  min="0"
                  placeholder="0"
                />
              </div>
              <button class="use-all-points-btn" @click="useAllPoints">전액 사용</button>
              <button v-if="pointsToUse > 0" class="clear-points-btn" @click="clearPoints">초기화</button>
            </div>

            <div v-if="pointsToUse > 0" class="final-amount-display">
              <span>포인트 차감 후</span>
              <span class="final-price">{{ formatPrice(total - pointsToUse) }}</span>
            </div>
          </div>

          <!-- Coupon Section -->
          <div v-if="member && availableCoupons.length > 0" class="coupon-section">
            <div v-if="!selectedCoupon" class="coupon-select">
              <button class="select-coupon-btn" @click="showCouponList = true">
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
              <button class="remove-coupon-btn" @click="removeCoupon">✕</button>
            </div>
          </div>

          <!-- Final Amount Display (if coupon or points used) -->
          <div v-if="selectedCoupon || pointsToUse > 0" class="total-discount-summary">
            <div class="summary-row">
              <span>원래 금액</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
            <div v-if="selectedCoupon" class="summary-row discount">
              <span>쿠폰 할인</span>
              <span>-{{ formatPrice(couponDiscount) }}</span>
            </div>
            <div v-if="pointsToUse > 0" class="summary-row discount">
              <span>포인트 사용</span>
              <span>-{{ formatPrice(pointsToUse) }}</span>
            </div>
            <div class="summary-row final">
              <span>최종 결제 금액</span>
              <span class="final-amount-value">{{ formatPrice(finalAmount) }}</span>
            </div>
          </div>

          <div class="payment-methods">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              class="method-btn"
              :class="{ active: selectedMethod === method.id }"
              @click="selectMethod(method.id)"
            >
              <span class="icon">{{ method.icon }}</span>
              <span>{{ method.name }}</span>
            </button>
          </div>

          <div v-if="selectedMethod === 'cash'" class="cash-input">
            <div class="quick-amounts">
              <button @click="addAmount(1000)">+1천</button>
              <button @click="addAmount(5000)">+5천</button>
              <button @click="addAmount(10000)">+1만</button>
              <button @click="addAmount(50000)">+5만</button>
            </div>

            <div class="received-amount">
              <label>받은 금액</label>
              <input
                v-model.number="receivedAmount"
                type="number"
                placeholder="0"
                @input="calculateChange"
              />
            </div>

            <div class="change-amount">
              <span>거스름돈</span>
              <span class="change">{{ formatPrice(change) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="emit('close')">취소</button>
          <button
            class="confirm-btn"
            :disabled="isProcessing"
            @click="processPayment"
          >
            {{ isProcessing ? '처리중...' : '결제 완료' }}
          </button>
        </div>
      </div>

      <div v-else class="success-message">
        <div class="success-icon">✓</div>
        <h2>결제 완료</h2>
        <p>정상적으로 결제가 완료되었습니다.</p>
        <div class="success-actions">
          <button class="receipt-btn" @click="openReceipt">영수증 출력</button>
          <button class="done-btn" @click="emit('close')">확인</button>
        </div>
      </div>
    </div>

    <ReceiptPrint
      v-if="showReceipt && completedOrder"
      :order="completedOrder"
      :store-name="'테스트 매장'"
      @close="closeReceipt"
    />

    <!-- Coupon List Modal -->
    <div v-if="showCouponList" class="coupon-list-overlay" @click="showCouponList = false">
      <div class="coupon-list-modal" @click.stop>
        <div class="coupon-list-header">
          <h3>사용 가능한 쿠폰</h3>
          <button class="close-btn" @click="showCouponList = false">✕</button>
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
          <button class="cancel-btn" @click="showCouponList = false">닫기</button>
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

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.modal-body {
  padding: 24px;
}

.total-amount {
  text-align: center;
  padding: 24px;
  background: var(--bg-gray);
  border-radius: 12px;
  margin-bottom: 24px;
}

.total-amount .label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.total-amount .amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
}

.points-section {
  background: #F0F9FF;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #D0E7FF;
}

.points-header {
  margin-bottom: 16px;
}

.member-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.member-icon {
  font-size: 20px;
}

.member-name-display {
  font-weight: 600;
  color: var(--text-primary);
}

.available-points {
  color: var(--primary-color);
  font-weight: 600;
  margin-left: auto;
}

.points-input-group {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.points-input {
  flex: 1;
}

.points-input label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.points-input input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: white;
}

.points-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.use-all-points-btn,
.clear-points-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.use-all-points-btn {
  background: var(--primary-color);
  color: white;
}

.use-all-points-btn:hover {
  background: #0052CC;
}

.clear-points-btn {
  background: white;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.clear-points-btn:hover {
  background: var(--bg-gray);
}

.final-amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.final-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--success-color);
}

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

.payment-methods {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.method-btn:hover {
  border-color: var(--primary-color);
}

.method-btn.active {
  border-color: var(--primary-color);
  background: #EBF3FF;
  color: var(--primary-color);
}

.method-btn .icon {
  font-size: 32px;
}

.cash-input {
  background: var(--bg-gray);
  padding: 20px;
  border-radius: 12px;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.quick-amounts button {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-amounts button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.received-amount {
  margin-bottom: 16px;
}

.received-amount label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.received-amount input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: right;
}

.change-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
}

.change-amount .change {
  font-size: 18px;
  font-weight: 700;
  color: var(--success-color);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #0052CC;
}

.confirm-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.success-message {
  padding: 60px 40px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 24px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-message h2 {
  font-size: 24px;
  margin-bottom: 12px;
}

.success-message p {
  color: var(--text-secondary);
  font-size: 15px;
  margin-bottom: 24px;
}

.success-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.receipt-btn,
.done-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.receipt-btn {
  background: var(--primary-color);
  color: white;
}

.receipt-btn:hover {
  background: #0052CC;
}

.done-btn {
  background: var(--bg-gray);
  color: var(--text-primary);
}

.done-btn:hover {
  background: #E5E8EB;
}

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