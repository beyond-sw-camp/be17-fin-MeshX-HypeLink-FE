import { ref } from 'vue'
import { useOrdersStore } from '@/stores/orders'

export function useOrder() {
  const ordersStore = useOrdersStore()

  // State
  const showHeldOrders = ref(false)

  // Actions
  const addProduct = (product) => {
    ordersStore.addToOrder({
      productId: product.id, // StoreItemDetail ID (프론트엔드 구분용)
      storeItemId: product.storeItemId, // StoreItem ID (백엔드 결제용)
      productName: product.name,
      quantity: 1,
      price: product.price,
      subtotal: product.price
    })
  }

  const updateItemQuantity = (productId, quantity) => {
    ordersStore.updateQuantity(productId, quantity)
  }

  const removeItem = (productId) => {
    ordersStore.removeFromOrder(productId)
  }

  const cancelOrder = () => {
    if (confirm('주문을 취소하시겠습니까?')) {
      ordersStore.cancelOrder()
    }
  }

  const holdCurrentOrder = () => {
    const result = ordersStore.holdOrder()
    if (result) {
      alert('주문이 보류되었습니다.')
    }
  }

  const retrieveHeldOrder = (holdId) => {
    const result = ordersStore.retrieveOrder(holdId)
    if (result) {
      showHeldOrders.value = false
    }
  }

  const removeHeld = (holdId) => {
    if (confirm('보류 주문을 삭제하시겠습니까?')) {
      ordersStore.removeHeldOrder(holdId)
    }
  }

  return {
    // State
    showHeldOrders,

    // Actions
    addProduct,
    updateItemQuantity,
    removeItem,
    cancelOrder,
    holdCurrentOrder,
    retrieveHeldOrder,
    removeHeld
  }
}
