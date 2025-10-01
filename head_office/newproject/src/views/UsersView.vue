<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import UserListTable from './users/UserListTable.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseSpinner from '@/components/BaseSpinner.vue';
import { useToastStore } from '@/stores/toast';
import { useModalStore } from '@/stores/modal';
import { useUserStore } from '@/stores/users';

const toastStore = useToastStore();
const modalStore = useModalStore();
const userStore = useUserStore();

const isLoading = ref(true);

const isAddManagerModalOpen = ref(false);
const formSubmitted = ref(false);
const newManager = reactive({ name: '', username: '', password: '', joinDate: '' });

// 검색, 필터, 정렬, 페이지네이션 상태
const searchTerm = ref('');
const filterRole = ref('all');
const sortKey = ref('name');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = ref(5);

// --- 데이터 로딩 시뮬레이션 ---
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});

// --- 검색, 필터링, 정렬 로직 ---
const filteredAndSortedUsers = computed(() => {
  let users = [...userStore.allUsers];

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    users = users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.username.toLowerCase().includes(term)
    );
  }

  if (filterRole.value !== 'all') {
    users = users.filter(user => user.role === filterRole.value);
  }

  if (sortKey.value) {
    users.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return users;
});

// --- 페이지네이션 로직 ---
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedUsers.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAndSortedUsers.value.length / itemsPerPage.value));

// --- 이벤트 핸들러 ---
const updateSearchTerm = (term) => { searchTerm.value = term; currentPage.value = 1; };
const updateFilterRole = (role) => { filterRole.value = role; currentPage.value = 1; };
const updateSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
};
const updatePage = (page) => { 
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page; 
  }
};

const openAddManagerModal = () => {
  formSubmitted.value = false;
  Object.assign(newManager, { name: '', username: '', password: '', joinDate: '', role: 'store_manager' });
  isAddManagerModalOpen.value = true;
};

const addManager = () => {
  formSubmitted.value = true;
  if (!newManager.name || !newManager.username || !newManager.password || !newManager.joinDate) {
    toastStore.showToast('모든 항목을 입력해주세요.', 'danger');
    return;
  }
  userStore.addManager(newManager);
  toastStore.showToast('새 지점장이 추가되었습니다.', 'success');
  isAddManagerModalOpen.value = false;
  Object.assign(newManager, { name: '', username: '', password: '', joinDate: '' });
};

const changeUserRole = async ({ userId, role }) => {
  const user = userStore.allUsers.find(u => u.id === userId);
  if (user) {
    const confirmed = await modalStore.show({
      title: '역할 변경 확인',
      message: `'${user.name}' 사용자의 역할을 '${role}'(으)로 변경하시겠습니까?`,
      isConfirmation: true,
    });
    if (confirmed) {
      userStore.changeUserRole(userId, role);
      toastStore.showToast(`'${user.name}'의 역할이 '${role}'(으)로 변경되었습니다.`, 'success');
    }
  }
};
</script>

<template>
  <div>
    <UserListTable 
      :users="paginatedUsers"
      :totalUsers="filteredAndSortedUsers.length"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :sortKey="sortKey"
      :sortOrder="sortOrder"
      :searchTerm="searchTerm"
      :filterRole="filterRole"
      @change-role="changeUserRole"
      @add-manager="openAddManagerModal"
      @update:search-term="updateSearchTerm"
      @update:filter-role="updateFilterRole"
      @update:sort="updateSort"
      @update:page="updatePage"
    />

    <!-- 지점장 추가 모달 -->
    <BaseModal v-model="isAddManagerModalOpen">
      <template #header><h5>새 지점장 추가</h5></template>
      <form @submit.prevent="addManager">
        <div class="mb-3">
          <label class="form-label">이름 (매장명) <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newManager.name" :class="{ 'is-invalid': !newManager.name && formSubmitted }">
          <div class="invalid-feedback">이름은 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">아이디 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newManager.username" :class="{ 'is-invalid': !newManager.username && formSubmitted }">
          <div class="invalid-feedback">아이디는 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <input type="password" class="form-control" v-model="newManager.password" :class="{ 'is-invalid': !newManager.password && formSubmitted }">
          <div class="invalid-feedback">비밀번호는 필수입니다.</div>
        </div>
        <div class="mb-3">
          <label class="form-label">가입일 <span class="text-danger">*</span></label>
          <input type="text" class="form-control" v-model="newManager.joinDate" placeholder="예: 2024-01-01" :class="{ 'is-invalid': !newManager.joinDate && formSubmitted }">
          <div class="invalid-feedback">가입일은 필수입니다.</div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isAddManagerModalOpen = false">취소</button>
        <button type="button" class="btn btn-primary" @click="addManager">추가하기</button>
      </template>
    </BaseModal>

    <BaseSpinner v-if="isLoading" height="200px" />
  </div>
</template>