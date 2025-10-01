import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const products = ref([
    {
      id: '1',
      name: '아메리카노',
      price: 4500,
      category: 'coffee',
      stock: 100,
      barcode: '8801234567890'
    },
    {
      id: '2',
      name: '카페라떼',
      price: 5000,
      category: 'coffee',
      stock: 100
    },
    {
      id: '3',
      name: '카푸치노',
      price: 5000,
      category: 'coffee',
      stock: 100
    },
    {
      id: '4',
      name: '녹차라떼',
      price: 5500,
      category: 'tea',
      stock: 80
    },
    {
      id: '5',
      name: '초코케이크',
      price: 6500,
      category: 'dessert',
      stock: 30
    },
    {
      id: '6',
      name: '치즈케이크',
      price: 7000,
      category: 'dessert',
      stock: 25
    }
  ])

  // POS 화면에 표시될 품목 슬롯 설정 (24칸)
  // slotIndex: productId 매핑
  const posSlots = ref({
    0: '1',   // 아메리카노
    1: '2',   // 카페라떼
    2: '3',   // 카푸치노
    3: '4',   // 녹차라떼
    4: '5',   // 초코케이크
    5: '6'    // 치즈케이크
    // 나머지 슬롯(6-23)은 비어있음
  })

  const categories = ref([
    { id: 'all', name: '전체' },
    { id: 'coffee', name: '커피', color: '#6B4423' },
    { id: 'tea', name: '차', color: '#2E7D32' },
    { id: 'dessert', name: '디저트', color: '#D84315' }
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