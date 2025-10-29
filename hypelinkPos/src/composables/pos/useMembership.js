import { ref, computed } from 'vue'
import { useMembershipStore } from '@/stores/membership'

export function useMembership() {
  const membershipStore = useMembershipStore()

  // State
  const memberPhone = ref('')
  const showMembershipRegisterModal = ref(false)
  const newMemberName = ref('')
  const newMemberPhone = ref('')
  const newMemberBirthdate = ref('')
  const showPhoneKeypad = ref(false)
  const showRegisterPhoneKeypad = ref(false)
  const showNameKeypad = ref(false)

  // Computed - membershipStore의 currentMember를 직접 참조
  const currentMember = computed(() => membershipStore.currentMember)

  // Actions
  const openPhoneKeypad = () => {
    showPhoneKeypad.value = true
  }

  const confirmPhoneSearch = async (phone) => {
    memberPhone.value = phone
    showPhoneKeypad.value = false

    if (phone.length < 10) {
      alert('올바른 전화번호를 입력해주세요.')
      return
    }

    const result = await membershipStore.findMemberByPhone(phone)

    if (result.success) {
      const coupons = membershipStore.getAvailableCoupons()
      alert(`${result.member.name}님 환영합니다!\n사용 가능한 쿠폰: ${coupons.length}장`)
    } else {
      if (confirm('등록되지 않은 회원입니다.\n멤버십에 가입하시겠습니까?')) {
        newMemberPhone.value = phone
        showMembershipRegisterModal.value = true
      }
    }
  }

  const clearMember = () => {
    membershipStore.clearCurrentMember()
    memberPhone.value = ''
  }

  const openRegisterPhoneKeypad = () => {
    showRegisterPhoneKeypad.value = true
  }

  const confirmRegisterPhone = (phone) => {
    newMemberPhone.value = phone
    showRegisterPhoneKeypad.value = false
  }

  const openNameKeypad = () => {
    showNameKeypad.value = true
  }

  const confirmNameInput = (name) => {
    newMemberName.value = name
    showNameKeypad.value = false
  }

  const registerMember = async () => {
    if (!newMemberName.value.trim()) {
      alert('이름을 입력해주세요.')
      return
    }

    if (newMemberPhone.value.length < 10) {
      alert('올바른 전화번호를 입력해주세요.')
      return
    }

    if (!newMemberBirthdate.value) {
      alert('생년월일을 입력해주세요.')
      return
    }

    const result = await membershipStore.registerMember(
      newMemberName.value,
      newMemberPhone.value,
      newMemberBirthdate.value
    )

    if (result.success) {
      // 가입 후 바로 조회하여 currentMember에 설정
      const loginResult = await membershipStore.findMemberByPhone(newMemberPhone.value)

      if (loginResult.success) {
        memberPhone.value = newMemberPhone.value

        // 조회 성공 후 환영 메시지
        const coupons = membershipStore.getAvailableCoupons()
        alert(`${newMemberName.value}님, 멤버십 가입을 환영합니다!\n사용 가능한 쿠폰: ${coupons.length}장`)
      } else {
        console.error('자동 로그인 실패:', loginResult)
        alert(`${newMemberName.value}님, 회원가입이 완료되었습니다!\n전화번호로 다시 조회해주세요.`)
      }

      showMembershipRegisterModal.value = false
      newMemberName.value = ''
      newMemberPhone.value = ''
      newMemberBirthdate.value = ''
    } else {
      alert(result.message)
    }
  }

  return {
    // State
    memberPhone,
    currentMember,
    showMembershipRegisterModal,
    newMemberName,
    newMemberPhone,
    newMemberBirthdate,
    showPhoneKeypad,
    showRegisterPhoneKeypad,
    showNameKeypad,

    // Actions
    openPhoneKeypad,
    confirmPhoneSearch,
    clearMember,
    openRegisterPhoneKeypad,
    confirmRegisterPhone,
    openNameKeypad,
    confirmNameInput,
    registerMember
  }
}
