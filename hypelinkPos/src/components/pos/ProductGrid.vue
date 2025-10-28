<script setup>
import { computed } from 'vue'
import { useProductsStore } from '@/stores/products'

const props = defineProps({
  selectedCategory: String,
  searchQuery: String,
  currentPage: Number,
  isEditMode: Boolean
})

const emit = defineEmits([
  'update:selectedCategory',
  'update:searchQuery',
  'update:currentPage',
  'toggleEditMode',
  'addProduct',
  'openAddProduct',
  'removeProductFromSlot'
])

const productsStore = useProductsStore()

const totalSlots = 24 // 6 x 4 grid
const slotsPerPage = 24

const totalPages = computed(() => {
  const slotIndices = Object.keys(productsStore.posSlots).map(Number)
  if (slotIndices.length === 0) return 1
  const maxSlotIndex = Math.max(...slotIndices)
  return Math.ceil((maxSlotIndex + 1) / slotsPerPage)
})

const productSlots = computed(() => {
  const slots = Array(totalSlots).fill(null)

  for (let i = 0; i < totalSlots; i++) {
    const slotIndex = props.currentPage * slotsPerPage + i
    const product = productsStore.getProductBySlot(slotIndex)
    if (product) {
      if (props.selectedCategory === 'all' || product.category === props.selectedCategory) {
        if (!props.searchQuery) {
          slots[i] = product
        } else {
          const query = props.searchQuery.toLowerCase()
          if (product.name.toLowerCase().includes(query)) {
            slots[i] = product
          }
        }
      }
    }
  }

  return slots
})

const nextPage = () => {
  if (props.currentPage < totalPages.value - 1) {
    emit('update:currentPage', props.currentPage + 1)
  }
}

const prevPage = () => {
  if (props.currentPage > 0) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="products-section">
    <div class="section-header">
      <div class="search-bar">
        <input
          :value="searchQuery"
          type="text"
          placeholder="상품명으로 검색"
          class="search-input"
          @input="emit('update:searchQuery', $event.target.value)"
        />
      </div>
      <button class="edit-mode-btn" :class="{ active: isEditMode }" @click="emit('toggleEditMode')">
        {{ isEditMode ? '완료' : '편집' }}
      </button>
    </div>

    <div class="categories">
      <button
        v-for="category in productsStore.categories"
        :key="category.id"
        class="category-btn"
        :class="{ active: selectedCategory === category.id }"
        @click="emit('update:selectedCategory', category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="products-grid-wrapper">
      <div class="products-grid">
        <div
          v-for="(product, index) in productSlots"
          :key="index"
          class="product-card"
          :class="{ empty: !product, 'edit-mode': isEditMode }"
          @click="product && !isEditMode ? emit('addProduct', product) : (!product ? emit('openAddProduct', index) : null)"
        >
          <template v-if="product && isEditMode">
            <button class="delete-slot-btn" @click.stop="emit('removeProductFromSlot', index)">✕</button>
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ formatPrice(product.price) }}</div>
            <div class="product-stock">재고: {{ product.stock }}</div>
          </template>
          <template v-else-if="product">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">{{ formatPrice(product.price) }}</div>
            <div class="product-stock">재고: {{ product.stock }}</div>
          </template>
          <template v-else-if="isEditMode">
            <div class="add-product-btn">+</div>
          </template>
        </div>
      </div>

      <div class="pagination">
        <button class="page-btn" :disabled="currentPage === 0" @click="prevPage">
          ◀ 이전
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages - 1" @click="nextPage">
          다음 ▶
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  height: 100%;
}

@media (min-width: 768px) {
  .products-section {
    padding: 16px;
  }
}

@media (min-width: 1280px) {
  .products-section {
    padding: 20px;
  }
}

.section-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-bar {
  flex: 1;
  max-width: 600px;
}

.edit-mode-btn {
  padding: 16px 32px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: white;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.edit-mode-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.edit-mode-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.categories {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  flex-shrink: 0;
}

.category-btn {
  padding: 14px 28px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background: white;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.category-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.products-grid-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.products-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 12px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  margin-top: 16px;
  flex-shrink: 0;
}

.page-btn {
  padding: 12px 24px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: #f0f7ff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
}

.product-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100px;
  position: relative;
}

.product-card:hover:not(.empty) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 100, 255, 0.15);
}

.product-card.empty {
  background: var(--bg-gray);
  border: 2px dashed var(--border-color);
  cursor: default;
}

.product-card.empty.edit-mode {
  cursor: pointer;
  border-color: var(--primary-color);
}

.product-card.empty.edit-mode:hover {
  background: #f0f7ff;
}

.delete-slot-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--error-color);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.delete-slot-btn:hover {
  background: #D03A47;
  transform: scale(1.1);
}

.product-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 3px;
  color: var(--text-primary);
  word-break: keep-all;
  line-height: 1.3;
}

.product-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 3px;
}

.product-stock {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.add-product-btn {
  font-size: 40px;
  color: var(--primary-color);
  font-weight: 300;
}
</style>
