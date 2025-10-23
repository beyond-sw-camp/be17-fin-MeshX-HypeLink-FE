<script setup>
import {ref, reactive, computed, onMounted} from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import {useProductStore} from '@/stores/products';
import {useAuthStore} from '@/stores/auth';
import {useToastStore} from '@/stores/toast';
import {useOrderStore} from '@/stores/orders';

import purchaseOrderApi from '@/api/purchase-order'

const productStore = useProductStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const orderStore = useOrderStore();

const isLoading = ref(true);
const orderStates = ref([]);

const checkOrder = ref(false);
const currentOrder = ref(null);
const isModalOpen = ref(false);
const isCheckModalOpen = ref(false);
const formSubmitted = ref(false);
const orderForm = reactive({
  productId: '',
  quantity: 1
});
const updateOrderForm = reactive({
  orderId: 0,
  orderState: ''
})

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const allProducts = ref([]);
const totalPages = ref(0);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  loadItems(1); // 초기 로드 시 서버에서 페이징 데이터 불러오기
  getOrderStates();
});

const loadItems = async (page = 1) => {
  try {
    isLoading.value = true;

    const response = await purchaseOrderApi.getPurchaseOrder(page - 1, itemsPerPage.value, `${sortKey.value},${sortOrder.value}`);
    if (response.status === 200 && response.data) {
      const pageData = response.data.data;
      allProducts.value = pageData.content;
      totalPages.value = pageData.totalPages;
      currentPage.value = pageData.currentPage + 1; // Spring Pageable은 0-based
    } else {
      console.error('상품 목록 로딩 실패:', response);
    }
  } catch (e) {
    console.error('서버 통신 오류:', e);
  } finally {
    isLoading.value = false;
  }
};

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

const updatePage = async (page) => {
  if (page < 1 || page > totalPages.value) return;
  await loadItems(page);
};

const handleSubmitOrder = async () => {
  formSubmitted.value = true;
  if (!orderForm.productId) {
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
  await loadItems(currentPage + 1);
  toastStore.showToast('발주 요청이 완료되었습니다.', 'success');
};

const handleUpdateOrderStatus = async (id, newStatus) => {
  updateOrderForm.orderId = id;
  updateOrderForm.orderState = newStatus;

  let res = await purchaseOrderApi.updatePurchaseOrder(updateOrderForm);

  updateOrderForm.orderId = 0;
  updateOrderForm.orderState = '';
  closeCompleteModal();
  await loadItems(currentPage.value);

  if (res.status === 200) {
    toastStore.showToast(`발주 #${id} 상태가 ${newStatus}(으)로 변경되었습니다.`, 'success');
    return;
  }
  toastStore.showToast(`발주 상태 수정에 실패했습니다.`, 'danger');
};

const openCompleteModal = (order, check) => {
  currentOrder.value = order;
  checkOrder.value = !!check;
  isCheckModalOpen.value = true;
}

const closeCompleteModal = () => {
  isCheckModalOpen.value = false;
}

const getOrderStates = async () => {
  let res = await purchaseOrderApi.getPurchaseOrderStates();
  if(res.status !== 200) {
    toastStore.showToast(res.message, "danger")
  }
  orderStates.value = res.data.data.purchaseOrderStates;
}

const orderStatusClass = (status) => {
  switch (status) {
    case '발주 요청됨':
      return 'bg-primary';
    case '수령 완료':
      return 'bg-success';
    case '요청 취소':
      return 'bg-danger';
    default:
      return 'bg-secondary';
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
              <option v-for="cat in orderStates" :key="cat.description" :value="cat.description">
                {{ cat.description }}
              </option>
            </select>
          </div>
        </div>
      </template>

      <div v-if="allProducts.length > 0">
        <table class="table table-hover">
          <thead>
          <tr>
            <th @click="updateSort('id')" class="sortable">발주 번호
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="id"/>
            </th>
            <th v-if="authStore.isAdmin || authStore.isManager" @click="updateSort('deliveryRequest')" class="sortable">요청 매장
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="storeName"/>
            </th>
            <th @click="updateSort('itemName')" class="sortable">상품명
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="productName"/>
            </th>
            <th @click="updateSort('itemDetailCode')" class="sortable">상품 상세 코드
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="productName"/>
            </th>
            <th @click="updateSort('quantity')" class="sortable">수량
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="quantity"/>
            </th>
            <th @click="updateSort('requestDay')" class="sortable">요청일
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="requestDate"/>
            </th>
            <th @click="updateSort('detailState')" class="sortable">발주 내역
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="detailState"/>
            </th>
            <th @click="updateSort('status')" class="sortable">상태
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status"/>
            </th>
            <th v-if="authStore.isAdmin || authStore.isManager">관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="order in allProducts" :key="order.id">
            <td>{{ order.id }}</td>
            <td v-if="authStore.isAdmin || authStore.isManager">{{ order.deliveryRequest }}</td>
            <td>{{ order.itemName }}</td>
            <td>{{ order.itemDetailCode }}</td>
            <td>{{ order.quantity }}</td>
            <td>{{ order.requestDay }}</td>
            <td>{{ order.detailState }}</td>
            <td><span class="badge" :class="orderStatusClass(order.status)">{{ order.status }}</span></td>
            <td v-if="(authStore.isAdmin || authStore.isManager) && (order.status !== '수령 완료' && order.status !== '요청 취소')">
              <button class="btn btn-sm btn-success" @click="openCompleteModal(order, true)">처리</button>
              <button class="btn btn-sm btn-danger ms-2" @click="openCompleteModal(order, false)">취소
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages >= 1">
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
      <BaseEmptyState v-else message="조회된 발주서가 없습니다."/>
    </BaseCard>

    <!-- 발주서 작성 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>새 발주서 작성</h5></template>
      <form @submit.prevent="handleSubmitOrder">
        <div class="mb-3">
          <label class="form-label">상품명 <span class="text-danger">*</span></label>
          <select class="form-select" v-model="orderForm.productId"
                  :class="{ 'is-invalid': !orderForm.productId && formSubmitted }">
            <option disabled value="">상품 선택</option>
            <option v-for="product in productStore.allProducts" :key="product.id" :value="product.id">{{ product.name }}
              ({{ product.code }})
            </option>
          </select>
          <div class="invalid-feedback">상품을 선택해주세요.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">수량 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" v-model.number="orderForm.quantity" min="1"
                 :class="{ 'is-invalid': (!orderForm.quantity) && formSubmitted }">
          <div class="invalid-feedback">수량을 입력해주세요</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="handleSubmitOrder">발주 요청</button>
      </template>
    </BaseModal>

    <!-- 실제 입고 처리 하기 전 모달 창 -->
    <BaseModal v-model="isCheckModalOpen">
      <template #header>
        <h5>{{ checkOrder ? '입고 처리' : '입고 취소' }}</h5>
      </template>

      <div class="mb-3">
        <div class="p-2 border rounded bg-light fw-bold text-dark">
          {{ checkOrder ? '입고 처리 하시겠습니까?' : '입고 취소 하시겠습니까?' }}
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="closeCompleteModal">닫기</button>
        <button
            class="btn"
            :class="checkOrder ? 'btn-primary' : 'btn-danger'"
            @click="handleUpdateOrderStatus(currentOrder.id, checkOrder ? 'COMPLETED' : 'CANCELED')"
        >
          {{ checkOrder ? '입고' : '취소' }}
        </button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px"/>
  </div>
</template>
