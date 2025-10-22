import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const products = ref([
    {
      id: '1',
      name: '베이직 티셔츠',
      price: 29000,
      category: 'top',
      stock: 100,
      barcode: '8801234567890'
    },
    {
      id: '2',
      name: '슬림핏 청바지',
      price: 59000,
      category: 'bottom',
      stock: 100
    },
    {
      id: '3',
      name: '오버핏 후드티',
      price: 49000,
      category: 'top',
      stock: 100
    },
    {
      id: '4',
      name: '와이드 슬랙스',
      price: 69000,
      category: 'bottom',
      stock: 80
    },
    {
      id: '5',
      name: '레더 자켓',
      price: 149000,
      category: 'outer',
      stock: 30
    },
    {
      id: '6',
      name: '울 코트',
      price: 189000,
      category: 'outer',
      stock: 25
    }
  ])

  // POS 화면에 표시될 품목 슬롯 설정 (24칸)
  // slotIndex: productId 매핑
  const posSlots = ref({
    0: '1',   // 베이직 티셔츠
    1: '2',   // 슬림핏 청바지
    2: '3',   // 오버핏 후드티
    3: '4',   // 와이드 슬랙스
    4: '5',   // 레더 자켓
    5: '6'    // 울 코트
    // 나머지 슬롯(6-23)은 비어있음
  })

  const categories = ref([
    { id: 'all', name: '전체' },
    { id: 'top', name: '상의', color: '#4A90E2' },
    { id: 'bottom', name: '하의', color: '#7B68EE' },
    { id: 'outer', name: '아우터', color: '#E94B3C' }
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
      id: Date.now().toString()
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

  const assignProductToSlot = (slotIndex, productId) => {
    posSlots.value[slotIndex] = productId
  }

  const removeProductFromSlot = (slotIndex) => {
    delete posSlots.value[slotIndex]
  }

  const getProductBySlot = (slotIndex) => {
    const productId = posSlots.value[slotIndex]
    if (!productId) return null
    return products.value.find(p => p.id === productId)
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
    assignProductToSlot,
    removeProductFromSlot,
    getProductBySlot
  }
})