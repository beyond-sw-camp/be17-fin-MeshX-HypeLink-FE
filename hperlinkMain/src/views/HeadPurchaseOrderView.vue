<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';

import { useToastStore } from '@/stores/toast';

import purchaseOrderApi from '@/api/purchase-order'
import categoryApi from '@/api/item/category'

const toastStore = useToastStore();

const isLoading = ref(true);
const isOrderModalOpen = ref(false);
const formSubmitted = ref(false);
const orderDetails = ref([]);
const categories = ref([]);
const orderForm = reactive({
  itemDetailId: '',
  description: '',
  quantity: 1,
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('id');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const allProducts = ref([]);
const totalPages = ref(0);
const currentItem = ref(null);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  loadItems(1); // 초기 로드 시 서버에서 페이징 데이터 불러오기
  getOrderDetails();
  getCategories();
});

// === 페이지 초기화 ===
const loadItems = async (page = 1) => {
  try {
    isLoading.value = true;

    const response = await purchaseOrderApi.getHeadPurchaseOrder(page - 1, itemsPerPage.value,
        `${sortKey.value},${sortOrder.value}`, searchTerm.value, filterCategory.value);
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

const getCategories = async () => {
  let res = await categoryApi.getCategories();
  if(res.status !== 200) {
    toastStore.showToast("카테고리를 불러오지 못했습니다.", "danger")
  }
  categories.value = res.data.data.categories;
}

const getOrderDetails = async () => {
  let res = await purchaseOrderApi.getPurchaseOrderDetails();
  if(res.status !== 200) {
    toastStore.showToast(res.message, "danger")
  }
  orderDetails.value = res.data.data.purchaseDetailsStatusInfos;
}

const handleSubmitHeadOfficeOrder = async () => {
  formSubmitted.value = true;
  orderForm.itemDetailId = currentItem.value.id;
  if (!orderForm.itemDetailId) {
    toastStore.showToast('모든 발주 정보를 올바르게 입력해주세요.', 'danger');
    return;
  }
  await purchaseOrderApi.saveHeadPurchaseOrder(orderForm);

  alert('발주가 성공적으로 생성되었습니다.');

  isOrderModalOpen.value = false;
  Object.assign(orderForm, { itemDetailId: '', quantity: 1});
  await loadItems(1);
};

const onSearch = async () => {
  await loadItems(1);
}

const isLightColor = (hex) => {
  if (!hex) return false;

  let r, g, b;
  // HEX → RGB 변환
  if (hex.startsWith('#')) {
    const c = hex.substring(1);
    if (c.length === 3) {
      r = parseInt(c[0] + c[0], 16);
      g = parseInt(c[1] + c[1], 16);
      b = parseInt(c[2] + c[2], 16);
    } else if (c.length === 6) {
      r = parseInt(c.substring(0, 2), 16);
      g = parseInt(c.substring(2, 4), 16);
      b = parseInt(c.substring(4, 6), 16);
    }
  } else if (hex.startsWith('rgb')) {
    [r, g, b] = hex.match(/\d+/g).map(Number);
  } else {
    return false;
  }

  // 밝기 계산 (Luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180; // 밝으면 true
}

// --- 표시할 페이지 버튼 계산 (최대 5개) ---
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
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
                <option v-for="cat in categories" :key="cat.category" :value="cat.category">
                  {{ cat.category }}
                </option>
              </select>
            </div>
            <!-- 검색 버튼 -->
            <button class="btn btn-success btn-sm me-2" @click="onSearch">🔍 검색</button>
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
              <th>현재 재고</th>
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
                  :style="{
                    backgroundColor: item.colorCode,
                    color: isLightColor(item.colorCode) ? '#000' : '#fff'
                  }"
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
        <nav v-if="totalPages >= 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" v-if="visiblePages[0] > 1">
              <a class="page-link" href="#" @click.prevent="updatePage(1)">1</a>
            </li>
            <li class="page-item disabled" v-if="visiblePages[0] > 2">
              <span class="page-link">...</span>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < totalPages - 1">
              <span class="page-link">...</span>
            </li>
            <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < totalPages">
              <a class="page-link" href="#" @click.prevent="updatePage(totalPages)">{{ totalPages }}</a>
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
          <label class="form-label">발주 상세 내역</label>
          <select class="form-select" v-model="orderForm.description">
            <option disabled value="">카테고리를 선택하세요</option>
            <option v-for="cat in orderDetails" :key="cat.description" :value="cat.description">
              {{ cat.description }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">수량 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" v-model.number="orderForm.quantity" :class="{ 'is-invalid': !orderForm.quantity && formSubmitted }">
          <div class="invalid-feedback">수량을 입력해주세요.</div>
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