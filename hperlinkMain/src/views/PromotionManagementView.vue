<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css'; // 매출 코드와 동일
import { Korean } from 'flatpickr/dist/l10n/ko.js';
import { usePromotionStore } from '@/stores/promotions';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { getPagedPromotions, createPromotion, updatePromotion } from '@/api/promotion';
import { getStoresList } from '@/api/users';
import { getItems } from '@/api/item';

const promotionStore = usePromotionStore();
const toastStore = useToastStore();
const modalStore = useModalStore();
const router = useRouter();

const allPromotions = ref([]);
const isLoading = ref(true);
const storeList = ref([]);
const productList = ref([]);

const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const promoForm = reactive({
  id: null,
  title: '',
  period: '',
  target: 'ALL',
  status: 'UPCOMING',
  description: '',
  storeIds: [],
  category: '',     // 카테고리용
  itemId: null,     // 상품용
  discountRate: null,
});

const getTargetLabel = (type) => {
  switch (type) {
    case 'ALL': return '전체 이벤트';
    case 'STORE': return '매장 이벤트';
    case 'CATEGORY': return '카테고리 이벤트';
    case 'PRODUCT': return '상품 이벤트';
    default: return type;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'ONGOING': return '진행중';
    case 'UPCOMING': return '예정';
    case 'ENDED': return '종료';
    default: return '알 수 없음';
  }
};

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('title');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalPages = ref(0);


// flatpickrConfig 정의 (매출 코드와 유사)
const flatpickrConfig = ref({
  mode: 'range', // 범위 선택
  dateFormat: 'Y-m-d', // 출력 형식: YYYY-MM-DD
  rangeSeparator: ' ~ ', // 구분자
  altInput: true, // 사용자 친화적 입력
  altFormat: 'Y년 m월 d일', // 표시 형식
  clickOpens: true, // 클릭 시 달력 열림
  inline: false, // 드롭다운 유지
  enableTime: false, // 시간 선택 비활성화
  locale: Korean, // 한국어 로케일
  minDate: 'today', // 오늘 이후
  maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1년 후
  onChange: (selectedDates, dateStr) => {
    console.log('Selected dates:', dateStr); // 디버깅
    promoForm.period = dateStr;
  },
  onReady: (selectedDates, dateStr, instance) => {
    console.log('Flatpickr initialized:', instance); // 초기화 확인
  },
});

// period 변화 감지 (디버깅용)
watch(
  () => promoForm.period,
  (newValue) => {
    console.log('promoForm.period updated:', newValue);
  }
);

// 데이터 로딩
onMounted(async () => {
  await loadPromotions(1);
  await loadStores();
  await loadProducts();
});

// 가맹점 목록 로드
const loadStores = async () => {
  try {
    const res = await getStoresList();
    console.log('[가맹점 목록 응답]', res);
    if (res.success && res.data) {
      storeList.value = res.data.map(store => ({
        id: store.storeId,
        title: store.storeName,
        address: store.storeAddress
      }));
      console.log('[가맹점 목록 매핑 후]', storeList.value);
    }
  } catch (error) {
    console.error('가맹점 목록 로드 실패:', error);
  }
};

// 상품 목록 로드
const loadProducts = async () => {
  try {
    const res = await getItems(0, 1000); // 최대 1000개 조회
    console.log('[상품 목록 응답]', res);
    if (res.status === 200 && res.data?.data?.content) {
      productList.value = res.data.data.content.map(item => ({
        id: item.id,
        title: item.title || item.name || item.koName || '상품명 없음',
        category: item.category || '카테고리 없음'
      }));
      console.log('[상품 목록 매핑 후]', productList.value);
    }
  } catch (error) {
    console.error('상품 목록 로드 실패:', error);
  }
};

const loadPromotions = async (page = 1) => {
  try {
    isLoading.value = true;

    // 0-based page index로 요청
    const res = await getPagedPromotions(
      page - 1,
      itemsPerPage.value,
      sortKey.value,
      sortOrder.value
    );
    console.log('[프로모션 응답]', res);

    if (res.status === 200 && res.data?.data) {
      const pageData = res.data.data;

      allPromotions.value = pageData.content.map((item) => ({
        id: item.id,
        title: item.title,
        period: `${item.startDate} ~ ${item.endDate}`,
        target: item.promotionType,
        status: item.status,
        description: item.contents,
        discountRate: item.discountRate,
        storeIds: item.storeIds || [],
        category: item.category || '',
        itemId: item.itemId || null
      }));

      // ✅ 페이지 정보 세팅
      totalPages.value = pageData.totalPages;
      currentPage.value = pageData.currentPage + 1; // 0-based → 1-based 보정
    }
  } catch (error) {
    console.error(error);
    toastStore.showToast('프로모션 목록을 불러오는 중 오류가 발생했습니다.', 'danger');
  } finally {
    isLoading.value = false;
  }
};


// 검색, 필터링, 정렬 로직- 백엔드 구현 예정
// const filteredAndSortedPromotions = computed(() => {
//   let promotions = [...allPromotions.value];

//   if (searchTerm.value) {
//     const term = searchTerm.value.toLowerCase();
//     promotions = promotions.filter(
//       (promo) =>
//         promo.title.toLowerCase().includes(term) ||
//         promo.description.toLowerCase().includes(term)
//     );
//   }

//   if (filterStatus.value !== 'all') {
//     promotions = promotions.filter((promo) => promo.status === filterStatus.value);
//   }

//   if (sortKey.value) {
//     promotions.sort((a, b) => {
//       const valA = a[sortKey.value];
//       const valB = b[sortKey.value];
//       if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
//       if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
//       return 0;
//     });
//   }

//   return promotions;
// });


// 이벤트 핸들러
const updatePage = async (page) => {
  if (page < 1 || page > totalPages.value) return;
  await loadPromotions(page);
};

const openPromotionModal = (promo = null) => {
  formSubmitted.value = false;
  if (promo) {
    isEditing.value = true;
    const clonedPromo = { ...promo };
    if (clonedPromo.period) {
      clonedPromo.period = clonedPromo.period.replace(' to ', ' ~ '); // 형식 호환
    }
    // ✅ 모든 필드를 명시적으로 설정
    Object.assign(promoForm, {
      id: clonedPromo.id,
      title: clonedPromo.title,
      period: clonedPromo.period,
      target: clonedPromo.target,
      status: clonedPromo.status,
      description: clonedPromo.description,
      storeIds: clonedPromo.storeIds || [],
      category: clonedPromo.category || '',
      itemId: clonedPromo.itemId || null,
      discountRate: clonedPromo.discountRate
    });
  } else {
    isEditing.value = false;
    Object.assign(promoForm, {
      id: null,
      title: '',
      period: '',
      target: 'ALL',
      status: 'UPCOMING',
      description: '',
      storeIds: [],
      category: '',
      itemId: null,
      discountRate: null
    });
  }
  isModalOpen.value = true;
};

const savePromotion = async () => {
  formSubmitted.value = true;
  
  // 기본 필수 항목 검사
  if (
    !promoForm.title ||
    !promoForm.period ||
    promoForm.discountRate === null ||
    promoForm.discountRate === undefined ||
    promoForm.discountRate <= 0 ||
    promoForm.discountRate > 100
  ) {
    toastStore.showToast('프로모션명, 기간, 할인율(1~100)은 필수입니다.', 'danger');
    return;
  }

  // 대상별 필수 항목 검사
  if (promoForm.target === 'STORE' && promoForm.storeIds.length === 0) {
    toastStore.showToast('최소 1개 이상의 매장을 선택해야 합니다.', 'danger');
    return;
  }
  
  if (promoForm.target === 'CATEGORY' && !promoForm.category) {
    toastStore.showToast('카테고리를 선택해야 합니다.', 'danger');
    return;
  }
  
  if (promoForm.target === 'PRODUCT' && !promoForm.itemId) {
    toastStore.showToast('상품을 선택해야 합니다.', 'danger');
    return;
  }

  // ✅ 날짜 유효성 검사
  if (promoForm.period.includes(' ~ ')) {
    const [start, end] = promoForm.period.split(' ~ ');
    if (new Date(start) > new Date(end)) {
      toastStore.showToast('시작 날짜가 종료 날짜보다 늦을 수 없습니다.', 'danger');
      return;
    }
  }

  // ✅ 한 번만 선언 (중복 X)
const [startDate, endDate] = promoForm.period.split(' ~ ');

const payload = {
  promotionType: promoForm.target,
  title: promoForm.title,
  contents: promoForm.description,
  discountRate: promoForm.discountRate, 
  startDate,
  endDate,
  storeIds: promoForm.target === 'STORE' ? promoForm.storeIds : [],
  category: promoForm.target === 'CATEGORY' ? promoForm.category : null,
  itemId: promoForm.target === 'PRODUCT' ? promoForm.itemId : null,
  status: promoForm.status
};
console.log('[create payload]', payload);

  try {
    if (isEditing.value) {
      await updatePromotion(promoForm.id, payload);
      toastStore.showToast('프로모션이 수정되었습니다.', 'success');
    } else {
      await createPromotion(payload);
      toastStore.showToast('새 프로모션이 등록되었습니다.', 'success');
    }

    isModalOpen.value = false;
    await loadPromotions(); // ✅ 목록 새로고침
  } catch (err) {
    console.error(err);
    toastStore.showToast('저장 중 오류가 발생했습니다.', 'danger');
  }

  // ✅ 폼 리셋
  Object.assign(promoForm, {
    id: null,
    title: '',
    period: '',
    target: 'ALL',
    status: 'UPCOMING',
    description: '',
    storeIds: [],
    category: '',
    itemId: null,
    discountRate: null
  });
};



const statusClass = (status) => {
  switch (status) {
    case 'ONGOING': return 'bg-primary';
    case 'UPCOMING': return 'bg-info';
    case 'ENDED': return 'bg-secondary';
    default: return 'bg-light';
  }
};

const goToDetail = (id) => {
  router.push(`/promotions/${id}`);
};

const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};
</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">프로모션 목록</h5>
          <div class="d-flex">
            <div class="me-2">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="프로모션명 검색"
                v-model="searchTerm"
              />
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterStatus">
                <option value="all">전체 상태</option>
                <option value="진행중">진행중</option>
                <option value="예정">예정</option>
                <option value="종료">종료</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" @click="openPromotionModal()">
              + 새 프로모션 등록
            </button>
          </div>
        </div>
      </template>

      <div v-if="allPromotions.length > 0">
        <table class="table table-hover">
          <thead>
          <tr>
            <th @click="updateSort('title')" class="sortable">
              프로모션명
              <SortIcon
                :sortKey="sortKey"
                :sortOrder="sortOrder"
                currentKey="title"
              />
            </th>
            <th @click="updateSort('period')" class="sortable">
              기간
              <SortIcon
                :sortKey="sortKey"
                :sortOrder="sortOrder"
                currentKey="period"
              />
            </th>
            <th @click="updateSort('target')" class="sortable">
              대상
              <SortIcon
                :sortKey="sortKey"
                :sortOrder="sortOrder"
                currentKey="target"
              />
            </th>
            <th @click="updateSort('status')" class="sortable">
              상태
              <SortIcon
                :sortKey="sortKey"
                :sortOrder="sortOrder"
                currentKey="status"
              />
            </th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="promo in allPromotions" :key="promo.id">
            <td>
              <router-link :to="`/promotions/${promo.id}`">{{
                  promo.title
                }}</router-link>
            </td>
            <td>{{ promo.period }}</td>
            <td>{{ getTargetLabel(promo.target) }}</td>
            <td>
                <span class="badge" :class="statusClass(promo.status)">{{getStatusLabel(promo.status)}}</span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="openPromotionModal(promo)"
              >
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
              <a
                class="page-link"
                href="#"
                @click.prevent="updatePage(currentPage - 1)"
              >이전</a
              >
            </li>
            <li
              class="page-item"
              :class="{ active: page === currentPage }"
              v-for="page in totalPages"
              :key="page"
            >
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{
                  page
                }}</a>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="updatePage(currentPage + 1)"
              >다음</a
              >
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 프로모션이 없습니다." />
    </BaseCard>

    <!-- 프로모션 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header
      ><h5>{{ isEditing ? '프로모션 수정' : '새 프로모션 등록' }}</h5></template
      >
      <form @submit.prevent="savePromotion">
        <div class="mb-3">
          <label class="form-label"
          >프로모션명 <span class="text-danger">*</span></label
          >
          <input
            type="text"
            class="form-control"
            v-model="promoForm.title"
            :class="{ 'is-invalid': !promoForm.title && formSubmitted }"
          />
          <div class="invalid-feedback">프로모션명은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label"
          >기간 <span class="text-danger">*</span></label
          >
          <FlatPickr
            v-model="promoForm.period"
            :config="flatpickrConfig"
            class="form-control"
            placeholder="시작 날짜와 종료 날짜를 선택하세요"
            :class="{ 'is-invalid': !promoForm.period && formSubmitted }"
          />
          <div class="invalid-feedback">기간은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">대상</label>
           <select class="form-select" v-model="promoForm.target">
            <option value="ALL">전체 이벤트</option>
            <option value="STORE">매장 이벤트</option>
            <option value="CATEGORY">카테고리 이벤트</option>
            <option value="PRODUCT">상품 이벤트</option>
          </select>
        </div>
                <!-- ✅ 매장 이벤트 선택 시 -->
        <div v-if="promoForm.target === 'STORE'" class="mb-3">
          <label class="form-label fw-bold">가맹점 선택</label>
          <div class="border rounded p-2" style="max-height: 300px; overflow-y: auto;">
            <select
              v-model="promoForm.storeIds"
              class="form-select"
              multiple
              style="min-height: 150px; width: 100%;"
            >
              <option
                v-for="store in storeList"
                :key="store.id"
                :value="store.id"
              >
                {{ store.title }} ({{ store.address }})
              </option>
            </select>
          </div>
          <div v-if="formSubmitted && promoForm.storeIds.length === 0" class="text-danger mt-1">
            최소 1개 이상의 매장을 선택해야 합니다.
          </div>
        </div>

        <!-- ✅ 카테고리 이벤트 선택 시 -->
        <div v-if="promoForm.target === 'CATEGORY'" class="mb-3">
          <label class="form-label fw-bold">카테고리 선택</label>
          <select v-model="promoForm.category" class="form-select">
            <option disabled value="">카테고리를 선택하세요</option>
            <option value="BACKPACK">백팩</option>
            <option value="TOP_CLOTHES">상의</option>
            <option value="BOTTOM_CLOTHES">하의</option>
            <option value="OUTER_CLOTHES">아우터</option>
            <option value="SHOES">신발</option>
          </select>
          <div v-if="formSubmitted && !promoForm.category" class="text-danger mt-1">
            카테고리를 선택해야 합니다.
          </div>
        </div>

       <!-- ✅ 상품 이벤트 선택 시 -->
      <div v-if="promoForm.target === 'PRODUCT'" class="mb-3">
        <label class="form-label fw-bold">상품 선택</label>
        <select v-model="promoForm.itemId" class="form-select">
          <option disabled value="">상품을 선택하세요</option>
          <option v-for="item in productList" :key="item.id" :value="item.id">
            {{ item.title }} ({{ item.category }})
          </option>
        </select>
        <div v-if="formSubmitted && !promoForm.itemId" class="text-danger mt-1">
          상품을 선택해야 합니다.
        </div>
      </div> <!-- ✅ 이 닫는 태그 위치 중요! -->

<!-- ✅ 할인율 입력 (1~100 사이만 허용) -->
<div class="mb-3">
  <label class="form-label">할인율 (%)</label>
  <input
    type="number"
    class="form-control"
    v-model.number="promoForm.discountRate"
    min="1"
    max="100"
    step="0.1"
    placeholder="1~100"
    :class="{ 'is-invalid': formSubmitted && (promoForm.discountRate === null || promoForm.discountRate <= 0 || promoForm.discountRate > 100) }"
  />
  <div class="invalid-feedback">유효한 할인율을 입력하세요 (1~100 사이).</div>

      </div>
        <div class="mb-3">
          <label class="form-label">상태</label>
          <select class="form-select" v-model="promoForm.status">
            <option value="ONGOING">진행중</option>
            <option value="UPCOMING">예정</option>
            <option value="ENDED">종료</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">설명</label>
          <textarea
            class="form-control"
            rows="3"
            v-model="promoForm.description"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="isModalOpen = false"
        >
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="savePromotion">
          저장
        </button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>

<style scoped>
/* flatpickr 달력 z-index 및 스타일 충돌 방지 */
.flatpickr-calendar {
  z-index: 9999 !important;
}
.flatpickr-input {
  width: 100%;
}
.flatpickr-input.active {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}
</style>
