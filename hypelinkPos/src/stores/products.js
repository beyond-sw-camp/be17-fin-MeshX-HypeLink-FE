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
    // 이미 id가 있으면 그대로 사용, 없으면 새로 생성
    const newProduct = {
      ...product,
      id: product.id || Date.now().toString()
    }
    console.log('✅ products store에 상품 추가:', newProduct)
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
  }

  const removeProductFromSlot = (slotIndex) => {
    delete posSlots.value[slotIndex]
  }

  const getProductBySlot = (slotIndex) => {
    const productId = posSlots.value[slotIndex]
    if (!productId) return null
    return products.value.find(p => p.id === productId)
  }

  const fetchProducts = async (storeId) => {
    const result = await itemAPI.getItemList(storeId)
    if (result.success) {
      console.log('📦 백엔드에서 받은 상품 데이터 샘플:', result.data.content[0])

      // Assuming result.data.content is the array of products from PageRes
      products.value = result.data.content.map(item => ({
            id: item.id.toString(), // Use StoreItemDetail ID (고유 ID)
            storeItemId: item.storeItemId.toString(), // StoreItem ID (백엔드 결제용)
            name: item.productName,
            price: item.price,
            category: item.category,
            stock: item.stock // Assuming stock is directly available, not stockQuantity
          }))

      console.log('✅ products store에 저장된 상품 샘플:', products.value[0])
    } else {
      console.error('Failed to fetch products:', result.message)
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
    fetchProducts
  }
})