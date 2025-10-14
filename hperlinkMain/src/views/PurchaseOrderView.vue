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
import { useOrderStore } from '@/stores/orders';

const productStore = useProductStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const orderStore = useOrderStore();

const isLoading = ref(true);

const isModalOpen = ref(false);
const formSubmitted = ref(false);
const orderForm = reactive({ productId: '', quantity: 1 });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('id');
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
const filteredAndSortedOrders = computed(() => {
  let orders = [...orderStore.allOrders];

  if (authStore.isStoreManager) {
    orders = orders.filter(order => order.storeName === authStore.user.name);
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    orders = orders.filter(order => 
      order.productName.toLowerCase().includes(term) || 
      order.storeName.toLowerCase().includes(term)
    );
  }

  if (filterStatus.value !== 'all') {
    orders = orders.filter(order => order.status === filterStatus.value);
  }

  if (sortKey.value) {
    orders.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return orders;
});

// --- 페이지네이션 로직 ---
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedOrders.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedOrders.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const openOrderModal = () => {
  formSubmitted.value = false;
  orderForm.productId = '';
  orderForm.quantity = 1;
  isModalOpen.value = true;
};

const handleSubmitOrder = () => {
  formSubmitted.value = true;
  if (!orderForm.productId || orderForm.quantity <= 0) {
    toastStore.showToast('상품과 수량을 올바르게 입력해주세요.', 'danger');
    return;
  }
  const product = productStore.allProducts.find(p => p.id === orderForm.productId);
  if (!product) {
    toastStore.showToast('선택된 상품을 찾을 수 없습니다.', 'danger');
    return;
  }

  orderStore.submitOrder({
    ...orderForm,
    productName: product.name,
    storeName: authStore.user.name
  });

  isModalOpen.value = false;
  toastStore.showToast('발주 요청이 완료되었습니다.', 'success');
};

const handleUpdateOrderStatus = (id, newStatus) => {
  orderStore.updateOrderStatus(id, newStatus);
  toastStore.showToast(`발주 #${id} 상태가 ${newStatus}(으)로 변경되었습니다.`, 'success');
};

const orderStatusClass = (status) => {
  switch (status) {
    case '요청 완료': return 'bg-primary';
    case '처리중': return 'bg-info';
    case '배송중': return 'bg-warning';
    case '완료': return 'bg-success';
    case '취소': return 'bg-danger';
    default: return 'bg-secondary';
  }
};
</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">발주서 목록</h5>
          <div class="d-flex">
            <input type="text" class="form-control form-control-sm me-2" placeholder="상품명/매장명 검색" v-model="searchTerm">
            <select class="form-select form-select-sm me-2" v-model="filterStatus">
              <option value="all">전체 상태</option>
              <option value="요청 완료">요청 완료</option>
              <option value="처리중">처리중</option>
              <option value="배송중">배송중</option>
              <option value="완료">완료</option>
              <option value="취소">취소</option>
            </select>
            <button v-if="authStore.isStoreManager" class="btn btn-primary btn-sm" @click="openOrderModal()">+ 새 발주서 작성</button>
          </div>
        </div>
      </template>
      
      <div v-if="paginatedOrders.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="updateSort('id')" class="sortable">발주 번호 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="id" /></th>
              <th v-if="authStore.isAdmin || authStore.isSubAdmin" @click="updateSort('storeName')" class="sortable">요청 매장 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="storeName" /></th>
              <th @click="updateSort('productName')" class="sortable">상품명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="productName" /></th>
              <th @click="updateSort('quantity')" class="sortable">수량 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="quantity" /></th>
              <th @click="updateSort('requestDate')" class="sortable">요청일 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="requestDate" /></th>
              <th @click="updateSort('status')" class="sortable">상태 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status" /></th>
              <th v-if="authStore.isAdmin || authStore.isSubAdmin">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in paginatedOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td v-if="authStore.isAdmin || authStore.isSubAdmin">{{ order.storeName }}</td>
              <td>{{ order.productName }}</td>
              <td>{{ order.quantity }}</td>
              <td>{{ order.requestDate }}</td>
              <td><span class="badge" :class="orderStatusClass(order.status)">{{ order.status }}</span></td>
              <td v-if="authStore.isAdmin || authStore.isSubAdmin">
                <button class="btn btn-sm btn-success" @click="handleUpdateOrderStatus(order.id, '처리중')">처리</button>
                <button class="btn btn-sm btn-danger ms-2" @click="handleUpdateOrderStatus(order.id, '취소')">취소</button>
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
      <BaseEmptyState v-else message="조회된 발주서가 없습니다." />
    </BaseCard>

    <!-- 발주서 작성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>새 발주서 작성</h5></template>
      <form @submit.prevent="handleSubmitOrder">
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
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleSubmitOrder">발주 요청</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
