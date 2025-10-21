<script setup>
import { computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

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
]);

// 검색어 및 필터 상태를 v-model로 바인딩하기 위한 computed 속성
const searchTermModel = computed({
  get: () => props.searchTerm,
  set: (value) => emit('update:search-term', value),
});

const filterStatusModel = computed({
  get: () => props.filterStatus,
  set: (value) => emit('update:filter-status', value),
});

const totalPages = computed(() => Math.ceil(props.totalStores / props.itemsPerPage));

const statusClass = (status) => {
  switch (status) {
    case '영업 중': return 'bg-success';
    case '영업 종료': return 'bg-danger';
    case '휴점': return 'bg-warning';
    default: return 'bg-secondary';
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
            <input type="text" class="form-control form-control-sm" placeholder="매장명/주소 검색" v-model="searchTermModel">
          </div>
          <div class="me-2">
            <select class="form-select form-select-sm" v-model="filterStatusModel">
              <option value="all">전체 상태</option>
              <option value="운영중">운영중</option>
              <option value="휴점">휴점</option>
            </select>
          </div>
          <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm me-2" @click="emit('add-store')">+ 신규 매장 등록</button>
          <button v-if="authStore.isAdmin" class="btn btn-outline-secondary btn-sm" @click="emit('download-pdf')">PDF 다운로드</button>
          </div>
        </div>
      </template>
      
      <div v-if="stores.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="emit('update:sort', 'name')" class="sortable">매장명 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="emit('update:sort', 'address')" class="sortable">주소 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="address" /></th>
              <th>연락처</th>
              <th @click="emit('update:sort', 'status')" class="sortable">상태 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="status" /></th>
              <th v-if="authStore.isAdmin">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="store in stores" :key="store.id">
              <td>{{ store.name }}</td>
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