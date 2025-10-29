import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerApi from '@/api/customer'

export const useMembershipStore = defineStore('membership', () => {
  const currentMember = ref(null)

  // 전화번호로 멤버 조회 (백엔드 API 연동)
  const findMemberByPhone = async (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    console.log('멤버 조회 시도:', cleanPhone)

    // 1. 기본 회원 정보 조회
    const response = await customerApi.getCustomerByPhone(cleanPhone)
    console.log('멤버 조회 응답:', response)

    if (response.success && response.data) {
      // 2. 사용 가능한 쿠폰만 조회
      const couponResponse = await customerApi.getCustomerWithAvailableCoupons(cleanPhone)
      console.log('쿠폰 조회 응답:', couponResponse)

      // 백엔드 응답 구조에 맞게 변환
      currentMember.value = {
        id: response.data.customerId,
        name: response.data.name,
        phone: response.data.phone,
        birthDate: response.data.birthday,
        coupons: couponResponse.success ? (couponResponse.data.customerCoupons || []) : []
      }
      console.log('currentMember 설정 완료:', currentMember.value)
      return { success: true, member: currentMember.value }
    }

    console.log('멤버 조회 실패:', response.message)
    return { success: false, message: response.message || '등록되지 않은 회원입니다.' }
  }

  // 멤버십 등록 (백엔드 API 연동)
  const registerMember = async (name, phone, birthDate) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    const response = await customerApi.signupCustomer({
      name,
      phone: cleanPhone,
      birthDate
    })

    return response
  }

  // 현재 멤버 초기화
  const clearCurrentMember = () => {
    currentMember.value = null
  }

  // 사용 가능한 쿠폰 목록 조회
  const getAvailableCoupons = () => {
    if (!currentMember.value || !currentMember.value.coupons) return []
    // 백엔드에서 이미 필터링된 쿠폰만 받아오므로 그대로 반환
    return currentMember.value.coupons
  }

  return {
    currentMember,
    findMemberByPhone,
    registerMember,
    clearCurrentMember,
    getAvailableCoupons
  }
})
