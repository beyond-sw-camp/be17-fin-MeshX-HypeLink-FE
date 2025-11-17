<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import { useCouponStore } from '@/stores/coupons';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useAuthStore } from '@/stores/auth';
import FlatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Korean } from 'flatpickr/dist/l10n/ko.js';

const couponStore = useCouponStore();
const toastStore = useToastStore();
const modalStore = useModalStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const isModalOpen = ref(false);
const formSubmitted = ref(false);
const isEditMode = ref(false);
const editingCouponId = ref(null);

// 페이징 상태
const currentPage = ref(1);
const itemsPerPage = ref(10);

const couponForm = reactive({
  name: '',
  type: 'Percentage',
  value: 0,
  period: '', // expiryDate 대신 period로 변경
});

// flatpickrConfig 정의 (매출 관리 코드와 유사, 범위 선택)
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
    couponForm.period = dateStr;
  },
});

// period 변화 감지 (디버�инг용)

// 데이터 로딩 함수
const loadCouponsData = async (page = 0) => {
  try {
    await couponStore.fetchAllCoupons(page, itemsPerPage.value);
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    toastStore.showToast('쿠폰 데이터 로딩에 실패했습니다.', 'error');
  }
};

onMounted(async () => {
  isLoading.value = true;
  await loadCouponsData(0);
  isLoading.value = false;
});

const openCouponModal = () => {
  formSubmitted.value = false;
  isEditMode.value = false;
  editingCouponId.value = null;
  Object.assign(couponForm, { name: '', type: 'Percentage', value: 0, period: '' });
  isModalOpen.value = true;
};

const openEditModal = (coupon) => {
  formSubmitted.value = false;
  isEditMode.value = true;
  editingCouponId.value = coupon.id;
  Object.assign(couponForm, {
    name: coupon.name,
    type: coupon.type,
    value: coupon.value,
    period: coupon.period
  });
  isModalOpen.value = true;
};

const saveCoupon = async () => {
  formSubmitted.value = true;
  if (!couponForm.name || !couponForm.value || !couponForm.period) {
    toastStore.showToast('모든 필드를 올바르게 입력해주세요.', 'danger');
    return;
  }

  // 기간 검증
  if (couponForm.period.includes(' ~ ')) {
    const [start, end] = couponForm.period.split(' ~ ');
    if (new Date(start) > new Date(end)) {
      toastStore.showToast('시작 날짜가 종료 날짜보다 늦을 수 없습니다.', 'danger');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (new Date(start) < new Date(today)) {
      toastStore.showToast('시작 날짜는 오늘 이후로 설정해야 합니다.', 'danger');
      return;
    }
  }

  let success;
  if (isEditMode.value) {
    success = await couponStore.updateCoupon(editingCouponId.value, couponForm, currentPage.value - 1);
    if (success) {
      toastStore.showToast('쿠폰이 수정되었습니다.', 'success');
      isModalOpen.value = false;
    } else {
      toastStore.showToast('쿠폰 수정에 실패했습니다.', 'danger');
    }
  } else {
    success = await couponStore.addCoupon(couponForm, currentPage.value - 1);
    if (success) {
      toastStore.showToast('새 쿠폰이 등록되었습니다.', 'success');
      isModalOpen.value = false;
    } else {
      toastStore.showToast('쿠폰 등록에 실패했습니다.', 'danger');
    }
  }
};


const formatValue = (type, value) => {
  const upperType = type?.toUpperCase();
  return upperType === 'PERCENTAGE' ? `${value}%` : `${value.toLocaleString()}원`;
};

// 쿠폰 상태 계산 함수
const getCouponStatus = (period) => {
  if (!period || !period.includes(' ~ ')) {
    return { text: '알 수 없음', class: 'text-secondary' };
  }

  const [start, end] = period.split(' ~ ');
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  if (today < startDate) {
    return { text: '예정', class: 'text-info' };
  } else if (today > endDate) {
    return { text: '기간 만료', class: 'text-danger' };
  } else {
    return { text: '사용가능', class: 'text-success' };
  }
};

// 서버에서 가져온 현재 페이지의 쿠폰 (서버 페이징)
const paginatedCoupons = computed(() => {
  return couponStore.allCoupons;
});

// 서버에서 가져온 전체 페이지 수
const totalPages = computed(() => couponStore.totalPages || 1);

// 페이지 변경 함수
const updatePage = async (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    await loadCouponsData(page - 1); // Convert to 0-based index for API
  }
};

// 표시할 페이지 버튼 계산 (최대 5개)
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
          <h5 class="mb-0">쿠폰 관리</h5>
          <div class="d-flex">
            <button
              v-if="authStore.isAdmin || authStore.isManager"
              class="btn btn-primary btn-sm"
              @click="openCouponModal"
            >
              + 새 쿠폰 생성
            </button>
          </div>
        </div>
      </template>

      <BaseSpinner v-if="isLoading" />

      <template v-else>
        <table class="table table-hover" v-if="couponStore.allCoupons.length > 0">
          <thead>
          <tr>
            <th>쿠폰명</th>
            <th>타입</th>
            <th>할인 값</th>
            <th>유효 기간</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="coupon in paginatedCoupons" :key="coupon.id">
            <td>{{ coupon.name }}</td>
            <td>{{ coupon.type }}</td>
            <td>{{ formatValue(coupon.type, coupon.value) }}</td>
            <td>{{ coupon.period }}</td>
            <td>
              <span :class="['badge', getCouponStatus(coupon.period).class]">
                {{ getCouponStatus(coupon.period).text }}
              </span>
            </td>
            <td>
              <button
                v-if="authStore.isAdmin || authStore.isManager"
                class="btn btn-sm btn-warning me-2"
                @click="openEditModal(coupon)"
              >
                수정
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <BaseEmptyState v-else message="생성된 쿠폰이 없습니다." />

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
      </template>
    </BaseCard>

    <!-- 쿠폰 생성/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditMode ? '쿠폰 수정' : '새 쿠폰 생성' }}</h5></template>
      <form @submit.prevent="saveCoupon">
        <div class="mb-3">
          <label class="form-label"
          >쿠폰명 <span class="text-danger">*</span></label
          >
          <input
            type="text"
            class="form-control"
            v-model="couponForm.name"
            :class="{ 'is-invalid': !couponForm.name && formSubmitted }"
          />
          <div class="invalid-feedback">쿠폰명은 필수입니다.</div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">할인 타입</label>
            <select class="form-select" v-model="couponForm.type">
              <option value="Percentage">퍼센트 (%)</option>
              <option value="Fixed">정액 (원)</option>
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label"
            >할인 값 <span class="text-danger">*</span></label
            >
            <input
              type="number"
              class="form-control"
              v-model.number="couponForm.value"
              :class="{ 'is-invalid': !couponForm.value && formSubmitted }"
            />
            <div class="invalid-feedback">할인 값은 필수입니다.</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label"
          >유효 기간 <span class="text-danger">*</span></label
          >
          <FlatPickr
            v-model="couponForm.period"
            :config="flatpickrConfig"
            class="form-control"
            placeholder="시작 날짜와 종료 날짜를 선택하세요"
            :class="{ 'is-invalid': !couponForm.period && formSubmitted }"
          />
          <div class="invalid-feedback">유효 기간은 필수입니다.</div>
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
        <button type="button" class="btn btn-primary" @click="saveCoupon">
          저장
        </button>
      </template>
    </BaseModal>
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

/* 쿠폰 테이블 컨테이너 - 최소 높이 설정 */
.coupon-table-container {
  display: flex;
  flex-direction: column;
  min-height: 600px; /* 최소 높이 설정 */
}

/* 테이블 래퍼 - 자동으로 남은 공간 차지 */
.table-wrapper {
  flex: 1;
  min-height: 500px; /* 테이블 최소 높이 */
}

/* 페이지네이션 래퍼 - 하단 고정 */
.pagination-wrapper {
  margin-top: auto; /* 자동으로 하단으로 밀기 */
  padding: 1rem 0;
  border-top: 1px solid #dee2e6;
}
</style>
