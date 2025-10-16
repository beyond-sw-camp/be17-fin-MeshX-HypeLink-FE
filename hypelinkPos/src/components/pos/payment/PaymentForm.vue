<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useInventoryStore } from '@/stores/inventory'
import { useMembershipStore } from '@/stores/membership'
import { useCouponsStore } from '@/stores/coupons'
import ReceiptPrint from '../ReceiptPrint.vue'
import PointsSection from './PointsSection.vue'
import CouponSection from './CouponSection.vue'
import CouponListModal from '../modals/CouponListModal.vue'
import DiscountSummary from './DiscountSummary.vue'
import PaymentSuccessMessage from './PaymentSuccessMessage.vue'
import PortOne from '@portone/browser-sdk/v2'
import api from '@/api/payment.js'

const props = defineProps({
  total: Number,
  member: Object
})

const emit = defineEmits(['close', 'complete'])

const randomId = () => {
  return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("")
}

const ordersStore = useOrdersStore()
const inventoryStore = useInventoryStore()
const membershipStore = useMembershipStore()
const couponsStore = useCouponsStore()

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

const selectCoupon = (coupon) => {
  selectedCoupon.value = coupon
  showCouponList.value = false
}

const removeCoupon = () => {
  selectedCoupon.value = null
}

const processPayment = async () => {
  if (pointsToUse.value > availablePoints.value) {
    alert('사용 가능한 포인트를 초과했습니다.')
    return
  }

  isProcessing.value = true

  try {
    // 현재 주문 정보 가져오기
    const currentOrder = ordersStore.currentOrder
    if (!currentOrder || currentOrder.length === 0) {
      alert('주문 내역이 없습니다.')
      isProcessing.value = false
      return
    }

    // 카드 결제 (PortOne)
    await processPortOnePayment(currentOrder)

  } catch (error) {
    console.error('결제 처리 중 오류:', error)
    alert('결제 처리 중 오류가 발생했습니다.')
    isProcessing.value = false
  }
}

const processPortOnePayment = async (currentOrder) => {
  try {
    const paymentId = randomId()

    // 주문 이름 생성
    const orderName = currentOrder.length === 1
      ? currentOrder[0].productName
      : `${currentOrder[0].productName} 외 ${currentOrder.length - 1}개`

    // 1. PortOne 결제창 띄우기
    const portOnePayment = await PortOne.requestPayment({
      storeId: "store-96bd9593-e67a-43be-ba12-094fa55fb286", // PortOne 스토어 ID
      channelKey: "channel-key-c0d6c763-55a1-45e2-8665-06e04ae5c95e", // 채널 키
      paymentId: paymentId,
      orderName: orderName,
      totalAmount: finalAmount.value,
      currency: "CURRENCY_KRW",
      payMethod: "EASY_PAY", // 카카오페이 등
    })

    console.log('PortOne 결제 결과:', portOnePayment)

    // 결제 취소 또는 실패한 경우
    // PortOne은 취소/실패 시 code 또는 error 필드를 포함한 응답을 반환
    if (!portOnePayment || portOnePayment.code || portOnePayment.error || !portOnePayment.paymentId) {
      console.log('결제 취소 또는 실패:', portOnePayment)
      alert('결제가 취소되었습니다.')
      isProcessing.value = false
      return
    }

    // 2. 백엔드에 검증 요청할 주문 데이터 준비
    const orderData = {
      storeId: 1, // TODO: 실제 매장 ID로 변경
      memberId: props.member?.id || null,
      memberName: props.member?.name || "비회원",
      memberPhone: props.member?.phone || "",
      pointsUsed: pointsToUse.value,
      couponDiscount: couponDiscount.value,
      items: currentOrder.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        discountPrice: item.discountPrice || 0,
        subtotal: item.price * item.quantity
      }))
    }

    // 3. 백엔드 API 호출 - 결제 검증 및 주문 생성
    const response = await api.validatePayment(portOnePayment.paymentId, orderData)

    console.log('백엔드 검증 결과:', response)

    // 4. 백엔드 검증 성공
    if (response && response.data) {
      // Use coupon if applicable
      if (selectedCoupon.value) {
        couponsStore.useCoupon(selectedCoupon.value.id)
      }

      // Use points if applicable
      if (pointsToUse.value > 0 && props.member) {
        membershipStore.usePoints(props.member.id, pointsToUse.value)
      }

      // Update local store
      const order = {
        id: response.data.id,
        orderNumber: response.data.orderNumber,
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        finalAmount: response.data.finalAmount,
        paymentMethod: 'card',
        status: response.data.status,
        createdAt: response.data.createdAt
      }

      // Update inventory
      order.items.forEach(item => {
        inventoryStore.removeStock(item.productId, item.quantity, '판매')
      })

      // Earn points for member
      if (props.member) {
        membershipStore.earnPoints(props.member.id, props.total)
      }

      // Clear current order
      ordersStore.clearOrder()

      completedOrder.value = order
      showSuccess.value = true
    } else {
      alert('결제 검증에 실패했습니다: ' + (response.message || '알 수 없는 오류'))
      isProcessing.value = false
    }

  } catch (error) {
    throw error
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
  <div>
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

        <PointsSection
          v-model="pointsToUse"
          :member="member"
          :total-amount="total"
        />

        <CouponSection
          :member="member"
          :available-coupons="availableCoupons"
          :selected-coupon="selectedCoupon"
          :coupon-discount="couponDiscount"
          @show-coupon-list="showCouponList = true"
          @remove-coupon="removeCoupon"
        />

        <DiscountSummary
          :total-amount="total"
          :points-used="pointsToUse"
          :coupon-discount="couponDiscount"
          :final-amount="finalAmount"
        />
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

    <PaymentSuccessMessage
      v-else
      @print-receipt="openReceipt"
      @close="emit('close')"
    />

    <ReceiptPrint
      v-if="showReceipt && completedOrder"
      :order="completedOrder"
      :store-name="'테스트 매장'"
      @close="closeReceipt"
    />

    <CouponListModal
      :show="showCouponList"
      :available-coupons="availableCoupons"
      @select-coupon="selectCoupon"
      @close="showCouponList = false"
    />
  </div>
</template>

<style scoped>
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
</style>
