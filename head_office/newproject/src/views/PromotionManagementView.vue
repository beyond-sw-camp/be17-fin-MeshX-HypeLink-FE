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

const promotionStore = usePromotionStore();
const toastStore = useToastStore();
const modalStore = useModalStore();
const router = useRouter();

const allPromotions = ref([]);
const isLoading = ref(true);

const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const promoForm = reactive({
  id: null,
  name: '',
  period: '',
  target: '',
  status: '예정',
  description: '',
});

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterStatus = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

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

// 데이터 로딩 시뮬레이션
onMounted(() => {
  setTimeout(() => {
    allPromotions.value = [
      {
        id: 1,
        name: '신학기 맞이 10% 할인',
        period: '2025-03-01 ~ 2025-03-31',
        target: '전체 고객',
        status: '진행중',
        description: '새 학기를 맞아 모든 상품 10% 할인 프로모션 진행',
        salesImpact: {
          labels: ['2월', '3월', '4월'],
          before: [100, 110, 105],
          during: [120, 150, 140],
          after: [115, 125, 120],
        },
      },
      {
        id: 2,
        name: '여름맞이 특별 세일',
        period: '2024-07-01 ~ 2024-07-31',
        target: '온라인 구매 고객',
        status: '종료',
        description: '여름 시즌 상품 최대 30% 할인 프로모션',
        salesImpact: {
          labels: ['6월', '7월', '8월'],
          before: [90, 95, 88],
          during: [130, 160, 150],
          after: [100, 105, 98],
        },
      },
    ];
    isLoading.value = false;
  }, 1000);
});

// 검색, 필터링, 정렬 로직
const filteredAndSortedPromotions = computed(() => {
  let promotions = [...allPromotions.value];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    promotions = promotions.filter(
      (promo) =>
        promo.name.toLowerCase().includes(term) ||
        promo.description.toLowerCase().includes(term)
    );
  }

  if (filterStatus.value !== 'all') {
    promotions = promotions.filter((promo) => promo.status === filterStatus.value);
  }

  if (sortKey.value) {
    promotions.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return promotions;
});

// 페이지네이션 로직
const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedPromotions.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredAndSortedPromotions.value.length / itemsPerPage.value)
);

// 이벤트 핸들러
const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const openPromotionModal = (promo = null) => {
  formSubmitted.value = false;
  if (promo) {
    isEditing.value = true;
    const clonedPromo = { ...promo };
    if (clonedPromo.period) {
      clonedPromo.period = clonedPromo.period.replace(' to ', ' ~ '); // 형식 호환
    }
    Object.assign(promoForm, clonedPromo);
  } else {
    isEditing.value = false;
    Object.assign(promoForm, {
      id: null,
      name: '',
      period: '',
      target: '',
      status: '예정',
      description: '',
    });
  }
  isModalOpen.value = true;
};

const savePromotion = () => {
  formSubmitted.value = true;
  if (!promoForm.name || !promoForm.period) {
    toastStore.showToast('프로모션명과 기간은 필수입니다.', 'danger');
    return;
  }

  if (promoForm.period.includes(' ~ ')) {
    const [start, end] = promoForm.period.split(' ~ ');
    if (new Date(start) > new Date(end)) {
      toastStore.showToast('시작 날짜가 종료 날짜보다 늦을 수 없습니다.', 'danger');
      return;
    }
  }

  if (isEditing.value) {
    const index = allPromotions.value.findIndex((s) => s.id === promoForm.id);
    if (index !== -1) {
      Object.assign(allPromotions.value[index], promoForm);
      toastStore.showToast('프로모션 정보가 수정되었습니다.', 'success');
    }
  } else {
    promotionStore.addPromotion(promoForm);
    toastStore.showToast('새 프로모션이 등록되었습니다.', 'success');
  }
  isModalOpen.value = false;
  Object.assign(promoForm, {
    id: null,
    name: '',
    period: '',
    target: '',
    status: '예정',
    description: '',
  });
};

const deletePromotion = async (id) => {
  const confirmed = await modalStore.show({
    title: '삭제 확인',
    message: '정말 이 프로모션을 삭제하시겠습니까?',
    isConfirmation: true,
  });
  if (confirmed) {
    promotionStore.deletePromotion(id);
    toastStore.showToast('프로모션이 삭제되었습니다.', 'success');
  }
};

const statusClass = (status) => {
  if (status === '진행중') return 'bg-primary';
  if (status === '예정') return 'bg-info';
  if (status === '종료') return 'bg-secondary';
  return 'bg-light';
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

      <div v-if="paginatedPromotions.length > 0">
        <table class="table table-hover">
          <thead>
          <tr>
            <th @click="updateSort('name')" class="sortable">
              프로모션명
              <SortIcon
                :sortKey="sortKey"
                :sortOrder="sortOrder"
                currentKey="name"
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
          <tr v-for="promo in paginatedPromotions" :key="promo.id">
            <td>
              <router-link :to="`/promotions/${promo.id}`">{{
                  promo.name
                }}</router-link>
            </td>
            <td>{{ promo.period }}</td>
            <td>{{ promo.target }}</td>
            <td>
                <span class="badge" :class="statusClass(promo.status)">{{
                    promo.status
                  }}</span>
            </td>
            <td>
              <button
                class="btn btn-sm btn-outline-secondary me-2"
                @click="openPromotionModal(promo)"
              >
                수정
              </button>
              <button
                class="btn btn-sm btn-danger"
                @click="deletePromotion(promo.id)"
              >
                삭제
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
            v-model="promoForm.name"
            :class="{ 'is-invalid': !promoForm.name && formSubmitted }"
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
          <input type="text" class="form-control" v-model="promoForm.target" />
        </div>
        <div class="mb-3">
          <label class="form-label">상태</label>
          <select class="form-select" v-model="promoForm.status">
            <option>진행중</option>
            <option>예정</option>
            <option>종료</option>
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
