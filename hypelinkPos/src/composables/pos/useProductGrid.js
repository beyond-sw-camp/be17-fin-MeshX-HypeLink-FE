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

  const addProductToSlot = (item) => {
    showAddProductModal.value = false
    const absoluteSlotIndex = currentPage.value * slotsPerPage + selectedSlot.value

    // API에서 가져온 상품 데이터를 products에 추가
    const productId = item.id.toString() // Use StoreItemDetail ID (고유 ID)
    const existingProduct = productsStore.getProductById(productId)

    if (!existingProduct) {
      // 새 상품이면 products에 추가
      productsStore.addProduct({
        id: productId,
        storeItemId: item.storeItemId.toString(), // StoreItem ID (백엔드 결제용)
        name: item.productName,
        price: item.price,
        category: item.category || 'all',
        stock: item.stock
      })
    }

    // 슬롯에 할당
    productsStore.assignProductToSlot(absoluteSlotIndex, productId)
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
