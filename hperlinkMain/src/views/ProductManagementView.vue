<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useProductStore } from '@/stores/products';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';

const productStore = useProductStore();
const toastStore = useToastStore();
const modalStore = useModalStore();

const allProducts = ref([]);
const isLoading = ref(true);

const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const productForm = reactive({
  id: null,
  code: '',
  name: '',
  category: '상의',
  price: 0,
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// 일괄 선택 관련 상태
const selectedProducts = ref(new Set());

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    // productStore에서 데이터를 가져오도록 수정
    allProducts.value = productStore.allProducts;
    isLoading.value = false;
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedProducts = computed(() => {
  let products = [...allProducts.value];
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    products = products.filter(product => 
      product.name.toLowerCase().includes(term) || 
      product.code.toLowerCase().includes(term)
    );
  }
  if (filterCategory.value !== 'all') {
    products = products.filter(product => product.category === filterCategory.value);
  }
  if (sortKey.value) {
    products.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return products;
});

// --- 페이지네이션 로직 ---
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedProducts.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedProducts.value.length / itemsPerPage.value));

// --- 일괄 선택 로직 ---
const isAllSelected = computed(() => {
  if (paginatedProducts.value.length === 0) return false;
  return paginatedProducts.value.every(p => selectedProducts.value.has(p.id));
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    paginatedProducts.value.forEach(p => selectedProducts.value.delete(p.id));
  } else {
    paginatedProducts.value.forEach(p => selectedProducts.value.add(p.id));
  }
};

// --- 이벤트 핸들러 ---
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

const openProductModal = (product = null) => {
  formSubmitted.value = false;
  if (product) {
    isEditing.value = true;
    Object.assign(productForm, product);
  } else {
    isEditing.value = false;
    Object.assign(productForm, { id: null, code: '', name: '', category: '상의', price: 0 });
  }
  isModalOpen.value = true;
};

const saveProduct = () => {
  formSubmitted.value = true;
  if (!productForm.code || !productForm.name || !productForm.price || productForm.price <= 0) {
    toastStore.showToast('상품 코드, 상품명, 가격은 필수이며, 가격은 0보다 커야 합니다.', 'danger');
    return;
  }
  if (isEditing.value) {
    productStore.updateProduct(productForm);
  } else {
    productStore.addProduct(productForm);
  }
  allProducts.value = productStore.allProducts; // 데이터 다시 동기화
  isModalOpen.value = false;
};

const deleteProduct = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 상품을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    productStore.deleteProduct(id);
    allProducts.value = productStore.allProducts;
    toastStore.showToast('상품이 삭제되었습니다.', 'success');
  }
};

const deleteSelectedProducts = async () => {
  const confirmed = await modalStore.show({
    title: '일괄 삭제 확인',
    message: `${selectedProducts.value.size}개의 상품을 정말 삭제하시겠습니까?`,
    isConfirmation: true,
  });
  if (confirmed) {
    productStore.deleteMultipleProducts(Array.from(selectedProducts.value));
    allProducts.value = productStore.allProducts;
    selectedProducts.value.clear();
    toastStore.showToast('선택된 상품이 삭제되었습니다.', 'success');
  }
};

</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">상품 목록</h5>
          <div class="d-flex align-items-center">
            <button v-if="selectedProducts.size > 0" class="btn btn-danger btn-sm me-2" @click="deleteSelectedProducts">{{ selectedProducts.size }}개 선택 항목 삭제</button>
            <div class="me-2">
              <input type="text" class="form-control form-control-sm" placeholder="상품명/코드 검색" v-model="searchTerm">
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterCategory">
                <option value="all">전체 카테고리</option>
                <option value="상의">상의</option>
                <option value="하의">하의</option>
                <option value="아우터">아우터</option>
                <option value="악세서리">악세서리</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" @click="openProductModal()">+ 새 상품 등록</button>
          </div>
        </div>
      </template>
      
      <div v-if="paginatedProducts.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th style="width: 1%;"><input class="form-check-input" type="checkbox" @change="toggleSelectAll" :checked="isAllSelected"></th>
              <th @click="updateSort('code')" class="sortable">상품 코드 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="code" /></th>
              <th @click="updateSort('name')" class="sortable">상품명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="updateSort('category')" class="sortable">카테고리 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="category" /></th>
              <th @click="updateSort('price')" class="sortable">가격 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="price" /></th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in paginatedProducts" :key="product.id" :class="{ 'table-active': selectedProducts.has(product.id) }">
              <td><input class="form-check-input" type="checkbox" :value="product.id" :checked="selectedProducts.has(product.id)" @change="selectedProducts.has(product.id) ? selectedProducts.delete(product.id) : selectedProducts.add(product.id)"></td>
              <td>{{ product.code }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.category }}</td>
              <td>{{ product.price.toLocaleString() }}원</td>
              <td>
                <button class="btn btn-sm btn-outline-secondary me-2" @click="openProductModal(product)">수정</button>
                <button class="btn btn-sm btn-danger" @click="deleteProduct(product.id)">삭제</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 상품이 없습니다." />
    </BaseCard>

    <!-- 상품 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '상품 수정' : '새 상품 등록' }}</h5></template>
      <form @submit.prevent="saveProduct">
        <div class="mb-3">
          <label class="form-label">상품 코드 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="productForm.code" :class="{ 'is-invalid': !productForm.code && formSubmitted }">
          <div class="invalid-feedback">상품 코드는 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">상품명 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="productForm.name" :class="{ 'is-invalid': !productForm.name && formSubmitted }">
          <div class="invalid-feedback">상품명은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">카테고리</label>
          <select class="form-select" v-model="productForm.category">
            <option>상의</option>
            <option>하의</option>
            <option>아우터</option>
            <option>악세서리</option>
            <option>기타</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">가격 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" v-model.number="productForm.price" :class="{ 'is-invalid': (!productForm.price || productForm.price <= 0) && formSubmitted }">
          <div class="invalid-feedback">가격은 0보다 커야 합니다.</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="saveProduct">저장</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
