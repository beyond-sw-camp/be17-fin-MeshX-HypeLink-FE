import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrdersStore = defineStore('orders', () => {
  const currentOrder = ref([])
  const orders = ref([])
  const heldOrders = ref([])

  const addToOrder = (item) => {
    const existingItem = currentOrder.value.find(i => i.productId === item.productId)

    if (existingItem) {
      existingItem.quantity += item.quantity
      existingItem.subtotal = existingItem.quantity * existingItem.price
    } else {
      currentOrder.value.push(item)
    }
  }

  const removeFromOrder = (productId) => {
    const index = currentOrder.value.findIndex(i => i.productId === productId)
    if (index !== -1) {
      currentOrder.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = currentOrder.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromOrder(productId)
      } else {
        item.quantity = quantity
        item.subtotal = item.quantity * item.price
      }
    }
  }

  const updatePrice = (productId, newPrice) => {
    const item = currentOrder.value.find(i => i.productId === productId)
    if (item) {
      item.price = newPrice
      item.subtotal = item.quantity * item.price
    }
  }

  const clearOrder = () => {
    currentOrder.value = []
  }

  const getOrderTotal = () => {
    return currentOrder.value.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const completeOrder = (paymentMethod) => {
    if (currentOrder.value.length === 0) return null

    const order = {
      id: `ORD${Date.now()}`,
      items: [...currentOrder.value],
      total: getOrderTotal(),
      status: 'completed',
      createdAt: new Date(),
      paymentMethod
    }

    orders.value.unshift(order)
    clearOrder()
    return order
  }

  const cancelOrder = () => {
    clearOrder()
  }

  const getOrderById = (id) => {
    return orders.value.find(o => o.id === id)
  }

  const holdOrder = () => {
    if (currentOrder.value.length === 0) return null

    const heldOrder = {
      id: `HOLD${Date.now()}`,
      items: [...currentOrder.value],
      timestamp: new Date()
    }

    heldOrders.value.push(heldOrder)
    clearOrder()
    return heldOrder
  }

  const retrieveOrder = (holdId) => {
    const index = heldOrders.value.findIndex(o => o.id === holdId)
    if (index === -1) return false

    const heldOrder = heldOrders.value[index]
    currentOrder.value = [...heldOrder.items]
    heldOrders.value.splice(index, 1)
    return true
  }

  const removeHeldOrder = (holdId) => {
    const index = heldOrders.value.findIndex(o => o.id === holdId)
    if (index !== -1) {
      heldOrders.value.splice(index, 1)
    }
  }

  return {
    currentOrder,
    orders,
    heldOrders,
    addToOrder,
    removeFromOrder,
    updateQuantity,
    updatePrice,
    clearOrder,
    getOrderTotal,
    completeOrder,
    cancelOrder,
    getOrderById,
    holdOrder,
    retrieveOrder,
    removeHeldOrder
  }
})