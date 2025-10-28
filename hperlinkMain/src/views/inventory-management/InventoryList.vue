<script setup>
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from "@/components/BaseModal.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {useToastStore} from "@/stores/toast.js";
import {useAuthStore} from "@/stores/auth.js";

import userApi from '@/api/users'
import storeItemApi from '@/api/item/store'
import purchaseOrderApi from "@/api/purchase-order/index.js";
import categoryApi from "@/api/item/category/index.js";

defineProps({ inventory: Array });
const emit = defineEmits(['send-shipment']);
const auth = useAuthStore();
const toastStore = useToastStore();

// 서버에서 받은 데이터 처리
const allStores = ref([]);
const selectStore = ref(0);
const currentStore = ref(0);
const categories = ref([]);
const allItems = ref([]);
const currentItem = ref(null);
const orderDetails = ref([]);
const loginStore = ref(0);

// paging 처리하는데 필요한 변수
const totalPages = ref(0);
const currentPage = ref(0);
const itemsPerPage = ref(5);
const sortKey = ref('id');
const sortOrder = ref('asc');
const isLoading = ref(null);

// 데이터 폼
const searchKeyword = ref('');
const filterCategory = ref('all');
const orderForm = reactive({
  itemDetailCode: '',
  description: '',
  supplierStoreId: 0,
  requestStoreId: 0,
  quantity: 1,
});

// 모달 창에 필요한 변수
const isOrderModalOpen = ref(false);
const formSubmitted = ref(false);

const getStores = async () => {
  let res =  await userApi.getStoresList();
  if(res.success) {
    allStores.value = res.data;
    const matchedStore = allStores.value.find(
        (one) => one.storeName === auth.user.name
    );

    // 일치하는 스토어가 있으면 loginStore에 id 저장
    if (matchedStore) {
      loginStore.value = matchedStore.storeId;
    }

    return;
  }
  toastStore.showToast('Store 정보를 못 받아왔습니다.', 'danger');
}

const loadItems = async (page = 1) => {
  try {
    const response = await getItems(page);
    if (response.status === 200 && response.data) {
      const pageData = response.data.data;
      allItems.value = pageData.content;
      totalPages.value = pageData.totalPages;
      currentPage.value = pageData.currentPage + 1; // Spring Pageable은 0-based
      currentStore.value = selectStore.value;
    } else {
      console.error('상품 목록 로딩 실패:', response);
    }
  } catch (e) {
    console.error('서버 통신 오류:', e);
  } finally {
    isLoading.value = false;
  }
};

const getItems = async (page = 1) => {
  if(selectStore.value === 0) {
    return await purchaseOrderApi.getHeadPurchaseOrder(page - 1, itemsPerPage.value,
        `${sortKey.value},${sortOrder.value}`, searchKeyword.value, filterCategory.value);
  }
  return await storeItemApi.getItems(page - 1, itemsPerPage.value, `${sortKey.value},${sortOrder.value}`,
      selectStore.value, searchKeyword.value, filterCategory.value);
}

const orderItem = (item = null) => {
  if(item === null) {
    return;
  }
  currentItem.value = item;
  isOrderModalOpen.value = true;
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
  orderForm.itemDetailCode = currentItem.value.itemDetailCode;
  orderForm.requestStoreId = currentStore.value;
  if (!orderForm.itemDetailCode) {
    toastStore.showToast('모든 발주 정보를 올바르게 입력해주세요.', 'danger');
    return;
  }
  let res = await purchaseOrderApi.savePurchaseOrder(orderForm);
  if(res.status !== 200) {
    toastStore.showToast(res.message, 'danger');
  } else {
    toastStore.showToast('발주가 성공적으로 생성되었습니다.', 'success');
  }

  isOrderModalOpen.value = false;
  Object.assign(orderForm, { itemDetailId: '', quantity: 1});
  await loadItems(1);
};

const getCategories = async () => {
  let res = await categoryApi.getCategories();
  if(res.status !== 200) {
    toastStore.showToast("카테고리를 불러오지 못했습니다.", "danger")
  }
  categories.value = res.data.data.categories;
}

const filteredStores = computed(() =>
    allStores.value.filter(cat => cat.storeId !== currentStore.value)
)

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

onMounted(() => {
  getStores();
  getOrderDetails();
  getCategories();
  loadItems(1);
})
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <!-- 왼쪽: 제목 -->
        <h5 class="mb-0">재고 현황</h5>

        <!-- 오른쪽: 검색창 + 드롭다운 + 버튼 -->
        <div class="d-flex align-items-center gap-2">
          <!-- 검색 입력창 -->
          <input
              type="text"
              class="form-control form-control-sm"
              v-model="searchKeyword"
              placeholder="상품명 또는 코드 검색"
              style="width: 180px;"
          />

          <!-- 매장 선택 드롭다운 -->
          <select
              class="form-select form-select-sm w-auto"
              v-model="selectStore"
              style="min-width: 120px;"
          >
            <option :value="0">본사 재고</option>
            <option
                v-for="cat in allStores"
                :key="cat.storeName"
                :value="cat.storeId"
            >
              {{ cat.storeName }}
            </option>
          </select>

          <div class="me-2">
            <select class="form-select form-select-sm" v-model="filterCategory">
              <option value="all">전체 카테고리</option>
              <option v-for="cat in categories" :key="cat.category" :value="cat.category">
                {{ cat.category }}
              </option>
            </select>
          </div>
          <div class="me-2">
          <!-- 검색 버튼 -->
            <button class="btn btn-primary btn-sm" @click="loadItems(1)">검색</button>
          </div>
        </div>
      </div>
    </template>
    <table class="table table-hover">
      <thead>
        <tr>
          <th>점포명</th>
          <th>상품 코드</th>
          <th>상품 상세 코드</th>
          <th>상품명(한글)</th>
          <th>상품명(영문)</th>
          <th>카테고리</th>
          <th>색상</th>
          <th>현재고</th>
          <th>발주 재고</th>
          <th v-if="(auth.user.role !== 'BRANCH_MANAGER' ||
          allStores[currentStore - 1]?.storeName === auth.user.name) && currentStore !== 0">발주</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in allItems" :key="item.id">
          <td>  {{ currentStore === 0 ? '본사 재고' : allStores.find(store => store.storeId === currentStore)?.storeName }}
          </td>
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
          <td>{{ item.stock }} 개</td>
          <td>{{ item.totalQuantity }} 개</td>
          <td v-if="(auth.user.role !== 'BRANCH_MANAGER' ||
          allStores[currentStore - 1]?.storeName === auth.user.name) && currentStore !== 0">
            <button class="btn btn-outline-primary btn-sm" @click="orderItem(item)">발주</button>
          </td>
        </tr>
      </tbody>
    </table>
  </BaseCard>

  <!-- 발주 모달 -->
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
        <label class="form-label">발주 요청 위치 <span class="text-danger">*</span></label>
        <select class="form-select" v-model="orderForm.supplierStoreId">
          <option :value="0">본사 재고</option>
          <option
              v-for="cat in filteredStores"
              :key="cat.storeName"
              :value="cat.storeId">
            {{ cat.storeName }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">발주 수령 위치<span class="text-danger">*</span></label>
        <br>
        <div class="p-2 border rounded bg-light fw-bold text-dark">
          {{ allStores[currentStore - 1]?.storeName }}
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">발주 상세 내역<span class="text-danger">*</span></label>
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
</template>