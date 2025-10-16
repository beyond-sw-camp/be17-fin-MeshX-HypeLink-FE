import { ref } from 'vue'
import { useProductsStore } from '@/stores/products'

export function useProductGrid() {
  const productsStore = useProductsStore()

  // State
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const currentPage = ref(0)
  const isEditMode = ref(false)
  const showAddProductModal = ref(false)
  const selectedSlot = ref(null)

  const slotsPerPage = 24

  // Actions
  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
  }

  const openAddProduct = (slotIndex) => {
    if (isEditMode.value) {
      selectedSlot.value = slotIndex
      showAddProductModal.value = true
    }
  }

  const closeAddProductModal = () => {
    showAddProductModal.value = false
    selectedSlot.value = null
  }

  const addProductToSlot = (product) => {
    showAddProductModal.value = false
    const absoluteSlotIndex = currentPage.value * slotsPerPage + selectedSlot.value
    productsStore.assignProductToSlot(absoluteSlotIndex, product.id)
    selectedSlot.value = null
  }

  const removeProductFromSlot = (slotIndex) => {
    if (!isEditMode.value) return

    const absoluteSlotIndex = currentPage.value * slotsPerPage + slotIndex
    const product = productsStore.getProductBySlot(absoluteSlotIndex)

    if (product && confirm(`${product.name}을(를) POS 화면에서 제거하시겠습니까?`)) {
      productsStore.removeProductFromSlot(absoluteSlotIndex)
    }
  }

  return {
    // State
    selectedCategory,
    searchQuery,
    currentPage,
    isEditMode,
    showAddProductModal,
    selectedSlot,

    // Actions
    toggleEditMode,
    openAddProduct,
    closeAddProductModal,
    addProductToSlot,
    removeProductFromSlot
  }
}
