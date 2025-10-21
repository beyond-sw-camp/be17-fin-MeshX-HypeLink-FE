<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';

import { useToastStore } from '@/stores/toast';
import { useWarehouseStore } from '@/stores/warehouse';

import purchaseOrderApi from '@/api/purchase-order'

const toastStore = useToastStore();
const warehouseStore = useWarehouseStore();

const isLoading = ref(true);
const isOrderModalOpen = ref(false);
const formSubmitted = ref(false);
const orderForm = reactive({
  itemId: '',
  quantity: 1,
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const allProducts = ref([]);
const totalPages = ref(0);
const currentItem = ref(null);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  loadItems(1); // 초기 로드 시 서버에서 페이징 데이터 불러오기
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

// === 페이지 초기화 ===
const loadItems = async (page = 1) => {
  try {
    isLoading.value = true;

    const response = await purchaseOrderApi.getHeadPurchaseOrder(page - 1, itemsPerPage.value, `${sortKey.value},${sortOrder.value}`);
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

// === 페이지 이동 ===
const updatePage = async (page) => {
  if (page < 1 || page > totalPages.value) return;
  await loadItems(page);
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

const orderItem = (item = null) => {
  if(item === null) {
    return;
  }
  currentItem.value = item;
  isOrderModalOpen.value = true;
}

const handleSubmitHeadOfficeOrder = async () => {
  formSubmitted.value = true;
  orderForm.itemId = currentItem.value.id;
  if (!orderForm.itemId || orderForm.quantity <= 0) {
    toastStore.showToast('모든 발주 정보를 올바르게 입력해주세요.', 'danger');
    return;
  }
  await purchaseOrderApi.saveNewPurchaseOrder(orderForm);

  alert('발주가 성공적으로 생성되었습니다.');

  isOrderModalOpen.value = false;
  Object.assign(orderForm, { itemId: '', quantity: 1});
  await loadItems(1);
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
          </div>
        </div>
      </template>
      
      <div v-if="allProducts.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="updateSort('code')" class="sortable">상품 코드 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemCode" /></th>
              <th @click="updateSort('code')" class="sortable">상품 상세 코드 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemDetailCode" /></th>
              <th @click="updateSort('name')" class="sortable">상품명(한글) <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="koName" /></th>
              <th @click="updateSort('name')" class="sortable">상품명(영문) <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="enName" /></th>
              <th @click="updateSort('category')" class="sortable">카테고리 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="category" /></th>
              <th>색상</th>
              <th>현재고</th>
              <th>발주 재고</th>
              <th>발주</th>

            </tr>
          </thead>
          <tbody>
            <tr v-for="item in allProducts" :key="item.id">
              <td>{{ item.itemCode }}</td>
              <td>{{ item.itemDetailCode }}</td>
              <td>{{ item.itemKoName }}</td>
              <td>{{ item.itemEnName }}</td>
              <td>{{ item.category }}</td>
              <td>
                <span
                  class="badge border"
                  :style="{ backgroundColor: item.colorCode, color: '#fff' }"
                >
                  {{ item.color }}
                </span>
              </td>
              <td>{{ item.stock }}개</td>
              <td>{{ item.totalQuantity }}개</td>
              <td>
                <button class="btn btn-outline-primary btn-sm" @click="orderItem(item)">발주</button>
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
          <br>
          <div class="p-2 border rounded bg-light fw-bold text-dark">
            {{ currentItem?.itemKoName }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">상품 상세 코드 <span class="text-danger">*</span></label>
          <br>
          <div class="p-2 border rounded bg-light fw-bold text-dark">
            {{ currentItem?.itemDetailCode }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">수량 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" v-model.number="orderForm.quantity" min="1" :class="{ 'is-invalid': (!orderForm.quantity || orderForm.quantity <= 0) && formSubmitted }">
          <div class="invalid-feedback">수량은 1개 이상이어야 합니다.</div>
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