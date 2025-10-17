<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';

import itemApi from '@/api/item'

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

// 이미지 미리보기 저장
const imagePreviews = ref([]);

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterCategory = ref('all');
const sortKey = ref('id');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// 일괄 선택 관련 상태
const selectedProducts = ref(new Set());

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  loadItems(1); // ✅ 초기 로드 시 서버에서 페이징 데이터 불러오기
  // setTimeout(() => {
  //   // productStore에서 데이터를 가져오도록 수정
  //   allProducts.value = productStore.allProducts;
  //   isLoading.value = false;
  // }, 1000);
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
//
// --- 이벤트 핸들러 ---
// const updatePage = (page) => {
//   if (page > 0 && page <= totalPages.value) {
//     currentPage.value = page;
//   }
// };
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

    if (result.code === 200 || result.code === 201) {
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
};

const openProductModal = (product = null) => {
  formSubmitted.value = false;
  if (product) {
    isEditing.value = true;
    Object.assign(itemForm, product);
  } else {
    isEditing.value = false;
    Object.assign(itemForm, { id: null, code: '', name: '', category: '상의', price: 0 });
  }
  isModalOpen.value = true;
};

// === 페이지 초기화 ===
const loadItems = async (page = 1) => {
  try {
    isLoading.value = true;

    const response = await itemApi.getItems(page - 1, itemsPerPage.value, `${sortKey.value},${sortOrder.value}`);

    if (response.code === 200 && response.data) {
      const pageData = response.data;
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
const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    loadItems(page);
  }
};

const saveProduct = () => {
  formSubmitted.value = true;
  if (!itemForm.code || !itemForm.name || !itemForm.price || itemForm.price <= 0) {
    toastStore.showToast('상품 코드, 상품명, 가격은 필수이며, 가격은 0보다 커야 합니다.', 'danger');
    return;
  }
  if (isEditing.value) {
    productStore.updateProduct(itemForm);
  } else {
    productStore.addProduct(itemForm);
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
            <th style="width: 1%">
              <input class="form-check-input" type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
            </th>
            <th @click="updateSort('itemCode')" class="sortable">
              상품 코드
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="itemCode" />
            </th>
            <th @click="updateSort('koName')" class="sortable">
              상품명
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="koName" />
            </th>
            <th @click="updateSort('company')" class="sortable">
              회사
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="company" />
            </th>
            <th @click="updateSort('amount')" class="sortable">
              가격
              <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="amount" />
            </th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="product in allProducts"
              :key="product.id"
              :class="{ 'table-active': selectedProducts.has(product.id) }"
          >
            <td>
              <input
                  class="form-check-input"
                  type="checkbox"
                  :value="product.id"
                  :checked="selectedProducts.has(product.id)"
                  @change="selectedProducts.has(product.id) ? selectedProducts.delete(product.id) : selectedProducts.add(product.id)"
              />
            </td>
            <td>{{ product.itemCode }}</td>
            <td>{{ product.koName }}</td>
            <td>{{ product.company }}</td>
            <td>{{ product.amount.toLocaleString() }}원</td>
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
      <template #header>
        <h5>새 상품 등록</h5>
      </template>

      <form @submit.prevent="submitItem">
        <div class="mb-3">
          <label class="form-label">상품 코드 *</label>
          <input type="text" class="form-control" v-model="itemForm.itemCode" required />
        </div>

        <div class="mb-3">
          <label class="form-label">한글명 *</label>
          <input type="text" class="form-control" v-model="itemForm.koName" required />
        </div>

        <div class="mb-3">
          <label class="form-label">영문명</label>
          <input type="text" class="form-control" v-model="itemForm.enName" />
        </div>

        <div class="mb-3">
          <label class="form-label">가격 *</label>
          <input type="number" class="form-control" v-model.number="itemForm.amount" required />
        </div>

        <div class="mb-3">
          <label class="form-label">카테고리</label>
          <select class="form-select" v-model="itemForm.category">
            <option>상의</option>
            <option>하의</option>
            <option>아우터</option>
            <option>신발</option>
            <option>악세서리</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">회사명</label>
          <input type="text" class="form-control" v-model="itemForm.company" />
        </div>

        <div class="mb-3">
          <label class="form-label">상품 설명</label>
          <textarea class="form-control" rows="3" v-model="itemForm.content"></textarea>
        </div>

        <!-- 상품 상세(색상/사이즈/재고) 추가 -->
        <div class="mb-3">
          <label class="form-label">상품 상세 리스트</label>
          <div v-for="(detail, idx) in itemForm.itemDetailList" :key="idx" class="border p-2 mb-2 rounded">
            <div class="row">
              <div class="col">
                <input type="text" class="form-control" placeholder="사이즈" v-model="detail.size" />
              </div>
              <div class="col">
                <input type="text" class="form-control" placeholder="색상" v-model="detail.color" />
              </div>
              <div class="col">
                <input type="number" class="form-control" placeholder="재고" v-model.number="detail.stock" />
              </div>
              <div class="col">
                <input
                    type="text"
                    class="form-control"
                    placeholder="상세코드 (예: ITEM001-M-WH)"
                    v-model="detail.itemDetailCode"
                />
              </div>
              <div class="col-1 text-center">
                <button type="button" class="btn btn-outline-danger btn-sm" @click="itemForm.itemDetailList.splice(idx, 1)">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <button
              type="button"
              class="btn btn-sm btn-outline-primary mt-2"
              @click="itemForm.itemDetailList.push({ size: '', color: '', stock: 0, itemDetailCode: '' })"
          >
            + 상세 추가
          </button>
        </div>

        <!-- ✅ 이미지 업로드 -->
        <div class="mb-3">
          <label class="form-label">상품 이미지</label>
          <input type="file" class="form-control" accept="image/*" multiple @change="handleFileSelect" />
        </div>

        <!-- ✅ 이미지 미리보기 -->
        <div v-if="imagePreviews.length" class="d-flex flex-wrap gap-2 mb-3">
          <div v-for="img in imagePreviews" :key="img.name" class="border p-2 text-center" style="width: 100px;">
            <img :src="img.url" alt="preview" class="img-fluid rounded" />
            <small class="d-block mt-1 text-truncate">{{ img.name }}</small>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary" type="button" @click="isModalOpen = false" :disabled="isUploading">취소</button>
        <button class="btn btn-primary" type="submit" @click="submitItem" :disabled="isUploading">
          {{ isUploading ? '업로드 중...' : '등록' }}
        </button>
      </template>z
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
