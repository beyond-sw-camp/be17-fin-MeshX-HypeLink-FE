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
import { useToastStore } from '@/stores/toast';
import { getPagedPromotions, createPromotion, updatePromotion, searchPromotions, getPromotionStatusList } from '@/api/promotion';
import { getAllCoupons } from '@/api/coupons';
import { uploadPromotionImage } from '@/api/image';

const toastStore = useToastStore();
const router = useRouter();

const promotionStatusList = ref([]);
const allPromotions = ref([]);
const isLoading = ref(true);
const couponList = ref([]);

const isModalOpen = ref(false);
const isEditing = ref(false);
const formSubmitted = ref(false);
const promoForm = reactive({
  id: null,
  title: '',
  period: '',
  couponType: 'PERCENTAGE',  // PERCENTAGE 또는 FIXED
  couponId: null,            // 선택된 쿠폰 ID
  status: 'UPCOMING',
  description: '',
  images: [],
});

// 이미지 관련 상태
const selectedFiles = ref([]);
const imagePreviewUrls = ref([]);
const isUploading = ref(false);

const getCouponTypeLabel = (type) => {
  switch (type) {
    case 'PERCENTAGE': return '퍼센트 할인';
    case 'FIXED': return '고정 할인';
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
const itemsPerPage = ref(10);
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
    promoForm.period = dateStr;
  },
});

// 쿠폰 타입 변경 시 선택된 쿠폰 초기화 (UX 개선)
watch(
  () => promoForm.couponType,
  (newType, oldType) => {
    if (newType !== oldType && oldType !== undefined) {
      promoForm.couponId = null; // 다른 타입의 쿠폰이므로 초기화
    }
  }
);

// 검색 실행 함수
const handleSearch = () => {
  currentPage.value = 1; // 검색 시 첫 페이지로 이동
  loadPromotions(1);
};


// 프로모션 상태 목록 로드
const loadPromotionStatusList = async () => {
  const res = await getPromotionStatusList();
  promotionStatusList.value = res.data.promotionStatusInfos;
};

// 데이터 로딩
onMounted(async () => {
  await loadPromotions(1);
  await loadCoupons();
  await loadPromotionStatusList();
});

// 쿠폰 목록 로드 (모든 페이지 순회)
const loadCoupons = async () => {
  try {
    console.log('🔍 쿠폰 로드 시작...');
    let allCouponsData = [];
    let currentPage = 0;
    let totalPages = 1;
    const pageSize = 10; // ✅ 한 번에 가져올 개수 (0이면 안됨!)

    // 모든 페이지를 순회하며 쿠폰 로드
    do {
      console.log(`📄 페이지 ${currentPage} 로드 중... (size: ${pageSize})`);
      const res = await getAllCoupons(currentPage, pageSize);
      console.log('📦 API 응답:', res);
      
      if (res.data && res.data.couponInfoResList) {
        console.log('✅ couponInfoResList 발견:', res.data.couponInfoResList.length, '개');
        const coupons = res.data.couponInfoResList.map(coupon => ({
          id: coupon.id,
          type: coupon.type?.toUpperCase(),
          name: coupon.name,
          value: coupon.value,
        }));
        allCouponsData = [...allCouponsData, ...coupons];
        
        // 페이지 정보 업데이트
        totalPages = res.data.totalPages || 1;
        console.log(`📊 현재: ${currentPage + 1}/${totalPages} 페이지, 누적: ${allCouponsData.length}개`);
        currentPage++;
      } else {
        console.error('❌ 응답 구조가 예상과 다름:', res);
        break; // 응답 구조가 다르면 중단
      }
    } while (currentPage < totalPages);

    couponList.value = allCouponsData;
    console.log('✨ 쿠폰 목록 로드 완료:', couponList.value.length, '개');
    console.log('📋 쿠폰 타입별:', 
      'PERCENTAGE:', couponList.value.filter(c => c.type === 'PERCENTAGE').length,
      'FIXED:', couponList.value.filter(c => c.type === 'FIXED').length
    );
  } catch (error) {
    console.error('💥 쿠폰 목록 로드 실패:', error);
    toastStore.showToast('쿠폰 목록을 불러오는데 실패했습니다.', 'danger');
  }
};

const loadPromotions = async (page = 1) => {
  try {
    isLoading.value = true;

    let res;
    // 검색어가 있으면 검색 API 호출, 없으면 일반 목록 조회
    if (searchTerm.value.trim()||filterStatus.value !== 'all') {
      res = await searchPromotions(
        searchTerm.value.trim(),
        filterStatus.value,
        page - 1,
        itemsPerPage.value,
        sortKey.value,
        sortOrder.value,
      );
    } else {
      res = await getPagedPromotions(
        page - 1,
        itemsPerPage.value,
        sortKey.value,
        sortOrder.value
      );
    }

    // 응답 구조 자동 감지
    let pageData = null;
    if (res.content && Array.isArray(res.content)) {
      pageData = res;
    } else if (res.data && Array.isArray(res.data.content)) {
      pageData = res.data;
    }

    if (pageData && Array.isArray(pageData.content)) {
      allPromotions.value = pageData.content.map(item => ({
        id: item.id,
        title: item.title,
        period: `${item.startDate} ~ ${item.endDate}`,
        couponType: item.couponType,
        couponId: item.couponId,
        status: item.status,
        description: item.contents,
        images: item.images || [],
      }));

      totalPages.value = pageData.totalPages;
      // 요청한 페이지 번호를 사용 (API 응답의 페이지 번호보다 더 정확함)
      currentPage.value = page;
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

// 이미지 파일 선택 핸들러
const handleImageSelect = (event) => {
  const files = Array.from(event.target.files);
  selectedFiles.value = files;

  // 미리보기 URL 생성
  imagePreviewUrls.value = files.map(file => URL.createObjectURL(file));
};

// 이미지 제거
const removeImage = (index) => {
  selectedFiles.value.splice(index, 1);
  URL.revokeObjectURL(imagePreviewUrls.value[index]);
  imagePreviewUrls.value.splice(index, 1);
};

const openPromotionModal = (promo = null) => {
  formSubmitted.value = false;
  selectedFiles.value = [];
  imagePreviewUrls.value = [];

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
      couponType: clonedPromo.couponType || 'PERCENTAGE',
      couponId: clonedPromo.couponId || null,
      status: clonedPromo.status,
      description: clonedPromo.description,
      images: clonedPromo.images || [],
    });

    // 기존 이미지가 있으면 미리보기에 표시
    if (clonedPromo.images && clonedPromo.images.length > 0) {
      imagePreviewUrls.value = clonedPromo.images.map(img => img.imageUrl);
    }
  } else {
    isEditing.value = false;
    Object.assign(promoForm, {
      id: null,
      title: '',
      period: '',
      couponType: 'PERCENTAGE',
      couponId: null,
      status: 'UPCOMING',
      description: '',
      images: [],
    });
  }
  isModalOpen.value = true;
};

const savePromotion = async () => {
  formSubmitted.value = true;

  // 기본 필수 항목 검사
  if (!promoForm.title || !promoForm.period) {
    toastStore.showToast('프로모션명과 기간은 필수입니다.', 'danger');
    return;
  }

  // 쿠폰 선택 필수 검사
  if (!promoForm.couponId) {
    toastStore.showToast('쿠폰을 선택해야 합니다.', 'danger');
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

  try {
    isUploading.value = true;

    // 이미지 업로드 처리
    let uploadedImages = [];
    if (selectedFiles.value.length > 0) {
      toastStore.showToast('이미지 업로드 중...', 'info');

      for (const file of selectedFiles.value) {
        try {
          const imageData = await uploadPromotionImage(file);
          uploadedImages.push(imageData);
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          toastStore.showToast(`이미지 업로드 실패: ${file.name}`, 'warning');
        }
      }
    }

    // 기존 이미지 유지 또는 변환
    let finalImages;
    if (isEditing.value) {
      if (selectedFiles.value.length > 0) {
        // 수정 모드에서 새 이미지를 선택한 경우
        finalImages = uploadedImages;
      } else {
        // 수정 모드에서 새 이미지를 선택하지 않은 경우, 기존 이미지 정보를 변환
        finalImages = promoForm.images.map(img => ({ id: img.id, originalName: img.originalName }));
      }
    } else {
      // 생성 모드
      finalImages = uploadedImages;
    }

    const [startDate, endDate] = promoForm.period.split(' ~ ');

    const payload = {
      title: promoForm.title,
      contents: promoForm.description,
      couponType: promoForm.couponType,
      couponId: promoForm.couponId,
      startDate,
      endDate,
      status: promoForm.status,
      images: finalImages
    };

    if (isEditing.value) {
      await updatePromotion(promoForm.id, payload);
      toastStore.showToast('프로모션이 수정되었습니다.', 'success');
    } else {
      await createPromotion(payload);
      toastStore.showToast('새 프로모션이 등록되었습니다.', 'success');
    }

    isModalOpen.value = false;
    await loadPromotions(currentPage.value); // ✅ 현재 페이지 유지하며 새로고침

    // ✅ 폼 리셋
    selectedFiles.value = [];
    imagePreviewUrls.value = [];
    Object.assign(promoForm, {
      id: null,
      title: '',
      period: '',
      couponType: 'PERCENTAGE',
      couponId: null,
      status: 'UPCOMING',
      description: '',
      images: [],
    });
  } catch (err) {
    console.error(err);
    toastStore.showToast('저장 중 오류가 발생했습니다.', 'danger');
  } finally {
    isUploading.value = false;
  }
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

// 쿠폰 타입별로 필터링된 쿠폰 목록
const filteredCoupons = computed(() => {
  return couponList.value.filter(coupon => coupon.type === promoForm.couponType);
});

// 검색어 초기화 및 전체 목록 다시 로드
const clearSearch = () => {
  searchTerm.value = '';
  handleSearch(); // 검색어 지우고 전체 목록 다시 로드
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
          <h5 class="mb-0">프로모션 목록</h5>
          <div class="d-flex">
            <div class="me-2 position-relative" style="width: 250px;">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="프로모션명 검색"
                v-model="searchTerm"
                @keyup.enter="handleSearch"
                style="padding-right: 30px;"
              />
              <button
                v-if="searchTerm"
                @click="clearSearch"
                class="btn btn-sm position-absolute"
                style="right: 2px; top: 50%; transform: translateY(-50%); border: none; background: transparent; padding: 0 8px; color: #6c757d;"
                title="검색어 지우기"
              >
                ✕
              </button>
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterStatus">
                <option value="all">전체 상태</option>
                <option v-for="cat in promotionStatusList" :key="cat.description" :value="cat.description">
                  {{ cat.description }}
                </option>
              </select>
            </div>
            <button class="btn btn-success btn-sm me-2" @click="handleSearch">
              🔍 검색
            </button>
            <button class="btn btn-primary btn-sm" @click="openPromotionModal()">
              + 새 프로모션 등록
            </button>
          </div>
        </div>
      </template>

      <table class="table table-hover" v-if="allPromotions.length > 0">
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
          <th @click="updateSort('couponType')" class="sortable">
            쿠폰 타입
            <SortIcon
              :sortKey="sortKey"
              :sortOrder="sortOrder"
              currentKey="couponType"
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
          <td>{{ getCouponTypeLabel(promo.couponType) }}</td>
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

      <BaseEmptyState v-else message="조회된 프로모션이 없습니다." />

      <!-- 페이지네이션 -->
      <nav v-if="totalPages >= 1">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="updatePage(currentPage - 1)"
            >이전</a
            >
          </li>
          <li class="page-item" v-if="visiblePages[0] > 1">
            <a class="page-link" href="#" @click.prevent="updatePage(1)">1</a>
          </li>
          <li class="page-item disabled" v-if="visiblePages[0] > 2">
            <span class="page-link">...</span>
          </li>
          <li
            class="page-item"
            :class="{ active: page === currentPage }"
            v-for="page in visiblePages"
            :key="page"
          >
            <a class="page-link" href="#" @click.prevent="updatePage(page)">{{
                page
              }}</a>
          </li>
          <li class="page-item disabled" v-if="visiblePages[visiblePages.length - 1] < totalPages - 1">
            <span class="page-link">...</span>
          </li>
          <li class="page-item" v-if="visiblePages[visiblePages.length - 1] < totalPages">
            <a class="page-link" href="#" @click.prevent="updatePage(totalPages)">{{ totalPages }}</a>
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
          <label class="form-label">쿠폰 타입 <span class="text-danger">*</span></label>
           <select class="form-select" v-model="promoForm.couponType">
            <option value="PERCENTAGE">퍼센트 할인</option>
            <option value="FIXED">고정 할인</option>
          </select>
        </div>

        <!-- ✅ 쿠폰 선택 -->
        <div class="mb-3">
          <label class="form-label fw-bold">
            쿠폰 선택 <span class="text-danger">*</span>
            <span class="badge bg-info ms-2">{{ filteredCoupons.length }}개</span>
          </label>
          <select 
            v-model="promoForm.couponId" 
            class="form-select"
            :class="{ 'is-invalid': formSubmitted && !promoForm.couponId }"
            size="6"
          >
            <option :value="null" disabled>쿠폰을 선택하세요</option>
            <option 
              v-for="coupon in filteredCoupons" 
              :key="coupon.id" 
              :value="coupon.id"
            >
              {{ coupon.name }} ({{ coupon.value }}{{ coupon.type === 'PERCENTAGE' ? '%' : '원' }})
            </option>
          </select>
          <div class="invalid-feedback">쿠폰을 선택해야 합니다.</div>
          <small class="text-muted d-block mt-1">
            {{ promoForm.couponType === 'PERCENTAGE' ? '퍼센트 할인' : '고정 할인' }} 타입의 쿠폰만 표시됩니다.
            <span v-if="filteredCoupons.length === 0" class="text-danger fw-bold">
              (해당 타입의 쿠폰이 없습니다)
            </span>
          </small>
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
        <div class="mb-3">
          <label class="form-label">이미지 첨부</label>
          <input
            type="file"
            class="form-control"
            accept="image/*"
            multiple
            @change="handleImageSelect"
          >
          <small class="text-muted">여러 이미지를 선택할 수 있습니다.</small>
        </div>
        <!-- 이미지 미리보기 -->
        <div v-if="imagePreviewUrls.length > 0" class="mb-3">
          <label class="form-label">미리보기</label>
          <div class="image-preview-container">
            <div
              v-for="(url, index) in imagePreviewUrls"
              :key="index"
              class="image-preview-item"
            >
              <img :src="url" alt="미리보기" class="preview-thumbnail">
              <button
                type="button"
                class="btn btn-sm btn-danger remove-btn"
                @click="removeImage(index)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="isModalOpen = false"
          :disabled="isUploading"
        >
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="savePromotion" :disabled="isUploading">
          <span v-if="isUploading" class="spinner-border spinner-border-sm me-1"></span>
          {{ isUploading ? '업로드 중...' : '저장' }}
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

/* 이미지 미리보기 컨테이너 */
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
}
</style>
