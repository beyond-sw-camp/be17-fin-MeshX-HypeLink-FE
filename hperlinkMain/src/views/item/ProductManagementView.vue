<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import CreateItemView from "@/views/item/CreateItemView.vue";
import UpdateItemView from "@/views/item/UpdateItemView.vue";

import itemApi from '@/api/item/index.js'

const allProducts = ref([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const isUploading = ref(false);

const itemForm = reactive({
  enName: '',
  koName: '',
  amount: 0,
  category: '상의',
  itemCode: '',
  content: '',
  company: '',
  itemDetailList: [],
  images: [] // 실제 파일 객체들
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalPages = ref(0);

let originalItem = null; // 수정 전 데이터 백업용

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  loadItems(1); // ✅ 초기 로드 시 서버에서 페이징 데이터 불러오기
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedProducts = computed(() => {
  let products = [...allProducts.value];

  // 검색 (koName / enName / itemCode / itemDetailCode)
  const term = (searchTerm.value || '').trim().toLowerCase();
  if (term) {
    products = products.filter(p =>
        p.koName?.toLowerCase().includes(term) ||
        p.enName?.toLowerCase().includes(term) ||
        p.itemCode?.toLowerCase().includes(term) ||
        p.itemDetailCode?.toLowerCase().includes(term)
    );
  }

  // 카테고리 필터
  if (filterCategory.value !== 'all') {
    products = products.filter(p => p.category === filterCategory.value);
  }

  // 정렬 (안전 비교)
  if (sortKey.value) {
    const dir = sortOrder.value === 'asc' ? 1 : -1;
    products.sort((a, b) => {
      const A = a?.[sortKey.value];
      const B = b?.[sortKey.value];

      // 숫자/문자 혼용 대비
      if (A == null && B == null) return 0;
      if (A == null) return -1 * dir;
      if (B == null) return  1 * dir;

      if (typeof A === 'number' && typeof B === 'number') {
        return (A - B) * dir;
      }
      return String(A).localeCompare(String(B)) * dir;
    });
  }

  return products;
});

const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};

const submitItem = async () => {
  if(isEditing.value) {
    return await updateItem();
  }
  return await saveItem();
};

const updateItem = async () => {
  try {
    if (!originalItem.itemCode) {
      alert('상품 상세 코드(itemDetailCode)가 없습니다.');
      return;
    }

    // 변경된 필드만 감지
    const changedFields = [];
    if (itemForm.koName !== originalItem.koName)
      changedFields.push({ key: 'koName', api: itemApi.updateKoName });
    if (itemForm.enName !== originalItem.enName)
      changedFields.push({ key: 'enName', api: itemApi.updateEnName });
    if (itemForm.amount !== originalItem.amount)
      changedFields.push({ key: 'amount', api: itemApi.updateAmount });
    if (itemForm.company !== originalItem.company)
      changedFields.push({ key: 'company', api: itemApi.updateCompany });
    if (itemForm.category !== originalItem.category)
      changedFields.push({ key: 'category', api: itemApi.updateCategory });
    if (itemForm.content !== originalItem.content)
      changedFields.push({ key: 'content', api: itemApi.updateContent });

    if (changedFields.length === 0) {
      alert('변경된 항목이 없습니다.');
      return;
    }

    // 각 필드별 PATCH 요청 순차 실행
    for (const field of changedFields) {
      const payload = {
        itemCode: originalItem.itemCode,
        [field.key]: itemForm[field.key],
      };
      const result = await field.api(payload);

      if (!(result.status === 200 || result.status === 201)) {
        console.error(`${field.key} 업데이트 실패`, result);
      }
    }

    alert('상품 정보가 성공적으로 수정되었습니다.');
    isModalOpen.value = false;
    await loadItems(currentPage.value);
    originalItem = null;
  } catch (error) {
    console.error('상품 수정 중 오류:', error);
    alert('상품 수정 중 오류가 발생했습니다.');
    originalItem = null;
  }
}

const saveItem = async () => {
  try {
    // ✅ 유효성 검사
    if (!itemForm.itemCode || !itemForm.koName || !itemForm.amount) {
      alert('상품 코드, 한글명, 가격은 필수입니다.');
      return;
    }

    // ✅ itemDetailList가 없으면 기본값 추가
    if (!itemForm.itemDetailList || itemForm.itemDetailList.length === 0) {
      itemForm.itemDetailList = [
        {
          size: 'Free',
          color: 'Default',
          stock: 0,
          itemDetailCode: `${itemForm.itemCode}-DF`
        }
      ];
    }

    // ✅ 요청 데이터 구성 (서버 DTO 구조와 동일)
    const requestData = {
      enName: itemForm.enName,
      koName: itemForm.koName,
      amount: itemForm.amount,
      category: itemForm.category,
      itemCode: itemForm.itemCode,
      content: itemForm.content,
      company: itemForm.company,
      itemDetailList: itemForm.itemDetailList
    };

    const result = await itemApi.saveNewItem(requestData);

    if (result.status === 200 || result.status === 201) {
      alert('상품이 성공적으로 등록되었습니다.');
      isModalOpen.value = false;
      // 등록 후 다시 목록 갱신
      await loadItems(1);
    } else {
      alert(result.message || '등록 실패');
    }
  } catch (error) {
    console.error('상품 등록 중 오류:', error);
    alert('상품 등록 중 오류가 발생했습니다.');
  }
}

const openProductModal = (product = null) => {
  formSubmitted.value = false;
  if (product) {
    isEditing.value = true;
    Object.assign(itemForm, product);
    originalItem = { ...product };
  } else {
    isEditing.value = false;
    Object.assign(itemForm, { id: null, code: '', name: '', category: '상의', price: 0 });
  }
  isModalOpen.value = true;
};

const closeProductModal = async () => {
  isModalOpen.value = false;
  await loadItems();
}

// === 페이지 초기화 ===
const loadItems = async (page = 1) => {
  try {
    isLoading.value = true;

    const response = await itemApi.getItems(page - 1, itemsPerPage.value, `${sortKey.value},${sortOrder.value}`);
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

</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">상품 목록</h5>
          <div class="d-flex align-items-center">
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
      
      <div v-if="allProducts.length > 0">
        <table class="table table-hover text-center align-middle">
          <thead class="table-light">
          <tr>
            <th @click="updateSort('id')" class="sortable">
              ID
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="id" />
            </th>
            <th @click="updateSort('itemCode')" class="sortable">
              상품 코드
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemCode" />
            </th>
            <th @click="updateSort('itemCode')" class="sortable">
              상품 Detail 코드
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemCode" />
            </th>
            <th @click="updateSort('koName')" class="sortable">
              한글명
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemDetailCode" />
            </th>
            <th @click="updateSort('enName')" class="sortable">
              영문명
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="enName" />
            </th>
            <th @click="updateSort('company')" class="sortable">
              회사
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="company" />
            </th>
            <th @click="updateSort('category')" class="sortable">
              카테고리
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="category" />
            </th>
            <th>색상</th>
            <th>사이즈</th>
            <th @click="updateSort('amount')" class="sortable">
              가격
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="amount" />
            </th>
            <th> 재고 </th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="product in allProducts" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.itemCode }}</td>
            <td>{{ product.itemDetailCode }}</td>
            <td>{{ product.koName }}</td>
            <td>{{ product.enName }}</td>
            <td>{{ product.company }}</td>
            <td>{{ product.category }}</td>
            <td>
          <span
              class="badge border"
              :style="{ backgroundColor: product.colorCode, color: '#fff' }"
          >
            {{ product.colorName }}
          </span>
            </td>
            <td>{{ product.size }}</td>
            <td>{{ product.amount }}원</td>
            <td>{{ product.stock }}개</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary" @click="openProductModal(product)">
                수정
              </button>
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
    <BaseModal v-model="isModalOpen" size="xl">
      <template #header>
        <h5>{{ isEditing ? '상품 수정' : '새 상품 등록' }}</h5>
      </template>
      <CreateItemView v-if="!isEditing" :itemForm="itemForm" :isModalOpen="isModalOpen" @submit="submitItem" />
      <UpdateItemView v-else :itemForm="itemForm" :isModalOpen="isModalOpen" @submit="submitItem" />
      <template #footer>
        <button class="btn btn-secondary" @click="closeProductModal" :disabled="isUploading">취소</button>
        <button class="btn btn-primary" @click="submitItem" :disabled="isUploading">
          {{ isUploading ? '업로드 중...' : (isEditing ? '수정' : '등록') }}
        </button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
