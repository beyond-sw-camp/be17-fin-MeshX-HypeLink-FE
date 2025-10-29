import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCouponsStore = defineStore('coupons', () => {
  const coupons = ref([
    {
      id: 1,
      memberId: 1,
      name: '아우터 5,000원 할인',
      type: 'amount', // 'amount' or 'percent'
      value: 5000,
      minPurchase: 10000, // 최소 구매 금액
      expiresAt: '2024-12-31',
      isUsed: false,
      usedAt: null
    },
    {
      id: 2,
      memberId: 1,
      name: '전품목 10% 할인',
      type: 'percent',
      value: 10,
      minPurchase: 20000,
      expiresAt: '2024-12-31',
      isUsed: false,
      usedAt: null
    },
    {
      id: 3,
      memberId: 1,
      name: '봄맞이 3,000원 할인',
      type: 'amount',
      value: 3000,
      minPurchase: 5000,
      expiresAt: '2024-06-30',
      isUsed: false,
      usedAt: null
    },
    {
      id: 4,
      memberId: 2,
      name: '신규 회원 웰컴 쿠폰',
      type: 'amount',
      value: 2000,
      minPurchase: 0,
      expiresAt: '2024-12-31',
      isUsed: false,
      usedAt: null
    }
  ])

  const nextId = ref(5)

  // 회원의 사용 가능한 쿠폰 조회
  const getAvailableCoupons = (memberId, orderTotal) => {
    const now = new Date()
    return coupons.value.filter(coupon => {
      if (coupon.memberId !== memberId) return false
      if (coupon.isUsed) return false

      const expiryDate = new Date(coupon.expiresAt)
      if (expiryDate < now) return false

      if (orderTotal < coupon.minPurchase) return false

      return true
    })
  }

  // 회원의 모든 쿠폰 조회 (사용 여부 상관없이)
  const getMemberCoupons = (memberId) => {
    return coupons.value.filter(c => c.memberId === memberId)
  }

  // 쿠폰 할인 금액 계산
  const calculateDiscount = (coupon, orderTotal) => {
    if (!coupon) return 0

    if (coupon.type === 'amount') {
      return Math.min(coupon.value, orderTotal)
    } else {
      // percent
      return Math.floor(orderTotal * (coupon.value / 100))
    }
  }

  // 쿠폰 사용
  const useCoupon = (couponId) => {
    const coupon = coupons.value.find(c => c.id === couponId)
    if (!coupon) {
      return { success: false, message: '쿠폰을 찾을 수 없습니다.' }
    }

    if (coupon.isUsed) {
      return { success: false, message: '이미 사용된 쿠폰입니다.' }
    }

    const now = new Date()
    const expiryDate = new Date(coupon.expiresAt)
    if (expiryDate < now) {
      return { success: false, message: '만료된 쿠폰입니다.' }
    }

    coupon.isUsed = true
    coupon.usedAt = now.toISOString().split('T')[0]
    return { success: true }
  }

  // 쿠폰 발급
  const issueCoupon = (memberId, name, type, value, minPurchase, expiresAt) => {
    const newCoupon = {
      id: nextId.value++,
      memberId,
      name,
      type,
      value,
      minPurchase,
      expiresAt,
      isUsed: false,
      usedAt: null
    }

    coupons.value.push(newCoupon)
    return { success: true, coupon: newCoupon }
  }

  // 쿠폰 삭제
  const deleteCoupon = (couponId) => {
    const index = coupons.value.findIndex(c => c.id === couponId)
    if (index !== -1) {
      coupons.value.splice(index, 1)
      return { success: true }
    }
    return { success: false }
  }

  // 만료된 쿠폰 자동 정리
  const cleanExpiredCoupons = () => {
    const now = new Date()
    coupons.value = coupons.value.filter(coupon => {
      const expiryDate = new Date(coupon.expiresAt)
      return expiryDate >= now || coupon.isUsed
    })
  }

  const totalCoupons = computed(() => coupons.value.length)
  const usedCoupons = computed(() => coupons.value.filter(c => c.isUsed).length)
  const availableCouponsCount = computed(() => {
    const now = new Date()
    return coupons.value.filter(c => {
      if (c.isUsed) return false
      const expiryDate = new Date(c.expiresAt)
      return expiryDate >= now
    }).length
  })

  return {
    coupons,
    totalCoupons,
    usedCoupons,
    availableCouponsCount,
    getAvailableCoupons,
    getMemberCoupons,
    calculateDiscount,
    useCoupon,
    issueCoupon,
    deleteCoupon,
    cleanExpiredCoupons
  }
})
