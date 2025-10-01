<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '@/components/BaseCard.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
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

// --- 데이터 로딩 시뮬레이션 ---
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
          after: [115, 125, 120] 
        }
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
          after: [100, 105, 98] 
        }
      },
    ];
    isLoading.value = false;
  }, 1000);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedPromotions = computed(() => {
  let promotions = [...allPromotions.value];

  // 검색
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    promotions = promotions.filter(promo => 
      promo.name.toLowerCase().includes(term) || 
      promo.description.toLowerCase().includes(term)
    );
  }

  // 필터링
  if (filterStatus.value !== 'all') {
    promotions = promotions.filter(promo => promo.status === filterStatus.value);
  }

  // 정렬
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

// --- 페이지네이션 로직 ---
const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedPromotions.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedPromotions.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const openPromotionModal = (promo = null) => {
  formSubmitted.value = false;
  if (promo) {
    isEditing.value = true;
    Object.assign(promoForm, promo);
  } else {
    isEditing.value = false;
    Object.assign(promoForm, { id: null, name: '', period: '', target: '', status: '예정', description: '' });
  }
  isModalOpen.value = true;
};

const savePromotion = () => {
  formSubmitted.value = true;
  if (!promoForm.name || !promoForm.period) {
    toastStore.showToast('프로모션명과 기간은 필수입니다.', 'danger');
    return;
  }

  if (isEditing.value) {
    const index = allPromotions.value.findIndex(s => s.id === promoForm.id);
    if (index !== -1) {
      Object.assign(allPromotions.value[index], promoForm);
      toastStore.showToast('프로모션 정보가 수정되었습니다.', 'success');
    }
  } else {
    promotionStore.addPromotion(promoForm);
    toastStore.showToast('새 프로모션이 등록되었습니다.', 'success');
  }
  isModalOpen.value = false;
  // 폼 초기화
  Object.assign(promoForm, { id: null, name: '', period: '', target: '', status: '예정', description: '' });
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

// 상세 페이지로 이동
const goToDetail = (id) => {
  router.push(`/promotions/${id}`);
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
              <input type="text" class="form-control form-control-sm" placeholder="프로모션명 검색" v-model="searchTerm">
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterStatus">
                <option value="all">전체 상태</option>
                <option value="진행중">진행중</option>
                <option value="예정">예정</option>
                <option value="종료">종료</option>
              </select>
            </div>
            <button class="btn btn-primary btn-sm" @click="openPromotionModal()">+ 새 프로모션 등록</button>
          </div>
        </div>
      </template>
      
      <div v-if="paginatedPromotions.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="updateSort('name')" class="sortable">프로모션명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="updateSort('period')" class="sortable">기간 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="period" /></th>
              <th @click="updateSort('target')" class="sortable">대상 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="target" /></th>
              <th @click="updateSort('status')" class="sortable">상태 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status" /></th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in paginatedPromotions" :key="promo.id">
              <td><router-link :to="`/promotions/${promo.id}`">{{ promo.name }}</router-link></td>
              <td>{{ promo.period }}</td>
              <td>{{ promo.target }}</td>
              <td><span class="badge" :class="statusClass(promo.status)">{{ promo.status }}</span></td>
              <td>
                <button class="btn btn-sm btn-outline-secondary me-2" @click="openPromotionModal(promo)">수정</button>
                <button class="btn btn-sm btn-danger" @click="deletePromotion(promo.id)">삭제</button>
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
      <BaseEmptyState v-else message="조회된 프로모션이 없습니다." />
    </BaseCard>

    <!-- 프로모션 등록/수정 모달 -->
    <BaseModal v-model="isModalOpen">
      <template #header><h5>{{ isEditing ? '프로모션 수정' : '새 프로모션 등록' }}</h5></template>
      <form @submit.prevent="savePromotion">
        <div class="mb-3">
          <label class="form-label">프로모션명 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="promoForm.name" :class="{ 'is-invalid': !promoForm.name && formSubmitted }">
          <div class="invalid-feedback">프로모션명은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">기간 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="promoForm.period" placeholder="예: 2025-01-01 ~ 2025-01-31" :class="{ 'is-invalid': !promoForm.period && formSubmitted }">
          <div class="invalid-feedback">기간은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">대상</label>
          <input type="text" class="form-control" v-model="promoForm.target">
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
          <textarea class="form-control" rows="3" v-model="promoForm.description"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="savePromotion">저장</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>
