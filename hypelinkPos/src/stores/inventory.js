import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductsStore } from './products'

export const useInventoryStore = defineStore('inventory', () => {
  const stockHistory = ref([])
  const minStockSettings = ref({}) // 최소 재고 설정 저장

  const productsStore = useProductsStore()

  const inventoryItems = computed(() => {
    return productsStore.products.map(product => ({
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      minStock: minStockSettings.value[product.id] || 10
    }))
  })

  const lowStockItems = computed(() => {
    return inventoryItems.value.filter(item => item.currentStock <= item.minStock)
  })

  const addStock = (productId, quantity, reason) => {
    productsStore.updateStock(productId, quantity)

    const history = {
      id: `STK${Date.now()}`,
      productId,
      type: 'in',
      quantity,
      reason,
      createdAt: new Date()
    }

    stockHistory.value.unshift(history)
  }

  const removeStock = (productId, quantity, reason) => {
    productsStore.updateStock(productId, -quantity)

    const history = {
      id: `STK${Date.now()}`,
      productId,
      type: 'out',
      quantity,
      reason,
      createdAt: new Date()
    }

    stockHistory.value.unshift(history)
  }

  const adjustStock = (productId, newQuantity, reason) => {
    const product = productsStore.getProductById(productId)
    if (!product) return

    const difference = newQuantity - product.stock
    productsStore.updateStock(productId, difference)

    const history = {
      id: `STK${Date.now()}`,
      productId,
      type: 'adjustment',
      quantity: difference,
      reason,
      createdAt: new Date()
    }

    stockHistory.value.unshift(history)
  }

  const getStockHistory = (productId) => {
    if (!productId) return stockHistory.value
    return stockHistory.value.filter(h => h.productId === productId)
  }

  const updateMinStock = (productId, minStock) => {
    minStockSettings.value[productId] = minStock
  }

  const deleteInventory = (productId) => {
    // 최소 재고 설정 제거
    delete minStockSettings.value[productId]
    // 해당 상품의 재고 히스토리 제거
    stockHistory.value = stockHistory.value.filter(h => h.productId !== productId)
  }

  return {
    inventoryItems,
    lowStockItems,
    stockHistory,
    addStock,
    removeStock,
    adjustStock,
    getStockHistory,
    updateMinStock,
    deleteInventory
  }
})