<script setup>
import { ref, computed } from 'vue';
import BaseCard from '@/components/BaseCard.vue';
import BaseEmptyState from '@/components/BaseEmptyState.vue';
import SortIcon from '@/components/SortIcon.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const props = defineProps({
  users: Array,
  totalUsers: Number,
  currentPage: Number,
  itemsPerPage: Number,
  sortKey: String,
  sortOrder: String,
  searchTerm: String,
  filterRole: String,
});

const emit = defineEmits([
  'change-role',
  'add-manager',
  'update:search-term',
  'update:filter-role',
  'update:sort',
  'update:page',
]);

// 검색어 및 필터 상태를 v-model로 바인딩하기 위한 computed 속성
const searchTermModel = computed({
  get: () => props.searchTerm,
  set: (value) => emit('update:search-term', value),
});

const filterRoleModel = computed({
  get: () => props.filterRole,
  set: (value) => emit('update:filter-role', value),
});

const totalPages = computed(() => Math.ceil(props.totalUsers / props.itemsPerPage));

const roleClass = (role) => {
  if (role === 'ADMIN') return 'bg-danger';
  if (role === 'MANAGER') return 'bg-primary';
  if (role === 'BRANCH_MANAGER') return 'bg-success';
  if (role === 'DRIVER') return 'bg-info';
  return 'bg-secondary';
};

const roleText = (role) => {
  if (role === 'ADMIN') return '총괄 관리자';
  if (role === 'MANAGER') return '중간 관리자';
  if (role === 'BRANCH_MANAGER') return '지점장';
  if (role === 'DRIVER') return '기사';
  return role;
};
</script>

<template>
  <div>
    <BaseCard>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">사용자 목록</h5>
          <div class="d-flex">
            <div class="me-2">
              <input type="text" class="form-control form-control-sm" placeholder="이름/이메일 검색" v-model="searchTermModel">
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterRoleModel">
                <option value="all">전체 역할</option>
                <option value="ADMIN">총괄 관리자</option>
                <option value="MANAGER">중간 관리자</option>
                <option value="BRANCH_MANAGER">지점장</option>
                <option value="DRIVER">기사</option>
              </select>
            </div>
            <button v-if="authStore.isAdmin" class="btn btn-primary btn-sm" @click="emit('add-manager')">+ 사용자 추가</button>
          </div>
        </div>
      </template>
      
      <div v-if="users.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="emit('update:sort', 'name')" class="sortable">이름 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="emit('update:sort', 'email')" class="sortable">이메일 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="email" /></th>
              <th @click="emit('update:sort', 'role')" class="sortable">역할 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="role" /></th>
              <th @click="emit('update:sort', 'region')" class="sortable">지역 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="region" /></th>
              
              <th v-if="authStore.isAdmin">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="badge" :class="roleClass(user.role)">{{ roleText(user.role) }}</span>
              </td>
              <td>{{ user.region }}</td>
              
              <td v-if="authStore.isAdmin">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="emit('edit-user', user)">수정</button>
                <button class="btn btn-sm btn-danger" @click="emit('delete-user', user.id)">삭제</button>
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
      <BaseEmptyState v-else message="조회된 사용자가 없습니다." />
    </BaseCard>
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}
</style>
