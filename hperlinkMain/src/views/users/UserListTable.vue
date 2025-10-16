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
  if (role === 'super_admin') return 'bg-danger';
  if (role === 'sub_admin') return 'bg-primary';
  if (role === 'store_manager') return 'bg-success';
  return 'bg-secondary';
};

const roleText = (role) => {
  if (role === 'super_admin') return '총괄 관리자';
  if (role === 'sub_admin') return '부관리자';
  if (role === 'store_manager') return '지점장';
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
              <input type="text" class="form-control form-control-sm" placeholder="이름/아이디 검색" v-model="searchTermModel">
            </div>
            <div class="me-2">
              <select class="form-select form-select-sm" v-model="filterRoleModel">
                <option value="all">전체 역할</option>
                <option value="super_admin">총괄 관리자</option>
                <option value="sub_admin">부관리자</option>
                <option value="store_manager">지점장</option>
              </select>
            </div>
            <button v-if="authStore.isSuperAdmin" class="btn btn-primary btn-sm" @click="emit('add-manager')">+ 지점장 추가</button>
          </div>
        </div>
      </template>
      
      <div v-if="users.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="emit('update:sort', 'name')" class="sortable">이름 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="name" /></th>
              <th @click="emit('update:sort', 'role')" class="sortable">역할 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="role" /></th>
              <th @click="emit('update:sort', 'joinDate')" class="sortable">가입일 <SortIcon :sortKey="sortKey" :sortOrder="sortOrder" currentKey="joinDate" /></th>
              <th v-if="authStore.isSuperAdmin">권한 변경</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>
                <span class="badge" :class="roleClass(user.role)">{{ roleText(user.role) }}</span>
              </td>
              <td>{{ user.joinDate }}</td>
              <td v-if="authStore.isSuperAdmin">
                <div class="dropdown" v-if="user.id !== authStore.user.id">
                  <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">변경</button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'super_admin' })">총괄 관리자</a></li>
                    <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'sub_admin' })">부관리자</a></li>
                    <li><a class="dropdown-item" href="#" @click.prevent="emit('change-role', { userId: user.id, role: 'store_manager' })">지점장</a></li>
                  </ul>
                </div>
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
