<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAsStore } from '@/stores/as';
import { useAuthStore } from '@/stores/auth';
import BaseCard from '@/components/BaseCard.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';

const asStore = useAsStore();
const authStore = useAuthStore();
const router = useRouter();

// Search and filter state
const searchTerm = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(15);

onMounted(() => {
  asStore.fetchAsRequests();
});

const goToDetail = (id) => {
  router.push({ name: 'asDetail', params: { id } });
};

const goToCreate = () => {
  router.push({ name: 'asCreate' });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-warning text-dark';
    case 'APPROVED': return 'bg-success';
    case 'REJECTED': return 'bg-danger';
    case 'COMPLETED': return 'bg-primary';
    case 'IN_PROGRESS': return 'bg-info text-dark';
    default: return 'bg-secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return '대기중';
    case 'APPROVED': return '처리중';
    case 'REJECTED': return '거절';
    case 'COMPLETED': return '완료';
    default: return status;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// Filtered and searched requests
const filteredRequests = computed(() => {
  let result = asStore.asRequests;

  // Apply search filter
  if (searchTerm.value.trim()) {
    const query = searchTerm.value.toLowerCase();
    result = result.filter(request => {
      const title = (request.title || '').toLowerCase();
      const storeName = (request.storeName || '').toLowerCase();
      return title.includes(query) || storeName.includes(query);
    });
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(request => request.status === statusFilter.value);
  }

  return result;
});

// Paginated requests
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRequests.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredRequests.value.length / itemsPerPage.value);
});

// Update handlers
const updateSearchTerm = (term) => {
  searchTerm.value = term;
  currentPage.value = 1;
};

const updateStatusFilter = (status) => {
  statusFilter.value = status;
  currentPage.value = 1;
};

const updateItemsPerPage = (count) => {
  itemsPerPage.value = count;
  currentPage.value = 1;
};

const updatePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <div class="as-list-view">
    <BaseSpinner v-if="asStore.isLoading" />

    <BaseCard v-else>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">AS 요청 목록</h5>
          <div class="d-flex">
            <div class="me-2">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="제목/매장명 검색"
                :value="searchTerm"
                @input="updateSearchTerm($event.target.value)"
              />
            </div>
            <div class="me-2">
              <select
                class="form-select form-select-sm"
                :value="statusFilter"
                @change="updateStatusFilter($event.target.value)"
              >
                <option value="all">전체 상태</option>
                <option value="PENDING">대기중</option>
                <option value="APPROVED">처리중</option>
                <option value="REJECTED">거절</option>
                <option value="COMPLETED">완료</option>
              </select>
            </div>
            <div class="me-2">
              <select
                class="form-select form-select-sm"
                :value="itemsPerPage"
                @change="updateItemsPerPage(Number($event.target.value))"
              >
                <option :value="10">10개씩</option>
                <option :value="15">15개씩</option>
                <option :value="20">20개씩</option>
              </select>
            </div>
            <button
              v-if="authStore.isBranchManager"
              class="btn btn-primary btn-sm"
              @click="goToCreate"
            >
              + AS 신청
            </button>
          </div>
        </div>
      </template>

      <div v-if="asStore.error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>{{ asStore.error }}
      </div>

      <div v-else-if="paginatedRequests.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th style="width: 8%">번호</th>
              <th style="width: 30%">제목</th>
              <th style="width: 18%">매장</th>
              <th style="width: 12%">상태</th>
              <th style="width: 18%">접수일</th>
              <th style="width: 14%" class="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in paginatedRequests" :key="request.id">
              <td class="fw-medium">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>
                <div class="text-truncate" style="max-width: 300px;" :title="request.title">
                  {{ request.title || '제목 없음' }}
                </div>
              </td>
              <td>
                <i class="bi bi-shop me-2 text-primary"></i>
                {{ request.storeName }}
              </td>
              <td>
                <span :class="['badge', getStatusBadgeClass(request.status)]">
                  {{ getStatusText(request.status) }}
                </span>
              </td>
              <td>
                <i class="bi bi-calendar-check me-2 text-muted"></i>
                {{ formatDate(request.createdAt) }}
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" @click="goToDetail(request.id)">
                  <i class="bi bi-eye me-1"></i>상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <nav v-if="totalPages > 1">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage - 1)">이전</a>
            </li>
            <li
              class="page-item"
              :class="{ active: page === currentPage }"
              v-for="page in totalPages"
              :key="page"
            >
              <a class="page-link" href="#" @click.prevent="updatePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="updatePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>

      <BaseEmptyState v-else message="조회된 AS 요청이 없습니다." />
    </BaseCard>
  </div>
</template>

<style scoped>
.as-list-view {
  padding: 20px;
}
</style>
