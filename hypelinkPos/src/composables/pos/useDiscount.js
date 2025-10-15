import { ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'

export function useDiscount() {
  const ordersStore = useOrdersStore()

  // State
  const showDiscountModal = ref(false)
  const showDiscountKeypad = ref(false)
  const discountType = ref('amount')
  const discountValue = ref('')
  const selectedDiscountItems = ref([])

  // Actions
  const openDiscountModal = () => {
    if (ordersStore.currentOrder.length === 0) return
    showDiscountModal.value = true
    discountType.value = 'amount'
    discountValue.value = ''
    selectedDiscountItems.value = []
  }

  const closeDiscountModal = () => {
    showDiscountModal.value = false
    discountValue.value = ''
    selectedDiscountItems.value = []
  }

  const openDiscountKeypad = () => {
    showDiscountKeypad.value = true
  }

  const confirmDiscountValue = (value) => {
    discountValue.value = value
    showDiscountKeypad.value = false
  }

  const selectAllItems = () => {
    selectedDiscountItems.value = ordersStore.currentOrder.map(item => item.productId)
  }

  const applyDiscount = () => {
    const value = parseInt(discountValue.value)
    if (!value || value <= 0) {
      alert('할인 금액/비율을 입력해주세요.')
      return
    }

    if (discountType.value === 'percent' && value > 100) {
      alert('할인율은 100%를 초과할 수 없습니다.')
      return
    }

    if (selectedDiscountItems.value.length === 0) {
      ordersStore.currentOrder.forEach(item => {
        applyDiscountToItem(item.productId, value)
      })
    } else {
      selectedDiscountItems.value.forEach(productId => {
        applyDiscountToItem(productId, value)
      })
    }

    closeDiscountModal()
  }

  const applyDiscountToItem = (productId, value) => {
    const item = ordersStore.currentOrder.find(i => i.productId === productId)
    if (!item) return

    let discountAmount = 0
    if (discountType.value === 'amount') {
      discountAmount = value
    } else {
      discountAmount = Math.floor((item.price * item.quantity * value) / 100)
    }

    const maxDiscount = item.price * item.quantity
    discountAmount = Math.min(discountAmount, maxDiscount)

    const newPrice = Math.max(0, Math.floor((item.price * item.quantity - discountAmount) / item.quantity))
    ordersStore.updatePrice(productId, newPrice)
  }

  return {
    // State
    showDiscountModal,
    showDiscountKeypad,
    discountType,
    discountValue,
    selectedDiscountItems,

    // Actions
    openDiscountModal,
    closeDiscountModal,
    openDiscountKeypad,
    confirmDiscountValue,
    selectAllItems,
    applyDiscount
  }
}
