import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import itemAPI from '@/api/item'

export const useProductsStore = defineStore('products', () => {
  // 실제 DB에서 가져온 상품만 저장
  const products = ref([])

  // POS 화면에 표시될 품목 슬롯 설정 (24칸)
  // slotIndex: productId 매핑
  const posSlots = ref({})

  // 카테고리는 API에서 가져옴
  const categories = ref([
    { id: 'all', name: '전체' }
  ])

  const getProductById = (id) => {
    return products.value.find(p => p.id === id)
  }

  const getProductsByCategory = (categoryId) => {
    if (categoryId === 'all') return products.value
    return products.value.filter(p => p.category === categoryId)
  }

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString()
    }
    products.value.push(newProduct)
    return newProduct
  }

  const updateProduct = (id, updates) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updates }
    }
  }

  const deleteProduct = (id) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }

  const updateStock = (id, quantity) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      product.stock += quantity
    }
  }

  const addCategory = (category) => {
    categories.value.push(category)
  }

  const setCategories = (newCategories) => {
    categories.value = newCategories
  }

  const assignProductToSlot = (slotIndex, productId) => {
    posSlots.value[slotIndex] = productId
    saveSlotsToLocalStorage()
  }

  const removeProductFromSlot = (slotIndex) => {
    delete posSlots.value[slotIndex]
    saveSlotsToLocalStorage()
  }

  const getProductBySlot = (slotIndex) => {
    const productId = posSlots.value[slotIndex]
    if (!productId) return null
    return products.value.find(p => p.id === productId)
  }

  const loadSlotsFromLocalStorage = () => {
    const savedSlots = localStorage.getItem('posSlots')
    if (savedSlots) {
      try {
        posSlots.value = JSON.parse(savedSlots)
        return true
      } catch (error) {
        return false
      }
    }
    return false
  }

  const saveSlotsToLocalStorage = () => {
    try {
      localStorage.setItem('posSlots', JSON.stringify(posSlots.value))
    } catch (error) {
      // Silent fail
    }
  }

  const fetchProducts = async () => {
    const result = await itemAPI.getItemList()
    if (result.success) {
      products.value = result.data.content.map(item => ({
            id: item.id.toString(),
            storeItemId: item.storeItemId.toString(),
            name: item.productName,
            price: item.price,
            category: item.category,
            stock: item.stock
          }))

      const hasExistingSlots = loadSlotsFromLocalStorage()

      if (!hasExistingSlots || Object.keys(posSlots.value).length === 0) {
        const topProducts = products.value.slice(0, 10)
        topProducts.forEach((product, index) => {
          posSlots.value[index] = product.id
        })
        saveSlotsToLocalStorage()
      }
    }
  }

  return {
    products,
    categories,
    posSlots,
    getProductById,
    getProductsByCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addCategory,
    setCategories,
    assignProductToSlot,
    removeProductFromSlot,
    getProductBySlot,
    loadSlotsFromLocalStorage,
    saveSlotsToLocalStorage,
    fetchProducts
  }
})