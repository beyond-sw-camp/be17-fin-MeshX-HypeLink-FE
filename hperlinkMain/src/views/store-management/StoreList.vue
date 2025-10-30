<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const currentPage = ref(1);

const props = defineProps({
  stores: Array,
  totalStores: Number,
  currentPage: Number,
  itemsPerPage: Number,
  sortKey: String,
  sortOrder: String,
  searchTerm: String,
  filterStatus: String,
});

const emit = defineEmits([
  'add-store',
  'download-pdf',
  'update:search-term',
  'update:filter-status',
  'update:sort',
  'update:page',
  'delete-store',
  'search',
]);

// 전체 데이터 복사
const localStores = ref([]);

// 마운트 시 복사
onMounted(() => {
  localStores.value = [...props.stores];
  handleSearch();
});

watch(
    () => props.stores,
    (newVal) => {
      if (Array.isArray(newVal) && newVal.length > 0) {
        localStores.value = [...newVal];
        handleSearch(); // 필터도 다시 반영
      }
    },
    { immediate: true } // props가 이미 들어와 있을 경우 즉시 실행
);

// 검색/필터용 반응형 값
const searchTerm = ref('');
const filterStatus = ref('all');

// 실제 검색 적용 상태 (버튼 누를 때만 변경)
const activeSearchTerm = ref('');
const activeStatusFilter = ref('all');

// 버튼 눌렸을 때만 검색어/필터 반영
// const handleSearch = () => {
//   activeSearchTerm.value = searchTerm.value;
//   activeStatusFilter.value = filterStatus.value;
//   currentPage.value = 1;
// };

// 검색 결과 필터링
const filteredStores = computed(() => {
  const keyword = activeSearchTerm.value.trim().toLowerCase();
  const status = activeStatusFilter.value;

  return localStores.value.filter(store => {
    const matchesKeyword =
        !keyword ||
        store.name?.toLowerCase().includes(keyword) ||
        store.address?.toLowerCase().includes(keyword);

    const matchesStatus =
        status === 'all' ||
        store.status === status ||
        (status === '운영중' && store.status === '영업 중');

    return matchesKeyword && matchesStatus;
  });
});

const totalPages = computed(() =>
    Math.ceil(filteredStores.value.length / props.itemsPerPage)
);

const statusClass = (status) => {
  switch (status) {
    case '영업 중': return 'bg-success';
    case '영업 종료': return 'bg-danger';
    case '휴점': return 'bg-warning';
    default: return 'bg-secondary';
  }
};

// 검색 실행 함수
const handleSearch = () => {
  emit('search');
};

// 엔터키 핸들러
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};

</script>

<template>
  <BaseCard>
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0">매장 목록</h5>
        <div class="d-flex">
          <div class="me-2">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="매장명/주소 검색"
              v-model="searchTermModel"
              @keypress="handleKeyPress">
          </div>
          <div class="me-2">
            <button class="btn btn-outline-primary btn-sm" @click="handleSearch">
              <i class="bi bi-search"></i> 검색
            </button>
          </div>
          <div class="me-2">
            <select class="form-select form-select-sm" v-model="filterStatus">
              <option value="all">전체 상태</option>
              <option value="영업 중">영업 중</option>
              <option value="휴점">휴점</option>
            </select>
          </div>
          <div class="me-2">
            <button class="btn btn-success btn-sm me-2" @click="handleSearch">
              🔍 검색
            </button>
          </div>
          <div class="me-2">
            <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm me-2" @click="emit('add-store')">+ 신규 매장 등록</button>
          </div>
          <div class="me-2">
            <button v-if="authStore.isAdmin" class="btn btn-outline-secondary btn-sm" @click="emit('download-pdf')">PDF 다운로드</button>
          </div>
          </div>
        </div>
      </template>

      <div v-if="stores.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="emit('update:sort', 'name')" class="sortable">매장명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="emit('update:sort', 'member.address')" class="sortable">주소 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="member.address" /></th>
              <th>매장 연락처</th>
              <th @click="emit('update:sort', 'status')" class="sortable">상태 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status" /></th>
              <th v-if="authStore.isAdmin">관리</th>
            </tr>
          </thead>
          <tbody>
          <tr v-for="store in filteredStores" :key="store.id">
            <td><router-link :to="`/store-detail/${store.id}`">{{ store.name }}</router-link></td>
            <td>{{ store.address }}</td>
            <td>{{ store.phone }}</td>
            <td><span class="badge" :class="statusClass(store.status)">{{ store.status }}</span></td>
            <td v-if="authStore.isAdmin">
              <button class="btn btn-sm btn-outline-secondary me-2" @click="emit('add-store', store)">수정</button>
              <button class="btn btn-sm btn-danger" @click="emit('delete-store', store.id)">삭제</button>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="emit('update:page', currentPage - 1)">이전</a>
            </li>
            <li class="page-item" :class="{ active: page === currentPage }" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="emit('update:page', page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="emit('update:page', currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
      <BaseEmptyState v-else message="조회된 매장이 없습니다." />
    </BaseCard>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}
</style>