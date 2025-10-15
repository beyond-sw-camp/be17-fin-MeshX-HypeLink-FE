import { ref } from 'vue'
import { useMembershipStore } from '@/stores/membership'

export function useMembership() {
  const membershipStore = useMembershipStore()

  // State
  const memberPhone = ref('')
  const currentMember = ref(null)
  const showMembershipRegisterModal = ref(false)
  const newMemberName = ref('')
  const newMemberPhone = ref('')
  const newMemberBirthdate = ref('')
  const showPhoneKeypad = ref(false)
  const showRegisterPhoneKeypad = ref(false)
  const showNameKeypad = ref(false)

  // Actions
  const openPhoneKeypad = () => {
    showPhoneKeypad.value = true
  }

  const confirmPhoneSearch = (phone) => {
    memberPhone.value = phone
    showPhoneKeypad.value = false

    if (phone.length < 10) {
      alert('올바른 전화번호를 입력해주세요.')
      return
    }

    const member = membershipStore.findMemberByPhone(phone)
    if (member) {
      currentMember.value = member
      alert(`${member.name}님 환영합니다!\n보유 포인트: ${member.points.toLocaleString()}P`)
    } else {
      if (confirm('등록되지 않은 회원입니다.\n멤버십에 가입하시겠습니까?')) {
        newMemberPhone.value = phone
        showMembershipRegisterModal.value = true
      }
    }
  }

  const clearMember = () => {
    currentMember.value = null
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

  const registerMember = () => {
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

    const result = membershipStore.registerMember(
      newMemberName.value,
      newMemberPhone.value,
      newMemberBirthdate.value
    )

    if (result.success) {
      currentMember.value = result.member
      memberPhone.value = newMemberPhone.value
      alert(`${result.member.name}님, 멤버십 가입을 환영합니다!`)
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
