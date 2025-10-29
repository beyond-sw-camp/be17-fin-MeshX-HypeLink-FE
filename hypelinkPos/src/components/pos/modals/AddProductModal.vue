<script setup>
import { ref, computed, onMounted } from 'vue'
import itemAPI from '@/api/item'
import categoryAPI from '@/api/category'

const emit = defineEmits(['close', 'select'])

// State
const selectedCategory = ref('all')
const searchQuery = ref('')
const currentPage = ref(0)
const items = ref([])
const totalPages = ref(1)
const totalCount = ref(0)
const categories = ref([
  { id: 'all', name: '전체' }
])
const loading = ref(false)

// Fetch items
const fetchItems = async () => {
  loading.value = true
  let result = {}

  // 검색어가 있으면 검색 API (한글명, 영문명, 바코드)
  if (searchQuery.value.trim()) {
    result = await itemAPI.searchItems(searchQuery.value.trim(), currentPage.value, 12)
  }
  // 카테고리 선택되었으면 카테고리 API
  else if (selectedCategory.value !== 'all') {
    result = await itemAPI.getItemsByCategory(selectedCategory.value, currentPage.value, 12)
  }
  // 전체 조회
  else {
    result = await itemAPI.getItemList(currentPage.value, 12)
  }

  if (result.success) {
    const pageData = result.data
    items.value = pageData.content || []
    totalPages.value = pageData.totalPages || 1
    totalCount.value = pageData.totalElements || 0
  } else {
    console.error('Failed to fetch items:', result.message)
    items.value = []
  }

  loading.value = false
}

// Fetch categories
const fetchCategories = async () => {
  const result = await categoryAPI.getCategoryList()

  if (result.success && result.data.categories) {
    categories.value = [
      { id: 'all', name: '전체' },
      ...result.data.categories.map(cat => ({
        id: cat.category,
        name: cat.category
      }))
    ]
  } else {
    console.error('Failed to fetch categories:', result.message)
  }
}

// Watchers
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 0
  fetchItems()
}

const handleSearch = () => {
  currentPage.value = 0
  fetchItems()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    fetchItems()
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    fetchItems()
  }
}

const selectItem = (item) => {
  emit('select', item)
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

onMounted(() => {
  fetchCategories()
  fetchItems()
})
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>품목 추가</h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="modal-filters">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="상품명, 영문명, 바코드로 검색"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">검색</button>
        </div>

        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-btn"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">로딩 중...</div>
        <div v-else-if="items.length === 0" class="empty-state">
          상품이 없습니다.
        </div>
        <div v-else class="product-select-grid">
          <div
            v-for="item in items"
            :key="item.id"
            class="product-select-card"
            @click="selectItem(item)"
          >
            <div class="product-select-name">{{ item.productName }}</div>
            <div class="product-select-price">{{ formatPrice(item.price) }}</div>
            <div class="product-select-stock">재고: {{ item.stock }}</div>
            <div class="product-select-code">{{ item.itemDetailCode }}</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 0" @click="prevPage">
            ◀ 이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages - 1" @click="nextPage">
            다음 ▶
          </button>
        </div>
        <div class="total-count">총 {{ totalCount }}개 상품</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-gray);
}

.modal-filters {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-btn {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover {
  background: #0052CC;
}

.categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: white;
  font-size: 14px;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 16px;
}

.product-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.product-select-card {
  background: var(--bg-gray);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.product-select-card:hover {
  border-color: var(--primary-color);
  background: #f0f7ff;
  transform: translateY(-2px);
}

.product-select-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  word-break: keep-all;
}

.product-select-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.product-select-stock {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.product-select-code {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
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
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
}

.total-count {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}
</style>
