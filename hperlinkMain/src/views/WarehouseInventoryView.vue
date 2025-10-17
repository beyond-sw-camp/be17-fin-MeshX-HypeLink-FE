<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useProductStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useWarehouseStore } from '@/stores/warehouse';

const productStore = useProductStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const warehouseStore = useWarehouseStore();

const isLoading = ref(true);

const isOrderModalOpen = ref(false);
const formSubmitted = ref(false);
const orderForm = reactive({ productId: '', quantity: 1, supplier: '' });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedInventory = computed(() => {
  let inventory = [...warehouseStore.allInventory];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    inventory = inventory.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.code.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }

  if (filterCategory.value !== 'all') {
    inventory = inventory.filter(item => item.category === filterCategory.value);
  }

  if (sortKey.value) {
    inventory.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return inventory;
});

// --- 페이지네이션 로직 ---
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedInventory.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedInventory.value.length / itemsPerPage.value));

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

const handleSubmitHeadOfficeOrder = () => {
  formSubmitted.value = true;
  if (!orderForm.productId || orderForm.quantity <= 0 || !orderForm.supplier) {
    toastStore.showToast('모든 발주 정보를 올바르게 입력해주세요.', 'danger');
    return;
  }

  warehouseStore.submitHeadOfficeOrder(orderForm);
  toastStore.showToast(`발주 요청이 완료되었습니다.`, 'success');

  isOrderModalOpen.value = false;
  Object.assign(orderForm, { productId: '', quantity: 1, supplier: '' });
};
</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">중앙 창고 재고 현황</h5>
          <div class="d-flex">
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
            <button v-if="authStore.isAdmin || authStore.isManager" class="btn btn-primary btn-sm" @click="isOrderModalOpen = true">+ 본사 발주</button>
          </div>
        </div>
      </template>
      
      <div v-if="paginatedInventory.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="updateSort('code')" class="sortable">상품 코드 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="code" /></th>
              <th @click="updateSort('name')" class="sortable">상품명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="updateSort('category')" class="sortable">카테고리 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="category" /></th>
              <th>현재고</th>
              <th>안전재고</th>
              <th @click="updateSort('status')" class="sortable">상태 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status" /></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedInventory" :key="item.id">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.currentStock }}</td>
              <td>{{ item.safeStock }}</td>
              <td>
                <span class="badge" :class="item.currentStock > item.safeStock ? 'bg-success' : (item.currentStock > 0 ? 'bg-warning' : 'bg-danger')">{{ item.currentStock > item.safeStock ? '양호' : (item.currentStock > 0 ? '주의' : '품절') }}</span>
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
      <BaseEmptyState v-else message="조회된 재고가 없습니다." />
    </BaseCard>

    <!-- 본사 발주 모달 -->
    <BaseModal v-model="isOrderModalOpen">
      <template #header><h5>본사 발주 요청</h5></template>
      <form @submit.prevent="handleSubmitHeadOfficeOrder">
        <div class="mb-3">
          <label class="form-label">상품명 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="orderForm.productId" :class="{ 'is-invalid': !orderForm.productId && formSubmitted }">
            <option disabled value="">상품 선택</option>
            <option v-for="product in productStore.allProducts" :key="product.id" :value="product.id">{{ product.name }} ({{ product.code }})</option>
          </select>
          <div class="invalid-feedback">상품을 선택해주세요.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">수량 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" v-model.number="orderForm.quantity" min="1" :class="{ 'is-invalid': (!orderForm.quantity || orderForm.quantity <= 0) && formSubmitted }">
          <div class="invalid-feedback">수량은 1개 이상이어야 합니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">공급처 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="orderForm.supplier" :class="{ 'is-invalid': !orderForm.supplier && formSubmitted }">
            <option disabled value="">공급처 선택</option>
            <option v-for="supplier in warehouseStore.suppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
          </select>
          <div class="invalid-feedback">공급처를 선택해주세요.</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isOrderModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleSubmitHeadOfficeOrder">발주 요청</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>